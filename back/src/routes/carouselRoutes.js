import express from 'express';
import { 
  getCarouselImages, 
  uploadCarouselImage, 
  updateImageText, 
  deleteCarouselImage,
  upload 
} from '../controllers/carouselController.js';
import { CarouselImage } from '../models/index.js';
import { superAdminAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint público para obtener imágenes del carousel (para el home)
router.get('/public', async (req, res) => {
  try {
    const images = await CarouselImage.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });

    // Convertir al formato esperado por el frontend
    const formattedImages = images.map(img => ({
      id: img.id,
      image: img.image_url,
      title: img.title || '',
      subtitle: img.subtitle || ''
    }));

    res.json({
      success: true,
      data: formattedImages
    });
  } catch (error) {
    console.error('Error getting public carousel images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener imágenes del carousel'
    });
  }
});

// Todas las rutas siguientes requieren autenticación de super admin
router.use(superAdminAuth);

// GET /api/carousel-new - Obtener todas las imágenes del carousel
router.get('/', getCarouselImages);

// POST /api/carousel-new/upload - Subir nueva imagen
router.post('/upload', upload.single('image'), uploadCarouselImage);

// PUT /api/carousel-new/:id/text - Actualizar texto de una imagen
router.put('/:id/text', updateImageText);

// DELETE /api/carousel-new/:id - Eliminar imagen
router.delete('/:id', deleteCarouselImage);

export default router;