import express from 'express';
import {
  getProducts,       
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductWithFiles,
  updateProductWithFiles
} from '../controllers/productController.js';

import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import { upload } from '../config/upload.js';
import { Product } from '../models/index.js';

const router = express.Router();

// Rutas públicas de productos
router.get('/', getProducts);         
router.get('/:id', getProductById);   

// Rutas protegidas para administradores (CRUD de productos)

// Rutas para productos con múltiples archivos
router.post('/with-files', verifyToken, isAdmin, upload.array('images', 5), createProductWithFiles);
router.put('/:id/with-files', verifyToken, isAdmin, upload.array('images', 5), updateProductWithFiles);

// Rutas originales para compatibilidad (imagen única)
router.post('/', verifyToken, isAdmin, upload.single('image'), createProduct);    
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateProduct);  
router.delete('/:id', verifyToken, isAdmin, deleteProduct); 

// El endpoint de subir múltiples imágenes sí puede mantenerse por separado
// AÑADIMOS EL MIDDLEWARE DE AUTENTICACIÓN
router.post('/upload/multiple/:id', verifyToken, isAdmin, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No se subieron archivos.' });
    }

    // Aquí podrías agregar lógica adicional para manejar la subida
    // Por ahora, simplemente devolvemos éxito
    res.json({ 
        message: 'Archivos subidos exitosamente.',
        files: req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path
        }))
    });

  } catch (error) {
    console.error('Error al subir archivos:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

export default router;