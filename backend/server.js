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
  const giphyApiKey = process.env.GIPHY_API_KEY;
  
  // --- UPDATED: Now accepts a userId ---
  const { message, isThankYou, userId } = req.body;

  if (!discordWebhookUrl) {
    console.error("Discord Webhook URL is not set.");
    return res.status(500).json({ error: 'Server configuration error.' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  try {
    let payload;

    if (isThankYou) {
      // Handle Thank You GIFs
      const giphySearchUrl = `https://api.giphy.com/v1/gifs/random?api_key=${giphyApiKey}&tag=toilet&rating=g`;
      const giphyResponse = await axios.get(giphySearchUrl);
      const gifUrl = giphyResponse.data.data.images.original.url;

      payload = {
        content: `**Thank you, ${message}!** Great job!`,
        embeds: [{ image: { url: gifUrl } }]
      };
    } else if (userId) {
      // --- NEW: If a userId is provided, create a tagged message ---
      payload = {
        // This format <@USER_ID> creates a tag in Discord
        content: `**Chore Reminder:** <@${userId}> is next to clean the bathroom.`
      };
    } else {
      // This is a normal text notification (Warning, Urgent)
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
