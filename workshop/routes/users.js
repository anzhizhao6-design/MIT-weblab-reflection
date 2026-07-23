import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) return res.status(400).json({ error: 'uuid required' });

    const user = await User.findOneAndUpdate(
      { uuid },
      { uuid },
      { upsert: true, new: true }
    );
    res.json({ user });
  } catch (error) {
    console.error('POST /api/users error:', error.message);
    res.status(500).json({ error: 'Failed to upsert user' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ uuid: req.params.id });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('GET /api/users/:id error:', error.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router;
