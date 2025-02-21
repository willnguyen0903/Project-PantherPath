require("dotenv").config({path: './key.env'});

const express = require("express");
const axios = require("axios");

const app = express();
const PORT = 3000;

// Help understand the incoming request.
app.use(express.json());

// Fetch real-time MARTA rail schedule
app.get("/marta/schedule", async (req, res) => {
    try {
        const response = await axios.get(`https://developerservices.itsmarta.com:18096/itsmarta/railrealtimearrivals/developerservices/traindata?apiKey=${process.env.MARTA_API_KEY}`);
        
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching MARTA schedule:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to retrieve MARTA rail schedule", details: error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/marta/schedule`);
});
