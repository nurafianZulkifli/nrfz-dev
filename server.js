const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LTA_API_KEY = process.env.LTA_API_KEY;

// Enable CORS with explicit configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Define all API routes BEFORE static file serving
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

// Define the /bus-stops route with skip support
app.get('/bus-stops', async (req, res) => {
  try {
    const skip = parseInt(req.query.$skip) || 0;
    const limit = parseInt(req.query.$limit) || 500;
    const end = req.query.$end === 'true';

    let busStops = [];
    let currentSkip = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const response = await axios.get(`https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${currentSkip}`, {
        headers: {
          AccountKey: LTA_API_KEY,
          accept: 'application/json',
        },
      });

      const data = response.data.value;

      if (data.length === 0) {
        hasMoreData = false;
      } else {
        busStops = busStops.concat(data);
        currentSkip += 500;
      }
    }

    let paginatedBusStops;
    if (end) {
      paginatedBusStops = busStops.slice(-limit);
    } else {
      paginatedBusStops = busStops.slice(skip, skip + limit);
    }

    res.json({ value: paginatedBusStops });
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
    const { latitude, longitude, radius = 2 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).send('Latitude and Longitude are required');
    }

    let busStops = [];
    let skip = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const response = await axios.get(`https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`, {
        headers: {
          AccountKey: LTA_API_KEY,
          accept: 'application/json',
        },
      });

      const data = response.data.value;
      busStops = busStops.concat(data);

      if (data.length < 500) {
        hasMoreData = false;
      } else {
        skip += 500;
      }
    }

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
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 4);

    res.json(nearbyBusStops);
  } catch (error) {
    console.error('Error fetching nearby bus stops:', error.message);
    res.status(500).send('Error connecting to LTA DataMall');
  }
});

// Define the /train-service-alerts route
app.get('/train-service-alerts', async (req, res) => {
  try {
    const response = await axios.get('https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts', {
      headers: {
        AccountKey: LTA_API_KEY,
        accept: 'application/json',
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching train service alerts from LTA:', error.message);
    res.status(500).send('Error connecting to LTA DataMall');
  }
});

// Define the /first-last-bus route - scrapes businterchange.net
app.get('/first-last-bus', async (req, res) => {
  try {
    const { stop } = req.query;

    if (!stop) {
      return res.status(400).json({ error: 'Bus stop code is required' });
    }

    // Fetch the page from businterchange.net
    const url = `https://businterchange.net/sgbus/stops/busstop.php?stop=${encodeURIComponent(stop)}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Parse the HTML
    const $ = cheerio.load(response.data);
    const busServices = [];

    // Find all tables with id='routedetails' that contain bus service information
    $('table[id="routedetails"]').each((tableIndex, table) => {
      const rows = $(table).find('tr');
      
      // Skip the header tables (they don't have service info)
      if (rows.length < 3) return;

      let serviceNumber = '';
      let routeName = '';
      let serviceData = {};

      rows.each((rowIndex, row) => {
        const cells = $(row).find('td');
        const cellCount = cells.length;

        if (rowIndex === 0) {
          // First row has service number and route name
          if (cellCount >= 2) {
            const firstCell = $(cells[0]).text().trim();
            const secondCell = $(cells[1]).text().trim();
            
            serviceNumber = firstCell;
            routeName = secondCell;
          }
        } else if (rowIndex === 1) {
          // Second row is the header row with "First Bus" and "Last Bus"
          // We'll use this to confirm we're in the right place
          const headerText = $(row).text();
          if (!headerText.includes('First Bus') || !headerText.includes('Last Bus')) {
            return;
          }
        } else {
          // Data rows (Weekdays, Saturdays, etc.)
          if (cellCount >= 3) {
            const dayType = $(cells[0]).text().trim();
            const firstBus = $(cells[1]).text().trim();
            const lastBus = $(cells[2]).text().trim();

            if (dayType && firstBus && lastBus) {
              serviceData[dayType] = { firstBus, lastBus };
            }
          }
        }
      });

      // Only add if we found valid service data
      if (serviceNumber && Object.keys(serviceData).length > 0) {
        busServices.push({
          service: serviceNumber,
          routeName: routeName,
          timings: serviceData
        });
      }
    });

    if (busServices.length === 0) {
      return res.status(404).json({ error: 'No bus services found for this stop' });
    }

    res.json({
      busStopCode: stop,
      busServices: busServices,
      scrapedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error scraping first/last bus data:', error.message);
    res.status(500).json({ error: 'Error scraping bus timings', details: error.message });
  }
});

// Serve static files (after all API routes to prevent conflicts)
app.use(express.static(path.join(__dirname))); // Serve all static files from root
app.use('/buszy', express.static(path.join(__dirname, 'buszy'))); // Serve buszy folder
app.use('/rail-buddy', express.static(path.join(__dirname, 'rail-buddy'))); // Serve rail-buddy folder

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});