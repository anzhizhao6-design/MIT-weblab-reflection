import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true, index: true },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
