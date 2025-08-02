# Expense Tracker Application

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher recommended)
- MongoDB (either local installation or MongoDB Atlas account)

### Installation

1. Clone the repository
2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

### MongoDB Setup

#### Option 1: Local MongoDB (Development)

1. Install MongoDB Community Edition on your local machine
2. Start the MongoDB service
3. The application will automatically connect to `mongodb://localhost:27017/expenseTracker`

#### Option 2: MongoDB Atlas (Production/Cloud)

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. In the Atlas dashboard:
   - Go to "Database Access" and add a database user
   - Go to "Network Access" and add your IP address to the whitelist (or add 0.0.0.0/0 for testing only)
4. Click "Connect" on your cluster and choose "Connect your application"
5. Copy the connection string

### Environment Configuration

Create a `.env` file in the project root with the following content:

```env
# For local development
MONGO_URI=mongodb://localhost:27017/expenseTracker

# For MongoDB Atlas (replace with your actual connection string)
# MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

If using MongoDB Atlas, replace the MONGO_URI value with your actual connection string from the Atlas dashboard.

### Running the Application

1. Start the server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the client (in a new terminal):
   ```bash
   cd client
   npm start
   ```

3. Open your browser to http://localhost:3000

### Troubleshooting

#### MongoDB Connection Issues

If you're getting connection errors:

1. **IP Whitelist**: Make sure your current IP address is whitelisted in MongoDB Atlas
2. **Credentials**: Verify that your username and password are correct
3. **Network**: Check your internet connection
4. **SSL Issues**: If you're behind a corporate firewall, you might need to adjust SSL settings

#### Common Error Messages

- "Could not connect to any servers in your MongoDB Atlas cluster":
  - Check your IP whitelist in MongoDB Atlas
  - Verify your connection string credentials
  - Try adding your current IP to the whitelist or use 0.0.0.0/0 for testing (not recommended for production)
  - For Render deployment, you may need to add Render's IP addresses to your whitelist

- SSL/TLS errors:
  - Try adding `tlsInsecure: true` to the connection options (not recommended for production)
  - Check if you're behind a corporate firewall that might be interfering with SSL connections
  - Add `?ssl=true&tlsAllowInvalidCertificates=true` to your connection string for testing
  - For Render deployment, ensure SSL settings are compatible with Render's infrastructure

### Deployment

For deployment on Render:

1. Create a new Web Service on Render
2. Connect your repository
3. Set the following environment variables in Render:
   - `MONGO_URI`: Your MongoDB connection string
   - `NODE_VERSION`: 18.18.0
4. Set build command to: `npm install`
5. Set start command to: `node server/server.js`
