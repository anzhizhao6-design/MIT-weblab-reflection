import mongoose from 'mongoose';

const hamsterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  personality: { type: String, required: true },
  favouriteFood: { type: String, required: true },
  hobby: { type: String, required: true },
  bio: { type: String, required: true },
  image: { type: String, required: true },
  catchphrase: { type: String, required: true },
  moodBoost: { type: Number, required: true },
  diary: [{ type: String }],
});

export default mongoose.model('Hamster', hamsterSchema);
