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
    // Get the BusStopCode from the query parameters
    const busStopCode = req.query.BusStopCode;

    if (!busStopCode) {
      return res.status(400).send('BusStopCode is required');
    }

    const response = await axios.get(`https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${busStopCode}`, {
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

// Define the /bus-stops route
app.get('/bus-stops', async (req, res) => {
  try {
    const response = await axios.get('https://datamall2.mytransport.sg/ltaodataservice/BusStops', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching bus stops from LTA:', error.message);
    res.status(500).send('Error connecting to LTA DataMall');
  }
});

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

// Define the /nearby-bus-stops route
app.get('/nearby-bus-stops', async (req, res) => {
  try {
    const { latitude, longitude, radius = 1 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).send('Latitude and Longitude are required');
    }

    const response = await axios.get('https://datamall2.mytransport.sg/ltaodataservice/BusStops', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

    const busStops = response.data.value;

    // Calculate distances and find the nearest bus stop
    const nearbyBusStops = busStops
      .map((busStop) => {
        const distance = calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          busStop.Latitude,
          busStop.Longitude
        );
        return { ...busStop, distance };
      })
      .filter((busStop) => busStop.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    // Return the nearest bus stop
    res.json(nearbyBusStops.length > 0 ? nearbyBusStops[0] : null);
  } catch (error) {
    console.error('Error fetching nearby bus stops:', error.message);
    res.status(500).send('Error connecting to LTA DataMall');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});