import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import hamsterRoutes from './routes/hamsters.js';
import userRoutes from './routes/users.js';
import visitRoutes from './routes/visits.js';
import feedRoutes from './routes/feeds.js';
import memoryRoutes from './routes/memory.js';
import chatRoutes from './routes/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const MONGO_SRV = process.env.MONGO_SRV;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hamster_superpowers';

// MongoDB connection
mongoose.connect(MONGO_SRV, { dbName: MONGODB_DB_NAME })
  .then(() => console.log(`MongoDB connected: ${MONGODB_DB_NAME}`))
  .catch((err) => console.error('MongoDB connection error:', err.message));

app.use('/api/hamsters', hamsterRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visit', visitRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/memory', memoryRoutes);
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`F2 backend running on http://localhost:${PORT}`);
});
