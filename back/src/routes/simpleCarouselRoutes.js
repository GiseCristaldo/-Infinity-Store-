import express from 'express';
import { 
  getCarouselImages, 
  uploadCarouselImage, 
  updateImageText, 
  deleteImage,
  upload 
} from '../controllers/simpleCarouselController.js';
import { superAdminAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de super admin
router.use(superAdminAuth);

// Obtener imágenes del carousel
router.get('/', getCarouselImages);

// Subir imagen
router.post('/upload', upload.single('image'), uploadCarouselImage);

// Actualizar texto
router.put('/:index/text', updateImageText);

// Eliminar imagen
router.delete('/:index', deleteImage);

export default router;