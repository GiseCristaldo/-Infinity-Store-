import express from 'express';
import { superAdminAuth } from '../middlewares/authMiddleware.js';
import { 
  createAdmin, 
  getAllAdmins, 
  updateAdmin, 
  deactivateAdmin,
  changeUserRole
} from '../controllers/superAdminController.js';
import {
  getColorPalettes,
  changeActivePalette,
  createColorPalette,
  createMultipleColorPalettes,
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

// Admin Management Routes
router.post('/admins', createAdmin);
router.get('/admins', getAllAdmins);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deactivateAdmin);

// Change user role (cliente -> admin)
router.put('/users/:id/role', changeUserRole);

// Customization Routes
router.get('/customization/palettes', getColorPalettes);
router.post('/customization/palettes', createColorPalette);
router.post('/customization/palettes/bulk', createMultipleColorPalettes);
router.put('/customization/palette', changeActivePalette);
router.get('/customization/fonts', getFontOptions);
router.put('/customization/fonts', updateSiteFonts);
router.post('/customization/hero-image', uploadHeroImage, handleMulterError, uploadHeroImageController);
router.post('/customization/carousel', uploadCarouselImages, handleMulterError, uploadCarouselImagesController);
router.put('/customization/carousel/text', updateCarouselImageText);
router.put('/customization/carousel/reorder', reorderCarouselImages);
router.delete('/customization/carousel/:id', removeCarouselImage);

// Error handling middleware for image uploads
router.use(handleMulterError);

router.put('/customization/branding', updateBrandingSettings);
router.get('/customization/history', getCustomizationHistory);
router.post('/customization/revert/:id', revertCustomizationChange);

export default router;