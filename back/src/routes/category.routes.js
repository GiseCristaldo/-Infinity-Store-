import { Router } from 'express';

import {
    getCategories,
    getCategoriesById,
    createCategory,
    updateCategory,
    deleteCategory,
} from '../controllers/categoriesController.js';
import { upload } from '../config/upload.js';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Obtener todas las categorías activas
router.get('/', getCategories);
// Obtener categoría por ID
router.get('/:id', getCategoriesById);

// Rutas protegidas para administradores (CRUD de categorías)
router.post('/', verifyToken, isAdmin, upload.single('image'), createCategory);    // Crear una nueva categoría con imagen (Admin)
router.put('/:id', verifyToken, isAdmin, upload.single('image'), updateCategory);  // Actualizar una categoría con nueva imagen (Admin)
router.delete('/:id', verifyToken, isAdmin, deleteCategory); // Eliminar lógicamente una categoría (Admin)

export default router;