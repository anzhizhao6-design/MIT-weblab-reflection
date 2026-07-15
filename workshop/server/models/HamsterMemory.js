import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hamsterId: { type: Number, required: true },
  visitCount: { type: Number, default: 0 },
  totalFeeds: { type: Number, default: 0 },
  lastVisit: Date,
});

memorySchema.index({ userId: 1, hamsterId: 1 }, { unique: true });

export default mongoose.model('HamsterMemory', memorySchema);
