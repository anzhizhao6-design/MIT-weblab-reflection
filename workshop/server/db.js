import mongoose from 'mongoose';

export async function connectDB() {
  const srv = process.env.MONGO_SRV;
  const dbName = process.env.MONGODB_DB_NAME;

  if (!srv) {
    console.error('MONGO_SRV not set — skipping DB connection');
    return false;
  }

  if (!dbName) {
    console.error('MONGODB_DB_NAME not set — skipping DB connection');
    return false;
  }

  try {
    await mongoose.connect(srv, { dbName });
    console.log(`MongoDB connected: ${dbName}`);
    return true;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return false;
  }
}
