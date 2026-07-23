import mongoose from 'mongoose';

const feedPostSchema = new mongoose.Schema({
  hamsterName: { type: String, required: true, index: true },
  diaryIndex: { type: Number, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
});

export default mongoose.model('FeedPost', feedPostSchema);
