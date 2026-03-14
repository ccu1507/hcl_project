import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import routes from './src/routes/index.js';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const app = express();

// Middleware
//we are in middle ware function

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Base route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the backend API!' });
});

// Database connection
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  });

app.use("/api/auth", authRoutes);
