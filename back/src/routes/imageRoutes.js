import express from 'express';
import { 
    uploadHeroImage, 
    uploadCarouselImages, 
    addCarouselImage,
    removeCarouselImage,
    reorderCarouselImages 
} from '../controllers/imageController.js';
import { 
    uploadHeroImage as uploadHeroMiddleware, 
    uploadCarouselImages as uploadCarouselMiddleware,
    handleMulterError 
} from '../middlewares/imageUpload.js';
import { superAdminAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de super admin
router.use(superAdminAuth);

// --- Rutas para imagen hero ---
router.post('/hero-image', 
    uploadHeroMiddleware,
    handleMulterError,
    uploadHeroImage
);

// --- Rutas para carousel ---
// Subir múltiples imágenes (reemplaza todas las existentes)
router.post('/carousel', 
    uploadCarouselMiddleware,
    handleMulterError,
    uploadCarouselImages
);

// Agregar una imagen individual al carousel
router.post('/carousel/add', 
    uploadHeroMiddleware, // Reutilizamos el middleware de una sola imagen
    handleMulterError,
    addCarouselImage
);

// Eliminar imagen del carousel
router.delete('/carousel/remove', removeCarouselImage);

// Reordenar imágenes del carousel
router.put('/carousel/reorder', reorderCarouselImages);

export default router;