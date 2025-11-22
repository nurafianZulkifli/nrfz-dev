const express = require('express');
const axios = require('axios');
const router = express.Router();

const LTA_API_KEY = process.env.LTA_API_KEY; // Store your API key in environment variables

router.get('/bus-arrivals', async (req, res) => {
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

module.exports = router;