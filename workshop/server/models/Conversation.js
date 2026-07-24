import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hamsterId: { type: Number, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
