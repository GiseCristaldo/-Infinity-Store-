import express from 'express';
import { getCurrentThemeSettings } from '../controllers/customizationController.js';

const router = express.Router();

// Public endpoint to get current theme settings
// GET /api/settings/current - Get current site theme settings (public access)
router.get('/current', getCurrentThemeSettings);

export default router;