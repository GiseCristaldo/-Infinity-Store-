import express from 'express';
import { superAdminAuth } from '../middlewares/authMiddleware.js';
import { 
  createAdmin, 
  getAllAdmins, 
  updateAdmin, 
  deactivateAdmin 
} from '../controllers/superAdminController.js';
import {
  getColorPalettes,
  changeActivePalette,
  getFontOptions,
  updateSiteFonts,
  updateBrandingSettings,
  getCustomizationHistory,
  revertCustomizationChange
} from '../controllers/customizationController.js';
import {
  uploadHeroImage as uploadHeroImageController,
  uploadCarouselImages as uploadCarouselImagesController,
  removeCarouselImage,
  updateCarouselImageText,
  reorderCarouselImages
} from '../controllers/imageController.js';
import { uploadHeroImage, uploadCarouselImages, handleMulterError } from '../middlewares/imageUpload.js';

const router = express.Router();

// Apply super admin authentication to all routes in this router
router.use(superAdminAuth);

// Admin Management Routes (Task 4)
// POST /api/super-admin/admins - Create new admin
router.post('/admins', createAdmin);

// GET /api/super-admin/admins - List all admins with pagination and search
router.get('/admins', getAllAdmins);

// PUT /api/super-admin/admins/:id - Update admin details
router.put('/admins/:id', updateAdmin);

// DELETE /api/super-admin/admins/:id - Deactivate admin (soft delete)
router.delete('/admins/:id', deactivateAdmin);

// Customization Routes (Tasks 5-9)
// GET /api/super-admin/customization/palettes - Get all available color palettes
router.get('/customization/palettes', getColorPalettes);

// PUT /api/super-admin/customization/palette - Change active color palette
router.put('/customization/palette', changeActivePalette);

// GET /api/super-admin/customization/fonts - Get available font options
router.get('/customization/fonts', getFontOptions);

// PUT /api/super-admin/customization/fonts - Update site fonts
router.put('/customization/fonts', updateSiteFonts);

// POST /api/super-admin/customization/hero-image - Upload hero section image
router.post('/customization/hero-image', uploadHeroImage, handleMulterError, uploadHeroImageController);

// POST /api/super-admin/customization/carousel - Upload carousel images
router.post('/customization/carousel', uploadCarouselImages, handleMulterError, uploadCarouselImagesController);

// PUT /api/super-admin/customization/carousel/text - Update carousel image text
router.put('/customization/carousel/text', updateCarouselImageText);

// PUT /api/super-admin/customization/carousel/reorder - Reorder carousel images
router.put('/customization/carousel/reorder', reorderCarouselImages);

// DELETE /api/super-admin/customization/carousel/:id - Delete carousel image
router.delete('/customization/carousel/:id', removeCarouselImage);

// Error handling middleware for image uploads
router.use(handleMulterError);

// PUT /api/super-admin/customization/branding - Update branding settings
router.put('/customization/branding', updateBrandingSettings);

// GET /api/super-admin/customization/history - Get customization history
router.get('/customization/history', getCustomizationHistory);

// POST /api/super-admin/customization/revert/:id - Revert customization change
router.post('/customization/revert/:id', revertCustomizationChange);

export default router;