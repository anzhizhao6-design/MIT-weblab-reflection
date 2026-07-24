import 'dotenv/config';
import express from 'express';
import { connectDB } from './db/database.js';
import chatRouter from './routes/chat.js';
import hamstersRouter from './routes/hamsters.js';
import usersRouter from './routes/users.js';
import memoryRouter from './routes/memory.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api', chatRouter);
app.use('/api', hamstersRouter);
app.use('/api', usersRouter);
app.use('/api', memoryRouter);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
