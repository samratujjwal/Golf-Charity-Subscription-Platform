import { Router } from 'express';
import { DrawController } from './draw.controller.js';
import { DrawRepository } from './draw.repository.js';
import { DrawService } from './draw.service.js';

const router = Router();
const drawRepository = new DrawRepository();
const drawService = new DrawService(drawRepository);
const drawController = new DrawController(drawService);

router.post('/', drawController.create);
router.get('/', drawController.list);
router.patch('/:drawId/status', drawController.updateStatus);

export default router;
