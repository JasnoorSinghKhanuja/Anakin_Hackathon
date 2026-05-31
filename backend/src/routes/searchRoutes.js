import { Router } from 'express';
import { searchElectronics, searchGrocery } from '../controllers/searchController.js';

const router = Router();

router.post('/electronics', searchElectronics);
router.post('/grocery', searchGrocery);

export default router;

