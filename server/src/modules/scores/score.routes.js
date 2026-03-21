import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { requireActiveSubscription } from '../../middleware/subscription.middleware.js';
import { ScoreController } from './score.controller.js';
import { ScoreRepository } from './score.repository.js';
import { ScoreService } from './score.service.js';

const router = Router();
const scoreRepository = new ScoreRepository();
const scoreService = new ScoreService(scoreRepository);
const scoreController = new ScoreController(scoreService);

router.post('/users/:userId', verifyJWT, requireActiveSubscription, scoreController.add);
router.get('/users/:userId', verifyJWT, requireActiveSubscription, scoreController.getByUser);

export default router;
