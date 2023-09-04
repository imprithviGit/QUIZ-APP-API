// Importing necessary modules and setting up an Express server
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();

// Applying middlewares for CORS support, JSON parsing, and serving static files
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Defining a route to fetch questions based on user input
app.get('/fetch-questions', async (req, res) => {
    let category = "";

    // Determining the question category based on user selection
    if (req.query.user === "1") {
        category = "9";  // General Knowledge
    } else if (req.query.user === "2") {
        category = "18";  // Computers
    }

    // Constructing the API URL for fetching questions
    const apiUrl = `https://opentdb.com/api.php?amount=5&category=${category}`;

    try {
        // Sending a request to the API
        const response = await fetch(apiUrl);

        if (response.ok) {
            // Parsing the response JSON and sending it back
            const data = await response.json();
            res.json(data);
        } else {
            // Handling errors if the API request fails
            res.status(500).json({ error: 'Failed to fetch questions from Open Trivia DB.' });
        }
    } catch (error) {
        // Handling errors if there is an issue with the request
        res.status(500).json({ error: 'Failed to fetch questions.' });
    }
});

// Serving the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serving User 1's quiz
app.get('/user1', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user1.html'));
});

// Serving the scorecard
app.get('/scorecard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/scorecard.html'));
});

// Serving User 2's quiz
app.get('/user2', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/user2.html'));
});

// Configuring the server to listen on a specified port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
