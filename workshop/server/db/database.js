import mongoose from 'mongoose';

const MONGO_SRV = process.env.MONGO_SRV;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hamster_matt_skills';

export async function connectDB() {
  if (!MONGO_SRV) {
    console.warn('MONGO_SRV not set — skipping database connection');
    return null;
  }

  try {
    const conn = await mongoose.connect(MONGO_SRV, {
      dbName: MONGODB_DB_NAME,
    });
    console.log(`MongoDB connected: ${conn.connection.host} / ${MONGODB_DB_NAME}`);
    return conn;
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    return null;
  }
}

export default mongoose;
