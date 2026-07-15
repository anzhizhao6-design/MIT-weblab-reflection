import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export async function connectDb() {
  const uri = process.env.MONGO_SRV;
  if (!uri) {
    console.error('❌ MONGO_SRV not found in .env file.');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB Atlas');
}
