import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  hamsterName: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'] },
    content: String,
  }],
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
