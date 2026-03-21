import { Router } from 'express';
import { authorizeRoles, verifyJWT } from '../../middleware/auth.middleware.js';
import { AuthController } from './auth.controller.js';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', verifyJWT, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', verifyJWT, authorizeRoles('user', 'admin'), authController.me);

export default router;
