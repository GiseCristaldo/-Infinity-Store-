import express from 'express';
// Importamos las funciones de administración y perfil
import {
  getAllUsers,
  updateUser,
  deleteUser,
  updateProfile,
  getProfile,
  registerUser
} from '../controllers/userController.js';

// Importa los middlewares 
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import { handleAvatarUpload } from '../middlewares/avatarUpload.js';

const router = express.Router();

// Alias público para registro: /api/users/register
router.post('/register', registerUser);

// Rutas de perfil de usuario (usuario autenticado)
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, handleAvatarUpload, updateProfile);

// Rutas de administración de usuarios (solo admin)
router.get('/admin', verifyToken, isAdmin, getAllUsers); 
router.put('/admin/:id', verifyToken, isAdmin, updateUser); 

export default router;