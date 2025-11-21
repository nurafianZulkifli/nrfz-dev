import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://nurafianzulkifli.github.io/nrfz-dev', // Production
            'http://localhost:5500'              // Development
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
}));


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const ltaAccountKey = process.env.LTA_ACCOUNT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const PORT = process.env.PORT || 3000; // Use Heroku's port or default to 3000

import path from 'path';
import { fileURLToPath } from 'url';

// Serve static files from the "bat" directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../bat')));

// Default route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../bat/bus-arr.html'));
});

app.get('/bus-arrivals', async (req, res) => {
  try {
    // Fetch data from LTA DataMall API
    const ltaResponse = await axios.get(
      'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=45401',
      {
        headers: {
          AccountKey: ltaAccountKey,
          accept: 'application/json',
        },
      }
    );

    const ltaData = ltaResponse.data.Services;

    // Preprocess the data to match Supabase schema
    const processedData = ltaData.map((service) => ({
      serviceno: service.ServiceNo,
      operator: service.Operator,
      estimatedarrival: service.NextBus.EstimatedArrival,
      latitude: service.NextBus.Latitude,
      longitude: service.NextBus.Longitude,
      load: service.NextBus.Load,
      feature: service.NextBus.Feature,
      type: service.NextBus.Type,
    }));

    // Insert processed data into Supabase
    const { data, error } = await supabase
      .from('bus_arrivals')
      .insert(processedData);

    if (error) {
      console.error('Error inserting data into Supabase:', error);
      return res.status(500).json({ error: 'Failed to insert data into Supabase' });
    }

    res.json({ message: 'Data successfully inserted into Supabase', data });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from LTA DataMall' });
  }
});

app.get('/get-bus-arrivals', async (req, res) => {
  console.log('Received request for /get-bus-arrivals');
  try {
    const { data, error } = await supabase.from('bus_arrivals').select('*');
    if (error) {
      console.error('Error fetching data from Supabase:', error);
      return res.status(500).json({ error: 'Failed to fetch data from Supabase' });
    }
    console.log('Data fetched from Supabase:', data);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch data from Supabase' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});