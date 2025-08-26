require('dotenv').config();
const express = require('express');
const app = express();
const userRoutes = require('./src/api/user');
const groupRoutes = require('./src/api/group');
const { initializeDatabase } = require('./src/db/init');

app.use(express.json());

// Mount API routes
app.use('/api', userRoutes);
app.use('/api', groupRoutes);

app.get('/', (req, res) => {
  res.send('<h1>Hello from your Take5 Express.js server!!</h1>');
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        app.listen(PORT, () => {
            console.log(`Take5 API listening at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();