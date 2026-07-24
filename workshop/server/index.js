import 'dotenv/config';
import express from 'express';
import chatRouter from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api', chatRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
