import { Router } from 'express';
import HamsterMemory from '../models/HamsterMemory.js';
import FeedPost from '../models/FeedPost.js';

const router = Router();

router.post('/visit', async (req, res) => {
  try {
    const { userId, hamsterId } = req.body;
    if (!userId || hamsterId == null) {
      return res.status(400).json({ error: 'Missing userId or hamsterId' });
    }
    await HamsterMemory.findOneAndUpdate(
      { userId, hamsterId },
      {
        $inc: { visitCount: 1 },
        $setOnInsert: { feedCount: 0 },
        $set: { lastVisit: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record visit' });
  }
});

router.post('/feed', async (req, res) => {
  try {
    const { userId, hamsterId, foodId, isFavourite } = req.body;
    if (!userId || hamsterId == null || !foodId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    await HamsterMemory.findOneAndUpdate(
      { userId, hamsterId },
      {
        $inc: { feedCount: 1 },
        $setOnInsert: { visitCount: 0 },
        $set: { lastVisit: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );
    await FeedPost.create({ userId, hamsterId, foodId, isFavourite });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record feed' });
  }
});

router.get('/memory', async (req, res) => {
  try {
    const { userId, hamsterId } = req.query;
    if (!userId || !hamsterId) {
      return res.status(400).json({ error: 'Missing userId or hamsterId' });
    }
    const memory = await HamsterMemory.findOne({
      userId,
      hamsterId: Number(hamsterId),
    });
    if (!memory) {
      return res.json({ visitCount: 0, totalFeeds: 0, lastVisit: null });
    }
    return res.json({
      visitCount: memory.visitCount,
      totalFeeds: memory.feedCount,
      lastVisit: memory.lastVisit,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch memory' });
  }
});

export default router;
