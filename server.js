// server.js - Currency Exchange Backend Proxy Server
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;
require('dotenv').config();


// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// API Configuration
const EXCHANGERATE_API_URL = 'https://api.exchangerate-api.com/v4';
const EXCHANGERATE_HOST_URL = 'https://api.exchangerate.host';

// Cache for storing historical data to reduce API calls
const cache = new Map();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

// Utility function to get cached data
function getCachedData(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

// Utility function to set cached data
function setCachedData(key, data) {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
}

// Route to get current exchange rate
app.get('/api/rates/current/:from/:to', async (req, res) => {
    try {
        const { from, to } = req.params;
        const cacheKey = `current_${from}_${to}`;
        
        // Check cache first
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        console.log(`Fetching current rate: ${from} -> ${to}`);
        
        // Try exchangerate.host first (better reliability)
        try {
            const response = await axios.get(`${EXCHANGERATE_HOST_URL}/latest?base=${from}&symbols=${to}`);
            const data = response.data;
            
            if (data.success && data.rates && data.rates[to]) {
                const result = {
                    rate: data.rates[to],
                    date: data.date,
                    base: data.base,
                    target: to,
                    source: 'exchangerate.host'
                };
                
                // Cache the result
                setCachedData(cacheKey, result);
                
                return res.json(result);
            }
        } catch (error) {
            console.warn('exchangerate.host failed, trying fallback:', error.message);
        }
        
        // Fallback to exchangerate-api.com
        const response = await axios.get(`${EXCHANGERATE_API_URL}/latest/${from}`);
        const data = response.data;
        
        if (data.rates && data.rates[to]) {
            const result = {
                rate: data.rates[to],
                date: data.date,
                base: data.base,
                target: to,
                source: 'exchangerate-api.com'
            };
            
            // Cache the result
            setCachedData(cacheKey, result);
            
            res.json(result);
        } else {
            res.status(404).json({ error: 'Currency pair not found' });
        }
    } catch (error) {
        console.error('Error fetching current rate:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch current exchange rate',
            details: error.message 
        });
    }
});

// Route to get historical exchange rates
// app.get('/api/rates/historical/:from/:to/:days', async (req, res) => {
//     try {
//         const { from, to, days } = req.params;
//         const numDays = parseInt(days) || 10;
//         const cacheKey = `historical_${from}_${to}_${numDays}`;

//         // Check cache
//         const cachedData = getCachedData(cacheKey);
//         if (cachedData) {
//             return res.json(cachedData);
//         }

//         console.log(`Fetching historical rates from ${from} to ${to} for ${numDays} days`);

//         const historicalData = [];
//         const errors = [];

//         // Fetch daily rates using /historical endpoint
//         for (let i = numDays; i >= 0; i--) {
//             const date = new Date();
//             date.setDate(date.getDate() - i);
//             const dateStr = date.toISOString().split('T')[0];
//             const apiKey = process.env.EXCHANGE_RATE_API_KEY;


//             try {
//                 if (i !== numDays) {
//                     await new Promise(resolve => setTimeout(resolve, 100)); // rate limit safety
//                 }

//                 const response = await axios.get('https://api.exchangerate.host/historical', {
//                     params: {
//                         access_key: apiKey,
//                         date: dateStr,
//                         source: from,
//                         currencies: to
//                     },
//                     timeout: 5000
//                 });

//                 const data = response.data;
//                 const rate = data.quotes?.[`${from.toUpperCase()}${to.toUpperCase()}`];

//                 if (data.success && rate) {
//                     historicalData.push({
//                         date: dateStr,
//                         rate
//                     });
//                 } else {
//                     errors.push(`Missing rate for ${dateStr}`);
//                 }

//             } catch (error) {
//                 console.warn(`Failed to fetch data for ${dateStr}:`, error.message);
//                 errors.push(`Error for ${dateStr}: ${error.message}`);
//             }
//         }

//         if (historicalData.length > 0) {
//             const result = {
//                 from,
//                 to,
//                 data: historicalData,
//                 dataPoints: historicalData.length,
//                 source: 'exchangerate.host',
//                 method: 'historical',
//                 errors: errors.slice(0, 3)
//             };

//             setCachedData(cacheKey, result);
//             return res.json(result);
//         }

//         // If no data, try to generate mock data
//         console.log('All historical API calls failed. Generating mock data...');
//         try {
//             const currentResponse = await axios.get('https://api.exchangerate.host/latest', {
//                 params: {
//                     base: from,
//                     symbols: to
//                 }
//             });

//             const currentRate = currentResponse.data?.rates?.[to];
//             const mockData = generateRealisticHistoricalData(currentRate, numDays);

//             const result = {
//                 from,
//                 to,
//                 data: mockData,
//                 dataPoints: mockData.length,
//                 isMockData: true,
//                 source: 'generated',
//                 message: 'Real historical data unavailable, using simulated data',
//                 errors: errors.slice(0, 3)
//             };

//             return res.json(result);
//         } catch (fallbackErr) {
//             const mockData = generateRealisticHistoricalData(getMockRate(from, to), numDays);

//             return res.json({
//                 from,
//                 to,
//                 data: mockData,
//                 dataPoints: mockData.length,
//                 isMockData: true,
//                 source: 'generated',
//                 message: 'All APIs failed, using completely simulated data'
//             });
//         }

//     } catch (err) {
//         console.error('Error fetching historical rates:', err.message);
//         res.status(500).json({
//             error: 'Failed to fetch historical exchange rates',
//             details: err.message
//         });
//     }
// });


// Route to get all supported currencies
app.get('/api/currencies', async (req, res) => {
    try {
        const cacheKey = 'currencies';
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const response = await axios.get(`${EXCHANGERATE_HOST_URL}/symbols`);
        const data = response.data;
        
        if (data.success && data.symbols) {
            const currencies = Object.keys(data.symbols);
            
            const result = {
                currencies: currencies.sort(),
                count: currencies.length,
                source: 'exchangerate.host'
            };
            
            // Cache for longer since currencies don't change often
            cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });
            
            res.json(result);
        } else {
            throw new Error('Failed to fetch currencies from exchangerate.host');
        }
    } catch (error) {
        console.error('Error fetching currencies:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch supported currencies',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        cacheSize: cache.size
    });
});

// Generate realistic historical data (fallback function)
function generateRealisticHistoricalData(currentRate, days) {
    const data = [];
    
    for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Create more realistic variations that can create "good" and "bad" periods
        const baseVolatility = 0.015; // 1.5% daily volatility
        const trendFactor = Math.sin(i / 10) * 0.05; // 5% trend variation
        const randomFactor = (Math.random() - 0.5) * baseVolatility;
        
        // Add some "events" that cause bigger moves
        let eventFactor = 0;
        if (i === 20 || i === 15 || i === 8) {
            eventFactor = (Math.random() - 0.5) * 0.08; // 8% event moves
        }
        
        const rate = currentRate * (1 + trendFactor + randomFactor + eventFactor);
        
        data.push({
            date: date.toISOString().split('T')[0],
            rate: parseFloat(rate.toFixed(4))
        });
    }
    
    return data;
}

// Mock rate function for complete fallback
function getMockRate(from, to) {
    const rates = {
        'USD-EUR': 0.85, 'USD-GBP': 0.75, 'USD-JPY': 110, 'USD-AUD': 1.35,
        'USD-CAD': 1.25, 'USD-CHF': 0.92, 'USD-CNY': 6.45, 'USD-ZAR': 15.2,
        'EUR-USD': 1.18, 'EUR-GBP': 0.88, 'GBP-USD': 1.33, 'GBP-EUR': 1.14,
        'JPY-USD': 0.0091, 'AUD-USD': 0.74, 'CAD-USD': 0.80, 'CHF-USD': 1.09
    };
    
    const key = `${from}-${to}`;
    return rates[key] || (1 / (rates[`${to}-${from}`] || 1));
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Currency Exchange Proxy Server running on port ${PORT}`);
    console.log(`📊 API Endpoints:`);
    console.log(`   GET /api/rates/current/:from/:to`);
    console.log(`   GET /api/rates/historical/:from/:to/:days`);
    console.log(`   GET /api/currencies`);
    console.log(`   GET /health`);
    console.log(`\n🌐 Using APIs:`);
    console.log(`   Primary: exchangerate.host (better historical data)`);
    console.log(`   Fallback: exchangerate-api.com`);
    console.log(`\n💡 Example usage:`);
    console.log(`   Current rate: http://localhost:${PORT}/api/rates/current/USD/EUR`);
    console.log(`   Historical:   http://localhost:${PORT}/api/rates/historical/USD/EUR/30`);
});

module.exports = app;