import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import errorHandler from './middleware/error-handler.js';

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use('/api', routes);

// --- Error Handler (must be last) ---
app.use(errorHandler);

export default app;
