import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: String,  // UUID from frontend
  name: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
