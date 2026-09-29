import { Router } from 'express';
import { getScalingEvents } from '../controllers/scalingEventController.js';

const router = Router();
router.get('/events', getScalingEvents);
export default router;
