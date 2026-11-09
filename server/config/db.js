import mongoose from 'mongoose';
import dns from 'node:dns';
import { seedQuestionsIfEmpty } from './seed.js';

// Resolve DNS issues on Windows with MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore if custom DNS cannot be set
}

let isConnecting = false;

// Attach reconnection listeners once
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting automatic reconnection in 3 seconds...');
  setTimeout(() => {
    connectDB();
  }, 3000);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully!');
});

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }
  if (isConnecting) {
    return false;
  }

  isConnecting = true;
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_mock_interview';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedQuestionsIfEmpty();
    isConnecting = false;
    return true;
  } catch (error) {
    isConnecting = false;
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️ Running with database disconnected. Please ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add IP Address: 0.0.0.0/0) and the cluster is active.`);
    return false;
  }
};
