import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_SRV = process.env.MONGO_SRV;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'hamster_superpowers';

if (!MONGO_SRV) {
  console.error('MONGO_SRV not set in .env');
  process.exit(1);
}

// Define schemas inline to avoid ESM import issues
const hamsterSchema = new mongoose.Schema({
  name: String, age: Number, personality: String, favouriteFood: String,
  hobby: String, bio: String, image: String, catchphrase: String,
  moodBoost: Number, diary: [String],
});
const Hamster = mongoose.model('Hamster', hamsterSchema);

const feedPostSchema = new mongoose.Schema({
  hamsterName: String, diaryIndex: Number, content: String, date: String,
});
const FeedPost = mongoose.model('FeedPost', feedPostSchema);

async function seed() {
  await mongoose.connect(MONGO_SRV, { dbName: MONGODB_DB_NAME });
  console.log(`Connected to ${MONGODB_DB_NAME}`);

  // Clear existing data
  await Hamster.deleteMany({});
  await FeedPost.deleteMany({});
  await mongoose.connection.db.dropCollection('users').catch(() => {});
  await mongoose.connection.db.dropCollection('conversations').catch(() => {});
  await mongoose.connection.db.dropCollection('hamster_memories').catch(() => {});

  // Import hamsters from static data
  const { default: hamsters } = await import('../src/data/hamsters.js');

  const hamsterDocs = hamsters.map(({ name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost, diary }) => ({
    name, age, personality, favouriteFood, hobby, bio, image, catchphrase, moodBoost, diary,
  }));

  await Hamster.insertMany(hamsterDocs);
  console.log(`Inserted ${hamsterDocs.length} hamsters`);

  // Insert 36 feed_posts
  const dates = ['July 22', 'July 20', 'July 18'];
  const feedPosts = [];
  for (const h of hamsters) {
    for (let i = 0; i < h.diary.length; i++) {
      feedPosts.push({
        hamsterName: h.name,
        diaryIndex: i,
        content: h.diary[i],
        date: dates[i],
      });
    }
  }

  await FeedPost.insertMany(feedPosts);
  console.log(`Inserted ${feedPosts.length} feed posts`);

  await mongoose.disconnect();
  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
