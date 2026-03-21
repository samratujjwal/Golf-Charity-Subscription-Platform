import { Router } from 'express';
import { authorizeRoles, verifyJWT } from '../../middleware/auth.middleware.js';
import { DrawController } from './draw.controller.js';
import { DrawRepository } from './draw.repository.js';
import { DrawService } from './draw.service.js';

const router = Router();
const drawRepository = new DrawRepository();
const drawService = new DrawService(drawRepository);
const drawController = new DrawController(drawService);

router.use(verifyJWT);

router.get('/latest', drawController.latest);
router.post('/create', authorizeRoles('admin'), drawController.create);
router.post('/run', authorizeRoles('admin'), drawController.run);
router.post('/simulate', authorizeRoles('admin'), drawController.simulate);

export default router;
