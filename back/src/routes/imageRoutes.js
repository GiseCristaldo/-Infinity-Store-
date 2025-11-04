import express from 'express';
import { 
    uploadHeroImage, 
    uploadCarouselImages, 
    uploadCarouselImage,
    updateCarouselSlideText,
    deleteCarouselImage,
    uploadImage
} from '../controllers/imageController.js';
import { 
    uploadHeroImage as uploadHeroMiddleware, 
    uploadCarouselImages as uploadCarouselMiddleware,
    uploadSingleImage,
    handleMulterError
} from '../middlewares/imageUpload.js';
import { superAdminAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de super admin
router.use(superAdminAuth);

// --- Rutas para imagen hero ---
router.post('/hero-image', 
    uploadHeroMiddleware,
    uploadHeroImage
);

// --- Rutas para carousel ---
// Subir imagen genérica (hero o carousel)
router.post('/upload', 
    uploadSingleImage,
    handleMulterError,
    uploadImage
);

// Actualizar texto de slide del carousel
router.put('/carousel/:index', updateCarouselSlideText);

// Eliminar imagen del carousel
router.delete('/carousel/:index', deleteCarouselImage);

export default router;