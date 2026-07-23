import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { userId, hamsterName } = req.body;
    if (!userId || !hamsterName) {
      return res.status(400).json({ error: 'userId and hamsterName required' });
    }

    const memory = await HamsterMemory.findOneAndUpdate(
      { userId, hamsterName },
      { $inc: { visitCount: 1 }, $set: { lastVisit: new Date() } },
      { upsert: true, new: true }
    );

    res.json({ visitCount: memory.visitCount });
  } catch (error) {
    console.error('POST /api/visit error:', error.message);
    res.status(500).json({ error: 'Failed to record visit' });
  }
});

export default router;
