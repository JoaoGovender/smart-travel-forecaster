# Currency Exchange Backend Proxy Server

A robust Node.js proxy server that provides currency exchange rates with caching, fallback mechanisms, and multiple data sources. This server acts as a reliable intermediary between your applications and external currency exchange APIs.

## 🚀 Features

- **Real-time Exchange Rates**: Get current exchange rates between any supported currency pairs
- **Multiple Data Sources**: Primary integration with `exchangerate.host` and fallback to `exchangerate-api.com`
- **Smart Caching**: 1-hour cache duration to reduce API calls and improve response times
- **Error Handling**: Comprehensive error handling with graceful fallbacks
- **CORS Enabled**: Ready for cross-origin requests from web applications
- **Health Monitoring**: Built-in health check endpoint
- **Mock Data Support**: Fallback mock rates for development and testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install dependencies**:

   ```bash
   npm install express cors axios dotenv
   ```

3. **Create environment file** (optional):

   ```bash
   touch .env
   ```

   Add any custom configuration:

   ```
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server**:
   ```bash
   node server.js
   ```

The server will start on port 3000 by default (or the port specified in your environment variables).

## 📡 API Endpoints

### Get Current Exchange Rate

```
GET /api/rates/current/:from/:to
```

**Parameters:**

- `from`: Base currency code (e.g., USD, EUR, GBP)
- `to`: Target currency code

**Example:**

```bash
curl http://localhost:3000/api/rates/current/USD/EUR
```

**Response:**

```json
{
  "rate": 0.8234,
  "date": "2025-06-13",
  "base": "USD",
  "target": "EUR",
  "source": "exchangerate.host"
}
```

### Get Supported Currencies

```
GET /api/currencies
```

**Example:**

```bash
curl http://localhost:3000/api/currencies
```

**Response:**

```json
{
  "currencies": ["USD", "EUR", "GBP", "JPY", "..."],
  "count": 168,
  "source": "exchangerate.host"
}
```

### Health Check

```
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2025-06-13T10:30:00.000Z",
  "cacheSize": 5
}
```

## 🏗️ Architecture

### Data Sources

1. **Primary**: `exchangerate.host` - More reliable with better historical data
2. **Fallback**: `exchangerate-api.com` - Backup when primary source fails
3. **Mock Data**: Hardcoded rates for development/testing scenarios

### Caching Strategy

- **Duration**: 1 hour per cached entry
- **Storage**: In-memory Map structure
- **Keys**: Generated based on request parameters
- **Benefits**: Reduces API calls and improves response times

### Error Handling

- Graceful fallback between data sources
- Comprehensive error logging
- User-friendly error messages
- Development vs production error details

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

### Cache Configuration

Modify cache duration in the code:

```javascript
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds
```

### API URLs

Update API endpoints if needed:

```javascript
const EXCHANGERATE_API_URL = "https://api.exchangerate-api.com/v4";
const EXCHANGERATE_HOST_URL = "https://api.exchangerate.host";
```

## 🚦 Usage Examples

### JavaScript/Node.js

```javascript
const axios = require("axios");

// Get current USD to EUR rate
async function getCurrentRate() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/rates/current/USD/EUR"
    );
    console.log(`Current rate: ${response.data.rate}`);
  } catch (error) {
    console.error("Error:", error.response.data);
  }
}
```

### Python

```python
import requests

# Get supported currencies
response = requests.get('http://localhost:3000/api/currencies')
currencies = response.json()['currencies']
print(f"Supported currencies: {len(currencies)}")
```

### cURL

```bash
# Get GBP to USD rate
curl -X GET http://localhost:3000/api/rates/current/GBP/USD

# Check server health
curl -X GET http://localhost:3000/health
```

## 🔍 Monitoring and Debugging

### Logging

The server provides console logging for:

- API requests and responses
- Cache hits and misses
- Error conditions and fallbacks
- Server startup information

### Health Monitoring

Use the `/health` endpoint to monitor:

- Server status
- Current timestamp
- Cache size

## 🛡️ Error Handling

The server handles various error scenarios:

- **API Unavailability**: Automatic fallback to secondary data source
- **Network Issues**: Graceful error responses with details
- **Invalid Currency Codes**: 404 responses for unsupported pairs
- **Rate Limiting**: Caching reduces API call frequency

## 📦 Dependencies

- **express**: Web framework for Node.js
- **cors**: Cross-Origin Resource Sharing middleware
- **axios**: HTTP client for API requests
- **dotenv**: Environment variable loader

## 🚀 Deployment

### Local Development

```bash
npm start
# or
node server.js
```

### Production Deployment

1. Set `NODE_ENV=production`
2. Configure appropriate `PORT` for your hosting platform
3. Ensure all dependencies are installed
4. Consider using a process manager like PM2

### Docker (Optional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. Please check the license file for details.

## 🆘 Support

For issues and questions:

1. Check the logs for error details
2. Verify API endpoint availability
3. Test with the `/health` endpoint
4. Review cache behavior if rates seem stale

---

**Happy coding! 💱**
