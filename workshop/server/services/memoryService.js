import User from '../models/User.js';
import HamsterMemory from '../models/HamsterMemory.js';

export async function ensureUser(userId) {
  const exists = await User.findById(userId);
  if (!exists) {
    await User.create({ _id: userId });
  }
}

export async function recordVisit(userId, hamsterId) {
  await HamsterMemory.findOneAndUpdate(
    { userId, hamsterId },
    { $inc: { visitCount: 1 }, $set: { lastVisit: new Date() } },
    { upsert: true }
  );
}

export async function recordFeed(userId, hamsterId) {
  await HamsterMemory.findOneAndUpdate(
    { userId, hamsterId },
    { $inc: { totalFeeds: 1 } },
    { upsert: true }
  );
}

export async function getMemory(userId, hamsterId) {
  return HamsterMemory.findOne({ userId, hamsterId });
}
