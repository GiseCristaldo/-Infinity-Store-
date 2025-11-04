import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio para imágenes de customización si no existe
const customizationUploadsDir = 'uploads/customization';
if (!fs.existsSync(customizationUploadsDir)) {
    fs.mkdirSync(customizationUploadsDir, { recursive: true });
}

// Configuración específica para imágenes de customización
const customizationStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, customizationUploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Validación de archivos de imagen
const imageFileFilter = (req, file, cb) => {
    // Verificar que sea una imagen
    if (!file.mimetype.startsWith('image/')) {
        return cb(new Error('Solo se permiten archivos de imagen'), false);
    }

    // Formatos permitidos
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Formato de imagen no permitido. Use JPG, PNG o WebP'), false);
    }

    cb(null, true);
};

// Configuración para imagen hero (una sola imagen)
export const uploadHeroImage = multer({
    storage: customizationStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 1 // Solo una imagen
    }
}).single('heroImage');

// Configuración para imágenes de carousel (múltiples imágenes)
export const uploadCarouselImages = multer({
    storage: customizationStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB máximo por imagen
        files: 10 // Máximo 10 imágenes
    }
}).array('carouselImages', 10);

// Middleware para manejar errores de multer
export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'El archivo es demasiado grande',
                    error: 'Tamaño máximo: 5MB para hero, 3MB para carousel'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Demasiados archivos',
                    error: 'Máximo 10 imágenes para carousel'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Campo de archivo inesperado',
                    error: 'Use "heroImage" o "carouselImages"'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Error en la subida de archivo',
                    error: error.message
                });
        }
    }

    if (error.message.includes('Solo se permiten archivos de imagen') || 
        error.message.includes('Formato de imagen no permitido')) {
        return res.status(400).json({
            success: false,
            message: error.message,
            error: 'Formatos permitidos: JPG, PNG, WebP'
        });
    }

    next(error);
};

// Función para validar dimensiones de imagen (se usará en el controlador)
export const validateImageDimensions = (imagePath, type) => {
    return new Promise((resolve, reject) => {
        // Para esta implementación básica, aceptamos cualquier dimensión
        // En una implementación más avanzada, podrías usar sharp para verificar dimensiones
        resolve(true);
    });
};

// Función para limpiar archivos en caso de error
export const cleanupFiles = (files) => {
    if (!files) return;
    
    const fileArray = Array.isArray(files) ? files : [files];
    
    fileArray.forEach(file => {
        if (file && file.path && fs.existsSync(file.path)) {
            try {
                fs.unlinkSync(file.path);
            } catch (error) {
                console.error('Error al eliminar archivo:', error);
            }
        }
    });
}; 

// Middleware genérico para subir una sola imagen
export const uploadSingleImage = multer({
    storage: customizationStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
        files: 1 // Solo una imagen
    }
}).single('image'); // Campo 'image' como envía el frontend