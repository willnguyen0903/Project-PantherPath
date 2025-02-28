require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken'); 

const app = express();
app.use(express.json());
app.use(cors()); // Allow frontend to access backend

// PostgreSQL Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }  // Required for Render PostgreSQL
});

// User Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING uid",
            [username, email, hashedPassword]
        );
        res.json({ message: "User registered successfully!", uid: result.rows[0].uid });
    } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).json({ message: "Register Failed: Try different email" });
    }
});

// User Login Route


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const isValid = await bcrypt.compare(password, user.password_hash);

        if (!isValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN
        });

        res.json({ message: "Login successful!", token });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Database error" });
    }
});

// JWT Middleware for Protected Routes
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token from "Bearer TOKEN"
    
    if (!token) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
};

// Protected Route Example
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT uid, username, email FROM users WHERE uid = $1", [req.user.uid]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

// Start the Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

