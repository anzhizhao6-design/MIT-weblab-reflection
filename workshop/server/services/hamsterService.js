import Hamster from '../models/Hamster.js';

export async function getRandomHamster() {
  const count = await Hamster.countDocuments();
  const random = Math.floor(Math.random() * count);
  return Hamster.findOne().skip(random);
}

export async function getHamsterById(id) {
  return Hamster.findOne({ id });
}
