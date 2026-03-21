import { Router } from 'express';
import { CharityController } from './charity.controller.js';
import { CharityRepository } from './charity.repository.js';
import { CharityService } from './charity.service.js';

const router = Router();
const charityRepository = new CharityRepository();
const charityService = new CharityService(charityRepository);
const charityController = new CharityController(charityService);

router.post('/', charityController.create);
router.get('/', charityController.list);
router.get('/featured', charityController.featured);
router.post('/:charityId/donations', charityController.addDonation);

export default router;
