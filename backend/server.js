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
  // --- NEW: Get the Giphy API key from environment variables ---
  const giphyApiKey = process.env.GIPHY_API_KEY;
  
  const { message, isThankYou } = req.body;

  if (!discordWebhookUrl || !giphyApiKey) {
    console.error("Discord Webhook URL or Giphy API Key is not set.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    let payload;

    // --- NEW: Check if this is a "thank you" notification ---
    if (isThankYou) {
      // 1. Search Giphy for a random GIF
      const giphySearchUrl = `https://api.giphy.com/v1/gifs/random?api_key=${giphyApiKey}&tag=cleaning,thankyou&rating=g`;
      const giphyResponse = await axios.get(giphySearchUrl);
      const gifUrl = giphyResponse.data.data.images.original.url;

      // 2. Create the embed payload for Discord
      payload = {
        content: `**Thank you, ${message}!** Great job!`,
        embeds: [{ image: { url: gifUrl } }]
      };
    } else {
      // This is a normal text notification (e.g., a reminder)
      payload = {
        content: message
      };
    }

    await axios.post(discordWebhookUrl, payload);
    res.status(200).json({ success: true, message: 'Notification sent.' });

  } catch (error) {
    console.error('Error processing notification:', error.message);
    res.status(500).json({ error: 'Failed to send notification.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
