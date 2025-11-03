import express from 'express';
import { adminAuth } from '../middlewares/authMiddleware.js';
import { 
  createClient, 
  getAllClients, 
  updateClient, 
  deactivateClient 
} from '../controllers/adminController.js';

const router = express.Router();

// Aplicar autenticación de administrador a todas las rutas de este router
router.use(adminAuth);

// Rutas de Gestión de Clientes para Administradores Regulares
// POST /api/admin/clients - Crear nuevo cliente (solo rol cliente permitido)
router.post('/clients', createClient);

// GET /api/admin/clients - Listar todos los clientes con paginación y búsqueda
router.get('/clients', getAllClients);

// PUT /api/admin/clients/:id - Actualizar detalles del cliente
router.put('/clients/:id', updateClient);

// DELETE /api/admin/clients/:id - Desactivar cliente (eliminación suave)
router.delete('/clients/:id', deactivateClient);

export default router;