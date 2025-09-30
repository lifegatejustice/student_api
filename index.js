const express = require('express'); 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Load environment variables
dotenv.config();

// Import routes
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const authRoutes = require('./routes/authRoutes');
const oauthRoutes = require('./routes/oauthRoutes');

// Create Express app
const app = express();

// OAuth routes
app.use('/', oauthRoutes);
app.use("/api/auth", authRoutes);
// <-- Added auth routes

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BYU-Idaho Student API',
      version: '1.0.0',
      description: 'A REST API for managing BYU-Idaho students and courses',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/auth', authRoutes); // <-- Mounted auth routes

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Homepage route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the BYU-Idaho Student API',
    docs: '/api-docs',
    health: '/health'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
};

startServer();