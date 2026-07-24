import { Router } from 'express';
import crypto from 'crypto';
import User from '../models/User.js';

const router = Router();

router.post('/users', async (_req, res) => {
  try {
    const userId = crypto.randomUUID();
    await User.create({ userId });
    return res.json({ userId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ userId: user.userId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to check user' });
  }
});

export default router;
