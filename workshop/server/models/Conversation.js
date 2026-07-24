import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'hamster'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  hamsterName: { type: String, required: true },
  messages: [messageSchema],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Conversation', conversationSchema);
