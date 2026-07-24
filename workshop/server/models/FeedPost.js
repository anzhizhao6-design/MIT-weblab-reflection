import mongoose from 'mongoose';

const feedPostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hamsterName: { type: String, required: true },
  foodId: { type: String, required: true },
  isFavourite: { type: Boolean, default: false },
  moodChange: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('FeedPost', feedPostSchema, 'feed_posts');
