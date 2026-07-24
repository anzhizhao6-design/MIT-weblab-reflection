import 'dotenv/config';
import mongoose from 'mongoose';
import Hamster from '../models/Hamster.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import HamsterMemory from '../models/HamsterMemory.js';
import FeedPost from '../models/FeedPost.js';
import hamsters from '../../src/data/hamsters.js';

const MONGO_SRV = process.env.MONGO_SRV;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hamster_matt_skills';

async function seed() {
  if (!MONGO_SRV) {
    console.error('MONGO_SRV not set in .env');
    process.exit(1);
  }

  console.log(`Connecting to MongoDB: ${MONGODB_DB_NAME}...`);
  await mongoose.connect(MONGO_SRV, { dbName: MONGODB_DB_NAME });
  console.log('Connected.');

  console.log('Clearing existing data...');
  await Promise.all([
    Hamster.deleteMany({}),
    User.deleteMany({}),
    Conversation.deleteMany({}),
    HamsterMemory.deleteMany({}),
    FeedPost.deleteMany({}),
  ]);
  console.log('Cleared.');

  console.log('Seeding hamsters...');
  const docs = hamsters.map((h, i) => ({
    id: i + 1,
    name: h.name,
    age: h.age,
    personality: h.personality,
    favouriteFood: h.favouriteFood,
    hobby: h.hobby,
    bio: h.bio,
    image: h.image,
    catchphrase: h.catchphrase,
    moodBoost: h.moodBoost,
    diary: h.diary,
  }));
  await Hamster.insertMany(docs);
  console.log(`Inserted ${docs.length} hamsters with ${docs.reduce((sum, h) => sum + h.diary.length, 0)} diary posts.`);

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
