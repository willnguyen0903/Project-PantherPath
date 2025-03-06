require("dotenv").config({ path: "./key.env" });
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const MARTA_API_KEY = process.env.MARTA_API_KEY;

// PostgreSQL connection setup
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(express.static(path.join(__dirname)));

// Serve HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/UI/transitSchedule.html"));
});

// User Registration (Uses `uid`, `username`, `password_hash`)
app.post("/register", async (req, res) => {
    const { email, username, password } = req.body;
    if (!email || !username || !password) return res.status(400).json({ message: "Missing fields" });

    try {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING uid",
            [username, email, password_hash]
        );
        res.status(201).json({ message: "User registered", uid: result.rows[0].uid });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Error registering user" });
    }
});

// User Login (Finds user by `username` and checks `password_hash`)
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (result.rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

        // Generate JWT with `uid`
        const token = jwt.sign({ uid: user.uid }, JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Error logging in" });
    }
});

// JWT Middleware for Protected Routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // `req.user.uid` now exists
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
};

// Protected Profile Route (Fetches user by `uid`)
app.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query("SELECT uid, username FROM users WHERE uid = $1", [req.user.uid]);
        if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Error fetching profile" });
    }
});

// Fetch MARTA Train Schedule
app.get("/marta/schedule", async (req, res) => {
    try {
        const response = await axios.get(`https://developerservices.itsmarta.com:18096/itsmarta/railrealtimearrivals/developerservices/traindata?apiKey=${MARTA_API_KEY}`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching MARTA schedule:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to retrieve MARTA rail schedule", details: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
