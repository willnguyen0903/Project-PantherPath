const express = require('express');
const app = express();
const port = 3000;

// Helps understand the incoming request
app.use(express.json());

// API routes
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});