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
  ssl: { rejectUnauthorized: false },
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// NavedN -- Testing if this fixes an issue
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Serve HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/UI/transitSchedule.html"));
});

// User Registration (Uses `email`, `username`, `password_hash`)
app.post("/register", async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING uid",
      [email, username, password_hash]
    );
    res
      .status(201)
      .json({ message: "User registered", uid: result.rows[0].uid });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// User Login (Finds user by `username` and checks `password_hash`)
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // generate token and ensure user id is included in token
    const payload = { userId: user.uid };
    console.log("Payload before signing token:", payload); // Debugging

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    console.log("Generated Token:", token); // Debugging

    res.json({ message: "Login successful!", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Database error" });
  }
});

// JWT Middleware for Protected Routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  console.log("Received auth header:", authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded Token:", decoded); // Debugging

    if (!decoded.userId) {
      return res
        .status(400)
        .json({ message: "Invalid token payload: missing userId" });
    }

    req.user = { userId: decoded.userId }; // Standardize to use userId everywhere
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Invalid token. Try to log in!" });
  }
};

// Protected Profile Route (Fetches user by `uid`)
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT uid, username FROM users WHERE uid = $1",
      [req.user.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// Fetch MARTA Train Schedule
app.get("/marta/schedule", async (req, res) => {
  try {
    const response = await axios.get(
      `https://developerservices.itsmarta.com:18096/itsmarta/railrealtimearrivals/developerservices/traindata?apiKey=${MARTA_API_KEY}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching MARTA schedule:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Failed to retrieve MARTA rail schedule",
      details: error.message,
    });
  }
});
// report incident
app.post("/report-incident", authenticateToken, async (req, res) => {
  const { location, description } = req.body;
  const user_id = req.user.userId; // Get user ID from the authenticated token

  try {
    // First get the username from the user_id
    const userResult = await pool.query(
      "SELECT username FROM users WHERE uid = $1",
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const username = userResult.rows[0].username;

    const result = await pool.query(
      `
        INSERT INTO incident_report (user_id, username, location, description, upvotes, downvotes)
        VALUES ($1, $2, $3, $4, 0, 0)
        RETURNING *;
      `,
      [user_id, username, location, description]
    );

    res.json({
      message: "Incident reported successfully!",
      report: result.rows[0],
    });
  } catch (err) {
    console.error("Error inserting incident:", err);
    res.status(500).json({ message: "Error reporting incident." });
  }
});
// fetch reports menu
app.get("/incident-reports", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT * FROM incident_report
            WHERE timestamp >= NOW() - INTERVAL '2 hours'
            ORDER BY timestamp DESC
        `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ message: "Error fetching reports" });
  }
});
//upvote & downvote
app.post("/incident-report/:id/vote", authenticateToken, async (req, res) => {
  const { vote_type } = req.body; // 'upvote' or 'downvote'
  const user_id = req.user.userId; // Extract userId from decoded token
  const report_id = req.params.id;

  if (!user_id) {
    return res.status(400).json({ message: "User ID missing" });
  }

  try {
    // Check if user has already voted
    const existingVote = await pool.query(
      `SELECT vote_type FROM user_votes WHERE user_id = $1 AND report_id = $2`,
      [user_id, report_id]
    );

    if (existingVote.rows.length > 0) {
      const currentVote = existingVote.rows[0].vote_type;

      if (currentVote === vote_type) {
        return res
          .status(400)
          .json({ message: `You have already ${vote_type}d this report.` });
      } else {
        // Swap upvote ↔ downvote
        await pool.query(
          `UPDATE incident_report SET 
                        upvotes = upvotes + CASE WHEN $1 = 'upvote' THEN 1 ELSE -1 END,
                        downvotes = downvotes + CASE WHEN $1 = 'downvote' THEN 1 ELSE -1 END
                     WHERE report_id = $2`,
          [vote_type, report_id]
        );

        await pool.query(
          `UPDATE user_votes SET vote_type = $1 WHERE user_id = $2 AND report_id = $3`,
          [vote_type, user_id, report_id]
        );

        return res.json({
          message: `Your vote has been changed to ${vote_type}.`,
        });
      }
    } else {
      // New vote
      await pool.query(
        `INSERT INTO user_votes (user_id, report_id, vote_type) VALUES ($1, $2, $3)`,
        [user_id, report_id, vote_type]
      );

      await pool.query(
        `UPDATE incident_report SET 
                    upvotes = upvotes + CASE WHEN $1 = 'upvote' THEN 1 ELSE 0 END,
                    downvotes = downvotes + CASE WHEN $1 = 'downvote' THEN 1 ELSE 0 END
                 WHERE report_id = $2`,
        [vote_type, report_id]
      );

      return res.json({ message: `You have ${vote_type}d this report.` });
    }
  } catch (err) {
    console.error("Vote error:", err);
    res.status(500).json({
      message: "Failed to process vote",
      error: err.message,
    });
  }
});

// Saving Routes Feature
app.post("/save-route", authenticateToken, async (req, res) => {
  const {
    route_name,
    start_location,
    end_location,
    transport_mode,
    waypoints,
  } = req.body;
  const user_id = req.user.userId;

  // Validation
  if (!route_name || !start_location || !end_location || !transport_mode) {
    return res.status(400).json({
      message: "Missing required fields",
      required: [
        "route_name",
        "start_location",
        "end_location",
        "transport_mode",
      ],
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO saved_routes 
         (user_id, route_name, start_location, end_location, transport_mode, waypoints) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
      [
        user_id,
        route_name,
        start_location,
        end_location,
        transport_mode,
        waypoints ? JSON.stringify(waypoints) : null,
      ]
    );

    res.status(201).json({
      message: "Route saved successfully",
      route: result.rows[0],
    });
  } catch (err) {
    console.error("Database error:", err.stack);
    res.status(500).json({
      message: "Error saving route",
      error: err.message,
      hint: "Check if waypoints is valid JSON array",
    });
  }
});

// Loads all saved routes for a user
app.get("/saved-routes", authenticateToken, async (req, res) => {
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT route_id, route_name, start_location, 
                end_location, transport_mode, created_at
         FROM saved_routes 
         WHERE user_id = $1 
         ORDER BY created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).json({ message: "Error fetching saved routes" });
  }
});

// Delete a saved route
app.delete("/saved-routes/:id", authenticateToken, async (req, res) => {
  const route_id = req.params.id;
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `DELETE FROM saved_routes 
         WHERE route_id = $1 AND user_id = $2 
         RETURNING *`,
      [route_id, user_id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "Route not found or not owned by user" });
    }

    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error("Error deleting route:", err);
    res.status(500).json({ message: "Error deleting route" });
  }
});

// GET SINGLE ROUTE
app.get("/saved-routes/:id", authenticateToken, async (req, res) => {
  const route_id = req.params.id;
  const user_id = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT * FROM saved_routes 
         WHERE route_id = $1 AND user_id = $2`,
      [route_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching route:", err);
    res.status(500).json({ message: "Error fetching route" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
