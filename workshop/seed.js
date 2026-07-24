import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import hamsters from './src/data/hamsters.js';
import foods from './src/data/foods.js';
import Hamster from './server/models/Hamster.js';
import FeedPost from './server/models/FeedPost.js';
import Conversation from './server/models/Conversation.js';
import HamsterMemory from './server/models/HamsterMemory.js';
import User from './server/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const SRV = process.env.MONGO_SRV;
const DB_NAME = process.env.MONGODB_DB_NAME;

if (!SRV || !DB_NAME) {
  console.error('Missing MONGO_SRV or MONGODB_DB_NAME in .env');
  process.exit(1);
}

// Historical diary dates for seed feed_posts
const DIARY_DATES = ['2026-07-21', '2026-07-19', '2026-07-17'];

async function seed() {
  console.log(`Connecting to MongoDB: ${DB_NAME}...`);
  await mongoose.connect(SRV, { dbName: DB_NAME });
  console.log('Connected.');

  // Clear existing data
  console.log('Clearing existing data...');
  await Promise.all([
    Hamster.deleteMany({}),
    FeedPost.deleteMany({}),
    Conversation.deleteMany({}),
    HamsterMemory.deleteMany({}),
    User.deleteMany({}),
  ]);
  console.log('Cleared.');

  // Seed hamsters
  console.log('Seeding hamsters...');
  const hamsterDocs = await Hamster.insertMany(hamsters);
  console.log(`  Inserted ${hamsterDocs.length} hamsters.`);

  // Seed 36 feed_posts (3 per hamster, historical "diary" entries)
  console.log('Seeding feed_posts (diary)...');
  const feedPosts = [];
  for (const hamster of hamsters) {
    for (let i = 0; i < 3; i++) {
      const randomFood = foods[Math.floor(Math.random() * foods.length)];
      feedPosts.push({
        userId: 'seed',
        hamsterName: hamster.name,
        foodId: randomFood.id,
        isFavourite: randomFood.id === hamster.favouriteFood,
        moodChange: randomFood.id === hamster.favouriteFood ? hamster.moodBoost : 3,
        createdAt: new Date(DIARY_DATES[i]),
      });
    }
  }
  const fpDocs = await FeedPost.insertMany(feedPosts);
  console.log(`  Inserted ${fpDocs.length} feed_posts.`);

  await mongoose.disconnect();
  console.log('Seed complete!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
