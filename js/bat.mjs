import dotenv from 'dotenv';
dotenv.config();

// Import necessary modules (if needed)
import fetch from 'node-fetch';

const cors = require('cors');
const allowedOrigins = ['https://nurafianzulkifli.github.io/nrfz-dev', 'http://localhost:5500'];

app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));

// API endpoint and keys
const API_BASE_URL = "https://bat-lta-5a035f9d4a02.herokuapp.com";
const LTA_ACCOUNT_KEY = process.env.LTA_ACCOUNT_KEY; // Ensure this is loaded from your .env file

const response = await fetch(`${API_BASE_URL}/get-bus-arrivals`, { mode: 'no-cors' });

// Function to fetch bus arrivals directly from the API
export const fetchBusArrivals = async () => {
    try {
        // Make the API request
        const response = await fetch(`${API_BASE_URL}/get-bus-arrivals`, {
            method: 'GET',
            headers: {
                'AccountKey': LTA_ACCOUNT_KEY, // Include the LTA account key in the headers
                'Content-Type': 'application/json',
            },
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();

        // Log or return the data
        console.log('Bus Arrivals:', data);
        return data;
    } catch (error) {
        console.error('Error fetching bus arrivals:', error);
        throw error;
    }
};

// Example usage
fetchBusArrivals()
    .then((data) => {
        console.log('Fetched bus arrivals successfully:', data);
    })
    .catch((error) => {
        console.error('Failed to fetch bus arrivals:', error);
    });