import mongoose from 'mongoose';

const hamsterMemorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hamsterName: { type: String, required: true },
  visitCount: { type: Number, default: 0 },
  feedCount: { type: Number, default: 0 },
  lastVisit: { type: Date, default: Date.now },
});

hamsterMemorySchema.index({ userId: 1, hamsterName: 1 }, { unique: true });

export default mongoose.model('HamsterMemory', hamsterMemorySchema, 'hamster_memories');
