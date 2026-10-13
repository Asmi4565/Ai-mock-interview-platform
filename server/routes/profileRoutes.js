import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/auth.js';
import { validateProfile } from '../middleware/validate.js';

const router = express.Router();

router.use(protect); // All profile routes require authentication

router.get('/', getProfile);
router.put('/', validateProfile, updateProfile);

export default router;
