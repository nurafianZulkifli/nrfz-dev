import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const app = express();
const port = 3000;

const supabaseUrl = 'https://umwzyyussvyzgdrqhoir.supabase.co';
const supabaseKey = 'sb_publishable_ejFNl66l6ML87merySO9Wg_2TukDnZ7'; // Keep this secure
const supabase = createClient(supabaseUrl, supabaseKey);

const ltaAccountKey = 'x4qNELfkS8O3YhQUQpQV8A=='; // Keep this secure

app.use(cors());

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
      serviceno: service.ServiceNo, // Change to lowercase
      operator: service.Operator, // Change to lowercase
      estimatedarrival: service.NextBus.EstimatedArrival, // Change to lowercase
      latitude: service.NextBus.Latitude, // Change to lowercase
      longitude: service.NextBus.Longitude, // Change to lowercase
      load: service.NextBus.Load, // Change to lowercase
      feature: service.NextBus.Feature, // Change to lowercase
      type: service.NextBus.Type, // Change to lowercase
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});