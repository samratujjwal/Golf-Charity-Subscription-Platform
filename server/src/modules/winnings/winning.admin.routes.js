import { Router } from 'express';
import { authorizeRoles, verifyJWT } from '../../middleware/auth.middleware.js';
import { WinningController } from './winning.controller.js';
import { WinningRepository } from './winning.repository.js';
import { WinningService } from './winning.service.js';

const router = Router();
const winningRepository = new WinningRepository();
const winningService = new WinningService(winningRepository);
const winningController = new WinningController(winningService);

router.use(verifyJWT, authorizeRoles('admin'));

router.get('/winnings', winningController.listAdmin);
router.get('/winnings/draw/:drawId/pool', winningController.calculatePool);
router.post('/winnings/draw/:drawId/distribute', winningController.distribute);
router.put('/winning/:id/verify', winningController.verify);
router.put('/winning/:id/pay', winningController.markPaid);

export default router;

