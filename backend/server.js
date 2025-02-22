require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const cors = require('cors');

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
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING user_id",
            [username, email, hashedPassword]
        );
        res.json({ message: "User registered successfully!", userId: result.rows[0].user_id });
    } catch (error) {
        console.error("Error inserting user:", error);
        res.status(500).json({ message: "Register Failed: Email Taken" });
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

        res.json({ message: "Login successful!", userId: user.user_id });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Database error" });
    }
});

// Start the Server
app.listen(3000, () => console.log("Server running on port 3000"));
