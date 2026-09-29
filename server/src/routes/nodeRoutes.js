import { Router } from 'express';
import { getNodes } from '../controllers/nodeController.js';

const router = Router();
router.get('/', getNodes);

export default router;
