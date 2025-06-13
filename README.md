# Smart Travel Currency Forecaster - Backend Setup Guide

## 🚀 Quick Start

### 1. Setup Backend Server

**Install Node.js** (if you haven't already):

- Download from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

**Create project directory:**

```bash
mkdir currency-forecaster-backend
cd currency-forecaster-backend
```

**Save the files:**

- Copy `server.js` content to `server.js`
- Copy `package.json` content to `package.json`

**Install dependencies:**

```bash
npm install
```

**Start the server:**

```bash
npm start
```

You should see:

```
🚀 Currency Exchange Proxy Server running on port 3000
📊 API Endpoints:
   GET /api/rates/current/:from/:to
   GET /api/rates/historical/:from/:to/:days
   GET /api/currencies
   GET /health
```

### 2. Setup Frontend

**Save the frontend HTML:**

- Save the "Currency Forecaster - Frontend with Backend Integration" as `index.html`

**Open in browser:**

- Open `index.html` in your web browser
- You should see "🟢 Real-time data available" in the header

### 3. Test the System

**Test individual endpoints:**

```bash
# Current rate
curl http://localhost:3000/api/rates/current/USD/EUR

# Historical rates
curl http://localhost:3000/api/rates/historical/USD/EUR/30

# Health check
curl http://localhost:3000/health
```

**Test in browser:**

1. Select currencies (e.g., USD to EUR)
2. Set amount (e.g., 1000)
3. Set travel date (30+ days out)
4. Click "Analyze Exchange Strategy"

## 🔧 Configuration Options

### Backend Configuration

**Change port (server.js):**

```javascript
const PORT = process.env.PORT || 3001; // Change to 3001
```

**Frontend configuration (index.html):**

```javascript
const BACKEND_URL = "http://localhost:3001"; // Match backend port
```

### Production Deployment

**For production, you'll need:**

1. Deploy backend to a cloud service (Heroku, Railway, Vercel, etc.)
2. Update `BACKEND_URL` in frontend to your deployed backend URL
3. Enable HTTPS for secure API calls

## 📊 API Endpoints

### GET `/api/rates/current/:from/:to`

Get current exchange rate between two currencies.

**Example:** `GET /api/rates/current/USD/EUR`

**Response:**

```json
{
  "rate": 0.8543,
  "date": "2025-06-12",
  "base": "USD",
  "target": "EUR"
}
```

### GET `/api/rates/historical/:from/:to/:days`

Get historical exchange rates for specified number of days.

**Example:** `GET /api/rates/historical/USD/EUR/30`

**Response:**

```json
{
  "from": "USD",
  "to": "EUR",
  "data": [
    { "date": "2025-05-13", "rate": 0.8521 },
    { "date": "2025-05-14", "rate": 0.8534 }
  ],
  "dataPoints": 31,
  "isMockData": false
}
```

### GET `/health`

Check if server is running.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-06-12T10:30:00.000Z",
  "cacheSize": 5
}
```

## 🐛 Troubleshooting

### Server won't start

- Check if port 3000 is already in use: `lsof -i :3000`
- Try a different port or kill the process

### Frontend shows "offline"

- Verify backend is running on correct port
- Check browser console for CORS or network errors
- Ensure `BACKEND_URL` matches your backend address

### API calls failing

- Check internet connection
- ExchangeRate-API might be rate-limited (normal behavior)
- Server will fall back to mock data automatically

### Historical data shows as "simulated"

- This is normal - ExchangeRate-API historical endpoint often has issues
- The app will show clear indicators when using real vs mock data
- Current rates should still be real-time

## ⚡ Features

### Real-time Status

- Green indicator: Real API data available
- Red indicator: Using fallback mock data
- Auto-reconnection every 30 seconds

### Smart Caching

- 1-hour cache for API responses
- Reduces API calls and improves performance
- Automatic cache management

### Intelligent Fallbacks

- Graceful degradation when APIs fail
- Clear indicators of data source quality
- Realistic mock data generation

## 🔄 Development Mode

**For development with auto-restart:**

```bash
npm install -g nodemon
npm run dev
```

This will restart the server automatically when you make changes to `server.js`.

## 📈 Next Steps

1. **Add more currency pairs** - ExchangeRate-API supports 160+ currencies
2. **Implement user preferences** - Save favorite currency pairs
3. **Add email alerts** - Notify when rates hit target levels
4. **Historical charts** - More detailed time period analysis
5. **Mobile app** - React Native or Progressive Web App
