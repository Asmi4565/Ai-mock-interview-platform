import mongoose from 'mongoose';
import { seedQuestionsIfEmpty } from './seed.js';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_mock_interview';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedQuestionsIfEmpty();
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`⚠️ Running with database disconnected. Please ensure MongoDB is running at ${mongoURI} or update MONGODB_URI in server/.env.`);
    return false;
  }
};
