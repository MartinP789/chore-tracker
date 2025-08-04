// File: backend/server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/notify', async (req, res) => {
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  // --- NEW: Destructure both message and an optional gifUrl from the request ---
  const { message, gifUrl } = req.body;

  if (!discordWebhookUrl) {
    console.error("Discord Webhook URL is not set.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    let payload;

    // --- NEW: Check if a gifUrl was provided ---
    if (gifUrl) {
      // If we have a GIF, create a special "embed" payload for Discord
      payload = {
        content: `**Thank you, ${message}!**`, // The name will be in the message
        embeds: [{
          image: {
            url: gifUrl
          }
        }]
      };
    } else {
      // If no GIF, send a normal text message
      payload = {
        content: message
      };
    }

    await axios.post(discordWebhookUrl, payload);
    res.status(200).json({ success: true, message: 'Notification sent.' });

  } catch (error) {
    console.error('Error sending notification to Discord:', error.message);
    res.status(500).json({ error: 'Failed to send notification.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
