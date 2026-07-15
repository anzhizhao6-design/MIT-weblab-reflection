import mongoose from 'mongoose';

const hamsterSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: String,
  age: String,
  personality: String,
  favouriteFood: String,
  hobby: String,
  bio: String,
  image: String,
  catchphrase: String,
  moodBoost: { type: Number, default: 10 },
  feed: [String],  // embedded feed posts
});

export default mongoose.model('Hamster', hamsterSchema);
