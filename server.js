import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

// Load environment variables
dotenv.config({ path: './.env' });

// Handle uncaught exceptions (sync errors)
process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION 💥');
  console.error(err.name, err.message);
  process.exit(1);
});

// Database connection
mongoose
  .connect(process.env.DATABASE)
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(err => {
    console.error('Database connection error 💥');
    console.error(err);
    process.exit(1);
  });

// Start server
const port = process.env.PORT || 9000;
const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle unhandled promise rejections (async errors)
process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION 💥');
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
});
