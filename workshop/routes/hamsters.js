import { Router } from 'express';
import Hamster from '../models/Hamster.js';

const router = Router();

router.get('/random', async (req, res) => {
  try {
    const count = await Hamster.countDocuments();
    const random = Math.floor(Math.random() * count);
    const hamster = await Hamster.findOne().skip(random);
    res.json(hamster);
  } catch (error) {
    console.error('GET /api/hamsters/random error:', error.message);
    res.status(500).json({ error: 'Failed to fetch random hamster' });
  }
});

export default router;
