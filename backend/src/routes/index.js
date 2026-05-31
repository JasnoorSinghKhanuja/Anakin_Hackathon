import { Router } from 'express';
import searchRoutes from './searchRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import { env } from '../config/env.js';
import { listStores } from '../controllers/storeController.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'BuyWise.AI API',
    mockMode: env.mockMode,
    timestamp: new Date().toISOString()
  });
});

router.get('/stores', listStores);
router.use('/search', searchRoutes);
router.use('/recommendation', recommendationRoutes);

export default router;

