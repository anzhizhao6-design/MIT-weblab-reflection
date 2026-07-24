import mongoose from 'mongoose';

const feedPostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hamsterId: { type: Number, required: true },
  foodId: { type: String, required: true },
  isFavourite: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
});

const FeedPost = mongoose.model('FeedPost', feedPostSchema, 'feed_posts');
export default FeedPost;
