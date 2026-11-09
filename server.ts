import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const RATINGS_FILE = path.join(DATA_DIR, 'ratings.json');

app.use(express.json());

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RATINGS_FILE)) {
  fs.writeFileSync(RATINGS_FILE, JSON.stringify([], null, 2));
}

interface StoredRating {
  id: string;
  rating: number;
  feedback: string;
  clientId: string | null;
  createdAt: number;
}

function getStoredRatings(): StoredRating[] {
  try {
    const raw = fs.readFileSync(RATINGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading ratings file:', err);
    return [];
  }
}

function saveStoredRatings(ratings: StoredRating[]): void {
  try {
    fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));
  } catch (err) {
    console.error('Error writing ratings file:', err);
  }
}

// API Routes
app.get('/api/ratings', (_req, res) => {
  const ratings = getStoredRatings();
  const total = ratings.length;
  const avg =
    total > 0
      ? Number((ratings.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1))
      : 0;

  // Return public review entries without private client IDs
  const publicReviews = ratings.map(({ id, rating, feedback, createdAt }) => ({
    id,
    rating,
    feedback: feedback || '',
    createdAt,
  }));

  res.json({
    averageRating: avg,
    totalRatings: total,
    ratings: publicReviews,
  });
});

app.post('/api/ratings', (req, res) => {
  const { rating, feedback, clientId } = req.body;
  const numRating = Number(rating);

  if (!numRating || numRating < 1 || numRating > 5) {
    return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
  }

  const ratings = getStoredRatings();

  // Prevent duplicate rating if client ID was already recorded
  if (clientId && typeof clientId === 'string') {
    const existing = ratings.find((r) => r.clientId === clientId);
    if (existing) {
      return res.status(409).json({
        error: 'You have already submitted a rating. Thank you for your feedback!',
      });
    }
  }

  const newEntry: StoredRating = {
    id: `rate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rating: Math.round(numRating),
    feedback: typeof feedback === 'string' ? feedback.trim().slice(0, 500) : '',
    clientId: typeof clientId === 'string' ? clientId : null,
    createdAt: Date.now(),
  };

  ratings.unshift(newEntry);
  saveStoredRatings(ratings);

  const total = ratings.length;
  const avg = Number((ratings.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1));

  res.status(201).json({
    success: true,
    averageRating: avg,
    totalRatings: total,
    entry: {
      id: newEntry.id,
      rating: newEntry.rating,
      feedback: newEntry.feedback,
      createdAt: newEntry.createdAt,
    },
  });
});

async function start() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`NetSpeed Pro Server running at http://0.0.0.0:${port}`);
  });
}

start();
