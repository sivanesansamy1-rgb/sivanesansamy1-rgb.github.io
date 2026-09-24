const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Default Route
app.get('/', (req, res) => {
    res.send('Portfolio API is running...');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/portfolioRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
