const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000; // Use Heroku's dynamic port or default to 3000

const LTA_API_KEY = process.env.LTA_API_KEY; // Store your API key in environment variables

// Define the route
app.get('/bus-arrivals', async (req, res) => {
  try {
    const response = await axios.get('http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from LTA:', error.message);
    res.status(500).send('Error connecting to LTA DataMall');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});