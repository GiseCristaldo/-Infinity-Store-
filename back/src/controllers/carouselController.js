import { CarouselImage } from '../models/index.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/customization';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Obtener todas las imágenes del carousel
export const getCarouselImages = async (req, res) => {
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
    console.error('Error getting carousel images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener imágenes del carousel'
    });
  }
};

// Subir nueva imagen al carousel
export const uploadCarouselImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió ninguna imagen'
      });
    }

    // Verificar límite de 5 imágenes
    const currentCount = await CarouselImage.count({
      where: { is_active: true }
    });

    if (currentCount >= 5) {
      // Eliminar archivo subido
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Máximo 5 imágenes permitidas en el carousel'
      });
    }

    // Crear nueva imagen en la base de datos
    const newImage = await CarouselImage.create({
      image_url: `/uploads/customization/${req.file.filename}`,
      title: 'Nueva Imagen',
      subtitle: 'Descripción de la imagen',
      display_order: currentCount,
      created_by: req.user?.id || 1,
      updated_by: req.user?.id || 1
    });

    // Obtener todas las imágenes actualizadas
    const allImages = await CarouselImage.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });

    const formattedImages = allImages.map(img => ({
      id: img.id,
      image: img.image_url,
      title: img.title || '',
      subtitle: img.subtitle || ''
    }));

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: formattedImages
    });
  } catch (error) {
    console.error('Error uploading carousel image:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen'
    });
  }
};

// Actualizar texto de una imagen
export const updateImageText = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle } = req.body;

    const image = await CarouselImage.findByPk(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Actualizar la imagen
    await image.update({
      title: title || '',
      subtitle: subtitle || '',
      updated_by: req.user?.id || 1
    });

    // Obtener todas las imágenes actualizadas
    const allImages = await CarouselImage.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });

    const formattedImages = allImages.map(img => ({
      id: img.id,
      image: img.image_url,
      title: img.title || '',
      subtitle: img.subtitle || ''
    }));

    res.json({
      success: true,
      message: 'Texto actualizado exitosamente',
      data: formattedImages
    });
  } catch (error) {
    console.error('Error updating image text:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar texto'
    });
  }
};

// Eliminar imagen del carousel
export const deleteCarouselImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await CarouselImage.findByPk(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Eliminar archivo físico si existe
    if (image.image_url && !image.image_url.startsWith('http')) {
      const filePath = path.join(process.cwd(), image.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Marcar como inactiva en lugar de eliminar
    await image.update({
      is_active: false,
      updated_by: req.user?.id || 1
    });

    // Obtener todas las imágenes activas
    const allImages = await CarouselImage.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']]
    });

    const formattedImages = allImages.map(img => ({
      id: img.id,
      image: img.image_url,
      title: img.title || '',
      subtitle: img.subtitle || ''
    }));

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      data: formattedImages
    });
  } catch (error) {
    console.error('Error deleting carousel image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen'
    });
  }
};