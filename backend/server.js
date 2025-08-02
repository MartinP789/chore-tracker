// File: backend/server.js

// Import necessary packages
const express = require('express');
const cors = require('cors');
const axios = require('axios');

// This allows us to use the .env file for the secret URL during local testing
require('dotenv').config();

// Create the Express app
const app = express();
const port = process.env.PORT || 3000; // Render will set the PORT environment variable

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing so your frontend can talk to this backend
app.use(express.json()); // Allow the server to understand JSON formatted requests

// --- The Main Notification Endpoint ---
// Your frontend will send requests to this URL path: /notify
app.post('/notify', async (req, res) => {
  // Get the secret Discord Webhook URL from environment variables.
  // This is the secure way to handle secrets.
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  
  // Get the message from the request sent by the frontend
  const { message } = req.body;

  // --- Basic Validation ---
  if (!discordWebhookUrl) {
    console.error("Discord Webhook URL is not set in environment variables.");
    // Send an error response back to the frontend
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  // --- Send the message to Discord ---
  try {
    // We format the data exactly as the Discord API expects it.
    const payload = {
      content: message
    };

    // Use axios to send the POST request to Discord's Webhook URL
    await axios.post(discordWebhookUrl, payload);
    
    // If successful, send a success response back to the frontend
    res.status(200).json({ success: true, message: 'Notification sent.' });

  } catch (error) {
    console.error('Error sending notification to Discord:', error.message);
    res.status(500).json({ error: 'Failed to send notification.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```json
// File: backend/package.json

{
  "name": "chore-tracker-backend",
  "version": "1.0.0",
  "description": "Backend for sending Discord notifications.",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  }
}
