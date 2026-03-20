import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/game.routes';
import { errorHandler } from './middleware/error-handler';
export const app = express();
const PORT = process.env.PORT || 4001;
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3001' }));
app.use(express.json());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api/game', gameRoutes);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map