import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { WinningController } from './winning.controller.js';
import { WinningRepository } from './winning.repository.js';
import { WinningService } from './winning.service.js';

const router = Router();
const winningRepository = new WinningRepository();
const winningService = new WinningService(winningRepository);
const winningController = new WinningController(winningService);

router.use(verifyJWT);

router.get('/me', winningController.listMine);
router.post('/upload-proof', winningController.uploadProof);

export default router;
