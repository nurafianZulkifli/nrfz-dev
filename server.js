const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const LTA_API_KEY = process.env.LTA_API_KEY;

app.use(cors()); // Enable CORS

// Define the /bus-arrivals route
app.get('/bus-arrivals', async (req, res) => {
  try {
    const response = await axios.get('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=45401', {
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