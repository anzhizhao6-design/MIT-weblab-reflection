import { Router } from 'express';
import Hamster from '../models/Hamster.js';

const router = Router();

router.get('/hamsters/random', async (_req, res) => {
  try {
    const count = await Hamster.countDocuments();
    if (count === 0) {
      return res.status(404).json({ error: 'No hamsters in database' });
    }
    const random = Math.floor(Math.random() * count);
    const hamster = await Hamster.findOne().skip(random);
    return res.json(hamster);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch hamster' });
  }
});

export default router;
