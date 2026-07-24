import mongoose from 'mongoose';

const hamsterSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
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

const Hamster = mongoose.model('Hamster', hamsterSchema);
export default Hamster;
