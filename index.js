import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDB } from './config/db.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'GitHub Profile Analyzer API' });
});

// Start
(async () => {
    try {
        await initDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
})();