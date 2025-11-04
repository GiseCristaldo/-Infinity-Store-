import express from 'express';
import { getCurrentThemeSettings, updateHeroVisibility } from '../controllers/customizationController.js';
import { superAdminAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public endpoint to get current theme settings
// GET /api/settings/current - Get current site theme settings (public access)
router.get('/current', getCurrentThemeSettings);

// Super admin endpoints
// PUT /api/settings/hero-visibility - Update hero section visibility
router.put('/hero-visibility', superAdminAuth, updateHeroVisibility);

export default router;