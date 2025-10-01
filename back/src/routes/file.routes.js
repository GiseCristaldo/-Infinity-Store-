import express from 'express';
import { upload } from '../config/upload.js';
import {
    uploadFiles,
    getFilesByProduct,
    setPrimaryImage,
    deleteFile,
    reorderFiles
} from '../controllers/fileController.js';

const router = express.Router();

// --- Rutas para gestión de archivos ---

// Subir múltiples archivos para un producto
router.post('/upload/:productId', upload.array('files', 10), uploadFiles);

// Obtener archivos de un producto específico
router.get('/product/:productId', getFilesByProduct);

// Establecer imagen principal
router.put('/primary/:fileId', setPrimaryImage);

// Eliminar un archivo específico
router.delete('/:fileId', deleteFile);

// Reordenar archivos de un producto
router.put('/reorder/:productId', reorderFiles);

export default router;