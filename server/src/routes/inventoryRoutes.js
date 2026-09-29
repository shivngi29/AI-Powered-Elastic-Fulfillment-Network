import { Router } from 'express';
import { getInventory } from '../controllers/inventoryController.js';

const router = Router();
router.get('/', getInventory);

export default router;
