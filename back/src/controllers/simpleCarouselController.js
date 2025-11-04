import { SiteSettings } from '../models/index.js';
import { sequelize } from '../config/database.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración simple de multer
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

// Obtener imágenes del carousel
export const getCarouselImages = async (req, res) => {
  try {
    const settings = await SiteSettings.findOne();
    const images = settings?.carousel_images || [];
    
    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    console.error('Error getting carousel images:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener imágenes'
    });
  }
};

// Subir imagen al carousel
export const uploadCarouselImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se subió ninguna imagen'
      });
    }

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        site_name: 'Fitt Store',
        carousel_images: []
      });
    }

    const currentImages = settings.carousel_images || [];
    
    if (currentImages.length >= 5) {
      // Eliminar archivo subido
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Máximo 5 imágenes permitidas'
      });
    }

    const newImage = {
      image: `/uploads/customization/${req.file.filename}`,
      title: 'Nueva Imagen',
      subtitle: 'Descripción de la imagen'
    };

    currentImages.push(newImage);

    await settings.update({
      carousel_images: currentImages
    });

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: currentImages
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Error al subir imagen'
    });
  }
};

// Actualizar texto de imagen
export const updateImageText = async (req, res) => {
  try {
    const { index } = req.params;
    const { title, subtitle } = req.body;

    console.log('🔍 [UpdateText] Parámetros recibidos:', { index, title, subtitle });

    const settings = await SiteSettings.findOne();
    if (!settings) {
      console.log('❌ [UpdateText] No se encontró configuración');
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
    }

    console.log('📊 [UpdateText] Configuración encontrada, ID:', settings.id);
    const images = settings.carousel_images || [];
    console.log('🎠 [UpdateText] Imágenes actuales:', JSON.stringify(images, null, 2));
    
    const imageIndex = parseInt(index);
    console.log('🔢 [UpdateText] Índice parseado:', imageIndex);

    if (imageIndex < 0 || imageIndex >= images.length) {
      console.log('❌ [UpdateText] Índice inválido:', imageIndex, 'Longitud:', images.length);
      return res.status(400).json({
        success: false,
        message: 'Índice de imagen inválido'
      });
    }

    console.log('📝 [UpdateText] Imagen antes:', JSON.stringify(images[imageIndex], null, 2));
    
    images[imageIndex] = {
      ...images[imageIndex],
      title: title || '',
      subtitle: subtitle || ''
    };

    console.log('📝 [UpdateText] Imagen después:', JSON.stringify(images[imageIndex], null, 2));
    console.log('🎠 [UpdateText] Array completo después:', JSON.stringify(images, null, 2));

    // Usar SQL directo para forzar la actualización
    await sequelize.query(
      'UPDATE site_settings SET carousel_images = ? WHERE id = ?',
      {
        replacements: [JSON.stringify(images), settings.id],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log('💾 [UpdateText] Actualización SQL directa completada');

    res.json({
      success: true,
      message: 'Texto actualizado exitosamente',
      data: images
    });
  } catch (error) {
    console.error('❌ [UpdateText] Error updating text:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar texto'
    });
  }
};

// Eliminar imagen
export const deleteImage = async (req, res) => {
  try {
    const { index } = req.params;

    const settings = await SiteSettings.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Configuración no encontrada'
      });
    }

    const images = settings.carousel_images || [];
    const imageIndex = parseInt(index);

    if (imageIndex < 0 || imageIndex >= images.length) {
      return res.status(400).json({
        success: false,
        message: 'Índice de imagen inválido'
      });
    }

    const imageToDelete = images[imageIndex];
    
    // Eliminar archivo físico si existe
    if (imageToDelete.image && !imageToDelete.image.startsWith('http')) {
      const filePath = path.join(process.cwd(), imageToDelete.image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar de la lista
    images.splice(imageIndex, 1);

    await settings.update({
      carousel_images: images
    });

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      data: images
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar imagen'
    });
  }
};