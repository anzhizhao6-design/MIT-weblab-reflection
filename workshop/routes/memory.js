import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { userId, hamsterName } = req.query;
    if (!userId || !hamsterName) {
      return res.status(400).json({ error: 'userId and hamsterName query params required' });
    }

    const memory = await HamsterMemory.findOne({ userId, hamsterName });
    res.json({
      visitCount: memory?.visitCount || 0,
      feedCount: memory?.feedCount || 0,
    });
  } catch (error) {
    console.error('GET /api/memory error:', error.message);
    res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

export default router;
