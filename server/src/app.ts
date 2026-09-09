import express from 'express';
import cors from 'cors';
import { runMigrations } from './db/migrations';
import databaseRouter from './routes/database';
import groupsRouter from './routes/groups';
import entriesRouter from './routes/entries';
import authRouter from './routes/auth';
import generatorRouter from './routes/generator';
import tanRouter from './routes/tan';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Run database migrations
runMigrations();

// Routes
app.use('/api/database', databaseRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/entries', entriesRouter);
app.use('/api/auth', authRouter);
app.use('/api/generator', generatorRouter);
app.use('/api/tan', tanRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
