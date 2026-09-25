import mongoose from 'mongoose';
import { config } from './env.js';

mongoose.connection.on('error', () => {
  console.error('MongoDB connection error. Check database availability and connection settings.');
});

export async function connectDB() {
  if (!config.mongodbUri) {
    throw new Error('MONGODB_URI is required. Set it in server/.env or the process environment.');
  }

  try {
    await mongoose.connect(config.mongodbUri);
    console.log('MongoDB connected.');
  } catch {
    // Driver errors can contain connection details; do not log the raw error.
    throw new Error('Unable to connect to MongoDB. Check MONGODB_URI, credentials, network access, and that MongoDB is running.');
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
