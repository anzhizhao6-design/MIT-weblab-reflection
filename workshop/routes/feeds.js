import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { userId, hamsterName, foodId, isFavourite } = req.body;
    if (!userId || !hamsterName) {
      return res.status(400).json({ error: 'userId and hamsterName required' });
    }

    const memory = await HamsterMemory.findOneAndUpdate(
      { userId, hamsterName },
      { $inc: { feedCount: 1 }, $set: { lastVisit: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ feedCount: memory.feedCount });
  } catch (error) {
    console.error('POST /api/feed error:', error.message);
    res.status(500).json({ error: 'Failed to record feed' });
  }
});

export default router;
