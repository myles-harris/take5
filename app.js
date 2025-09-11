require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const userRoutes = require('./src/api/user');
const groupRoutes = require('./src/api/group');
const twilioRoutes = require("./src/api/twilio");
const schedulingRoutes = require("./src/api/scheduling");
const mobileRoutes = require("./src/api/mobile");const { initializeDatabase } = require('./src/db/init');

app.use(express.json());

// Mount API routes
app.use('/api', userRoutes);
app.use('/api', groupRoutes);
app.use("/api/twilio", twilioRoutes);
app.use("/api/scheduling", schedulingRoutes);
app.use("/api/mobile", mobileRoutes);
// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve video call join page
app.use(express.static(path.join(__dirname, 'public')));

// Serve React app for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Serve React app for all other routes (except API routes)
app.get('/users', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.get('/groups', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.get('/video', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

app.get('/scheduling', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Take5 API listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });
