import { Router } from 'express';
import { registerEntry, registerExit, getCurrentPeople, getHistory, getAnalytics } from '../controllers/eventController';

const router = Router();

router.post('/entry', registerEntry);
router.post('/exit', registerExit);
router.get('/people', getCurrentPeople);
router.get('/history', getHistory);
router.get('/analytics', getAnalytics);

export default router;
