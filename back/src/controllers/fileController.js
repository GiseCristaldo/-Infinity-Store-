import { File, Product } from '../models/index.js';
import fs from 'fs';
import path from 'path';

// --- Subir múltiples archivos para un producto ---
export const uploadFiles = async (req, res) => {
    try {
        const { productId } = req.params;
        const files = req.files;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: 'No se han subido archivos.' });
        }

        // Verificar que el producto existe
        const product = await Product.findByPk(productId);
        if (!product) {
            // Eliminar archivos subidos si el producto no existe
            files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
            return res.status(404).json({ message: 'Producto no encontrado.' });
        }

        // Obtener el orden máximo actual para este producto
        const maxOrder = await File.max('order', { where: { productId } }) || 0;

        // Crear registros de archivos en la base de datos
        const fileRecords = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileRecord = await File.create({
                filename: file.filename,
                originalName: file.originalname,
                path: file.path,
                mimeType: file.mimetype,
                size: file.size,
                productId: parseInt(productId),
                isPrimary: false, // Por defecto no es primaria
                order: maxOrder + i + 1,
                active: true
            });
            fileRecords.push(fileRecord);
        }

        res.status(201).json({
            message: 'Archivos subidos exitosamente.',
            files: fileRecords
        });

    } catch (error) {
        console.error('Error al subir archivos:', error);
        
        // Limpiar archivos subidos en caso de error
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        
        res.status(500).json({ message: 'Error interno del servidor al subir archivos.' });
    }
};

// --- Obtener archivos de un producto ---
export const getFilesByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const files = await File.findAll({
            where: { 
                productId: parseInt(productId),
                active: true 
            },
            order: [['order', 'ASC'], ['createdAt', 'ASC']]
        });

        // Formatear las rutas para el frontend
        const filesWithUrls = files.map(file => ({
            ...file.toJSON(),
            url: `http://localhost:3001/${file.path}`
        }));

        res.json(filesWithUrls);

    } catch (error) {
        console.error('Error al obtener archivos del producto:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener archivos.' });
    }
};

// --- Establecer imagen principal ---
export const setPrimaryImage = async (req, res) => {
    try {
        const { fileId } = req.params;
        const { productId } = req.body;

        // Verificar que el archivo existe y pertenece al producto
        const file = await File.findOne({
            where: { 
                id: parseInt(fileId),
                productId: parseInt(productId),
                active: true 
            }
        });

        if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado.' });
        }

        // Quitar la marca de primaria de todas las imágenes del producto
        await File.update(
            { isPrimary: false },
            { where: { productId: parseInt(productId) } }
        );

        // Establecer la nueva imagen principal
        await file.update({ isPrimary: true });

        res.json({ message: 'Imagen principal establecida exitosamente.' });

    } catch (error) {
        console.error('Error al establecer imagen principal:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// --- Eliminar archivo ---
export const deleteFile = async (req, res) => {
    try {
        const { fileId } = req.params;

        const file = await File.findByPk(fileId);
        if (!file) {
            return res.status(404).json({ message: 'Archivo no encontrado.' });
        }

        // Eliminar archivo físico del servidor
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        // Eliminar registro de la base de datos
        await file.destroy();

        res.json({ message: 'Archivo eliminado exitosamente.' });

    } catch (error) {
        console.error('Error al eliminar archivo:', error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar archivo.' });
    }
};

// --- Reordenar archivos ---
export const reorderFiles = async (req, res) => {
    try {
        const { productId } = req.params;
        const { fileOrders } = req.body; // Array de objetos { fileId, order }

        if (!Array.isArray(fileOrders)) {
            return res.status(400).json({ message: 'Se requiere un array de órdenes de archivos.' });
        }

        // Actualizar el orden de cada archivo
        for (const { fileId, order } of fileOrders) {
            await File.update(
                { order: parseInt(order) },
                { 
                    where: { 
                        id: parseInt(fileId),
                        productId: parseInt(productId)
                    }
                }
            );
        }

        res.json({ message: 'Orden de archivos actualizado exitosamente.' });

    } catch (error) {
        console.error('Error al reordenar archivos:', error);
        res.status(500).json({ message: 'Error interno del servidor al reordenar archivos.' });
    }
};