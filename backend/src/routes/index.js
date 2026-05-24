import { Router } from 'express';

const router = Router();

/**
 * Health check endpoint.
 * GET /api/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Register feature routes here:
// import authRoutes from './auth.js';
// router.use('/auth', authRoutes);

export default router;
