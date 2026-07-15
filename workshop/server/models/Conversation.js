import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hamsterId: { type: Number, required: true },
  role: { type: String, enum: ['user', 'hamster'], required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
});

export default mongoose.model('Conversation', conversationSchema);
