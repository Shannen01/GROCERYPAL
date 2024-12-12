require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const listRoutes = require('./routes/lists');
const categoryRoutes = require('./routes/categoryRoutes');
const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
let server;

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = process.env.NODE_ENV === 'production' 
            ? ['https://grocerypal.onrender.com']
            : ['http://localhost:5175', 'http://localhost:5173'];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Connect to database
connectDB()
    .then(() => {
        console.log('Connected to MongoDB successfully');
        console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

const BASE_PORT = 3000;
const MAX_PORT = 3010; // Maximum port to try

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = () => {
    if (server) {
        server.close(() => {
            console.log('👋 Server shut down gracefully');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
};

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server with automatic port selection
const startServer = async (port) => {
    // If we've exceeded our maximum port, exit
    if (port > MAX_PORT) {
        console.error('❌ No available ports found between', BASE_PORT, 'and', MAX_PORT);
        process.exit(1);
    }

    try {
        server = app.listen(port);
        console.log(`🚀 Server running on port ${port}`);
        
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.log(`⚠️ Port ${port} is busy, trying ${port + 1}`);
                server.close();
                startServer(port + 1);
            } else {
                console.error('❌ Server error:', error);
                process.exit(1);
            }
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Start server with base port
startServer(BASE_PORT);