const express = require('express');
const fetch = require('node-fetch');
const app = express();

const PORT = process.env.PORT || 3000;

// Add this CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.get('/api/tsa', async (req, res) => {
    try {
        const response = await fetch('https://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts', {
            method: 'GET',
            headers: {
                'AccountKey': 'x4qNELfkS8O3YhQUQpQV8A==',
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));