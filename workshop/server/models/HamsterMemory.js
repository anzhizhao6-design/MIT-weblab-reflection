import mongoose from 'mongoose';

const hamsterMemorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hamsterId: { type: Number, required: true },
  visitCount: { type: Number, default: 0 },
  feedCount: { type: Number, default: 0 },
  lastVisit: { type: Date, default: Date.now },
});

hamsterMemorySchema.index({ userId: 1, hamsterId: 1 }, { unique: true });

const HamsterMemory = mongoose.model('HamsterMemory', hamsterMemorySchema, 'hamster_memories');
export default HamsterMemory;
