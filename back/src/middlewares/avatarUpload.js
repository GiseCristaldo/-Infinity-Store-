import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Crear directorio de uploads si no existe
const uploadsDir = 'uploads/avatars';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp-userId-originalname
    const uniqueSuffix = Date.now() + '-' + req.user.id;
    const extension = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + extension);
  }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  }
});

// Middleware para manejar errores de multer
export const handleAvatarUpload = (req, res, next) => {
  const uploadSingle = upload.single('avatar');
  
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Máximo 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Error al subir archivo: ' + err.message
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    next();
  });
};

export default handleAvatarUpload;