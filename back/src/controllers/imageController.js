import { SiteSettings, CustomizationHistory } from '../models/index.js';
import { cleanupFiles, validateImageDimensions } from '../middlewares/imageUpload.js';
import { clearSettingsCache } from './customizationController.js';
import fs from 'fs';
import path from 'path';

// --- Subir imagen hero ---
export const uploadHeroImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ninguna imagen'
            });
        }

        // Validar dimensiones de la imagen
        const isValidDimensions = await validateImageDimensions(req.file.path, 'hero');
        if (!isValidDimensions) {
            cleanupFiles(req.file);
            return res.status(400).json({
                success: false,
                message: 'Dimensiones de imagen no válidas para hero section'
            });
        }

        // Obtener configuración actual
        let siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            siteSettings = await SiteSettings.create({
                site_name: 'Infinity Store',
                updated_by: req.user.id
            });
        }

        // Guardar imagen anterior para el historial
        const oldHeroImage = siteSettings.hero_image_url;

        // Eliminar imagen anterior si existe
        if (oldHeroImage) {
            const oldImagePath = path.join('uploads/customization', path.basename(oldHeroImage));
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        // Actualizar con la nueva imagen
        const newImageUrl = `/uploads/customization/${req.file.filename}`;
        await siteSettings.update({
            hero_image_url: newImageUrl,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        // Clear settings cache after update
        clearSettingsCache();

        // Registrar en historial
        await CustomizationHistory.create({
            change_type: 'hero_image',
            old_value: { hero_image_url: oldHeroImage },
            new_value: { hero_image_url: newImageUrl },
            changed_by: req.user.id,
            changed_at: new Date()
        });

        res.json({
            success: true,
            message: 'Imagen hero actualizada exitosamente',
            data: {
                hero_image_url: newImageUrl,
                filename: req.file.filename
            }
        });

    } catch (error) {
        console.error('Error al subir imagen hero:', error);
        cleanupFiles(req.file);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al subir imagen hero'
        });
    }
};

// --- Subir imágenes de carousel ---
export const uploadCarouselImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No se han subido imágenes'
            });
        }

        // Validar dimensiones de todas las imágenes
        for (const file of req.files) {
            const isValidDimensions = await validateImageDimensions(file.path, 'carousel');
            if (!isValidDimensions) {
                cleanupFiles(req.files);
                return res.status(400).json({
                    success: false,
                    message: 'Dimensiones de imagen no válidas para carousel'
                });
            }
        }

        // Obtener configuración actual
        let siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            siteSettings = await SiteSettings.create({
                site_name: 'Infinity Store',
                updated_by: req.user.id
            });
        }

        // Obtener imágenes actuales del carousel
        const currentCarouselImages = siteSettings.carousel_images || [];

        // Crear objetos para las nuevas imágenes con texto por defecto
        const newImages = req.files.map((file, index) => ({
            image: `/uploads/customization/${file.filename}`,
            text: `Slide ${currentCarouselImages.length + index + 1}` // Continuar numeración
        }));

        // Agregar las nuevas imágenes a las existentes
        const updatedCarouselImages = [...currentCarouselImages, ...newImages];

        // Actualizar con todas las imágenes (existentes + nuevas)
        await siteSettings.update({
            carousel_images: updatedCarouselImages,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        // Clear settings cache after update
        clearSettingsCache();

        // Registrar en historial
        await CustomizationHistory.create({
            change_type: 'carousel',
            old_value: { carousel_images: currentCarouselImages },
            new_value: { carousel_images: updatedCarouselImages },
            changed_by: req.user.id,
            changed_at: new Date()
        });

        res.json({
            success: true,
            message: `${req.files.length} imágenes agregadas al carousel exitosamente`,
            data: {
                carousel_images: updatedCarouselImages,
                uploaded_count: req.files.length,
                total_images: updatedCarouselImages.length
            }
        });

    } catch (error) {
        console.error('Error al subir imágenes de carousel:', error);
        cleanupFiles(req.files);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al subir imágenes de carousel'
        });
    }
};

// --- Agregar imagen individual al carousel ---
export const addCarouselImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No se ha subido ninguna imagen'
            });
        }

        // Validar dimensiones de la imagen
        const isValidDimensions = await validateImageDimensions(req.file.path, 'carousel');
        if (!isValidDimensions) {
            cleanupFiles(req.file);
            return res.status(400).json({
                success: false,
                message: 'Dimensiones de imagen no válidas para carousel'
            });
        }

        // Obtener configuración actual
        let siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            siteSettings = await SiteSettings.create({
                site_name: 'Infinity Store',
                updated_by: req.user.id
            });
        }

        // Obtener imágenes actuales del carousel
        const currentImages = siteSettings.carousel_images || [];
        
        // Verificar límite de imágenes (máximo 10)
        if (currentImages.length >= 10) {
            cleanupFiles(req.file);
            return res.status(400).json({
                success: false,
                message: 'Máximo 10 imágenes permitidas en el carousel'
            });
        }

        // Agregar nueva imagen con texto por defecto
        const newImageObject = {
            image: `/uploads/customization/${req.file.filename}`,
            text: `Slide ${currentImages.length + 1}`
        };
        const updatedImages = [...currentImages, newImageObject];

        // Actualizar configuración
        await siteSettings.update({
            carousel_images: updatedImages,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        // Clear settings cache after update
        clearSettingsCache();

        // Registrar en historial
        await CustomizationHistory.create({
            change_type: 'carousel',
            old_value: { carousel_images: currentImages },
            new_value: { carousel_images: updatedImages },
            changed_by: req.user.id,
            changed_at: new Date()
        });

        res.json({
            success: true,
            message: 'Imagen agregada al carousel exitosamente',
            data: {
                carousel_images: updatedImages,
                new_image: newImageUrl
            }
        });

    } catch (error) {
        console.error('Error al agregar imagen al carousel:', error);
        cleanupFiles(req.file);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al agregar imagen al carousel'
        });
    }
};

// --- Eliminar imagen del carousel ---
export const removeCarouselImage = async (req, res) => {
    try {
        // Puede recibir imageUrl del body o imageIndex del parámetro
        const { imageUrl } = req.body;
        const { id: imageIndex } = req.params;

        if (!imageUrl && imageIndex === undefined) {
            return res.status(400).json({
                success: false,
                message: 'URL de imagen o índice de imagen requerido'
            });
        }

        // Obtener configuración actual
        const siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            return res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
        }

        const currentImages = siteSettings.carousel_images || [];
        let updatedImages;
        let imageToDelete;

        if (imageUrl) {
            // Eliminar por URL
            const imageExists = currentImages.some(img => 
                (typeof img === 'string' && img === imageUrl) || 
                (typeof img === 'object' && img.image === imageUrl)
            );
            
            if (!imageExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Imagen no encontrada en el carousel'
                });
            }

            updatedImages = currentImages.filter(img => 
                (typeof img === 'string' && img !== imageUrl) || 
                (typeof img === 'object' && img.image !== imageUrl)
            );
            imageToDelete = imageUrl;
        } else {
            // Eliminar por índice
            const index = parseInt(imageIndex);
            if (isNaN(index) || index < 0 || index >= currentImages.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Índice de imagen inválido'
                });
            }

            const imageData = currentImages[index];
            imageToDelete = typeof imageData === 'string' ? imageData : imageData.image;
            
            updatedImages = currentImages.filter((_, i) => i !== index);
        }

        // Eliminar archivo físico
        const imagePath = path.join('uploads/customization', path.basename(imageToDelete));
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Actualizar configuración
        await siteSettings.update({
            carousel_images: updatedImages,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        // Clear settings cache after update
        clearSettingsCache();

        // Registrar en historial
        await CustomizationHistory.create({
            change_type: 'carousel',
            old_value: { carousel_images: currentImages },
            new_value: { carousel_images: updatedImages },
            changed_by: req.user.id,
            changed_at: new Date()
        });

        res.json({
            success: true,
            message: 'Imagen eliminada del carousel exitosamente',
            data: {
                carousel_images: updatedImages,
                removed_image: imageToDelete
            }
        });

    } catch (error) {
        console.error('Error al eliminar imagen del carousel:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar imagen del carousel'
        });
    }
};

// --- Actualizar texto de imagen del carousel ---
export const updateCarouselImageText = async (req, res) => {
    try {
        const { imageIndex, text } = req.body;

        if (imageIndex === undefined || text === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Índice de imagen y texto son requeridos'
            });
        }

        // Validar que el índice sea un número válido
        const index = parseInt(imageIndex);
        if (isNaN(index) || index < 0) {
            return res.status(400).json({
                success: false,
                message: 'Índice de imagen debe ser un número válido'
            });
        }

        // Validar longitud del texto
        if (typeof text !== 'string' || text.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'El texto debe ser una cadena de máximo 200 caracteres'
            });
        }

        // Obtener configuración actual
        const siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            return res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
        }

        const currentImages = siteSettings.carousel_images || [];
        
        // Verificar que el índice existe
        if (index >= currentImages.length) {
            return res.status(404).json({
                success: false,
                message: 'Índice de imagen no encontrado'
            });
        }

        // Actualizar el texto de la imagen
        const updatedImages = [...currentImages];
        updatedImages[index] = {
            ...updatedImages[index],
            text: text.trim()
        };

        // Actualizar configuración
        await siteSettings.update({
            carousel_images: updatedImages,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        // Clear settings cache after update
        clearSettingsCache();

        // Registrar en historial
        await CustomizationHistory.create({
            change_type: 'carousel',
            old_value: { carousel_images: currentImages },
            new_value: { carousel_images: updatedImages },
            changed_by: req.user.id,
            changed_at: new Date()
        });

        res.json({
            success: true,
            message: 'Texto de imagen actualizado exitosamente',
            data: {
                carousel_images: updatedImages,
                updated_index: index,
                new_text: text.trim()
            }
        });

    } catch (error) {
        console.error('Error al actualizar texto de imagen del carousel:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar texto de imagen'
        });
    }
};

// --- Reordenar imágenes del carousel ---
export const reorderCarouselImages = async (req, res) => {
    try {
        const { imageOrder } = req.body; // Array de URLs en el nuevo orden

        if (!Array.isArray(imageOrder)) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de URLs en el nuevo orden'
            });
        }

        // Obtener configuración actual
        const siteSettings = await SiteSettings.findOne();
        if (!siteSettings) {
            return res.status(404).json({
                success: false,
                message: 'Configuración no encontrada'
            });
        }

        const currentImages = siteSettings.carousel_images || [];

        // Extraer URLs de las imágenes actuales (manejar tanto formato antiguo como nuevo)
        const currentUrls = currentImages.map(img => 
            typeof img === 'string' ? img : img.image
        );

        // Verificar que todas las URLs proporcionadas existen en el carousel actual
        const invalidUrls = imageOrder.filter(url => !currentUrls.includes(url));
        if (invalidUrls.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'URLs de imagen inválidas encontradas',
                invalid_urls: invalidUrls
            });
        }

        // Verificar que no falten URLs
        if (imageOrder.length !== currentImages.length) {
            return res.status(400).json({
                success: false,
                message: 'El número de imágenes no coincide con el carousel actual'
            });
        }

        // Crear el nuevo array manteniendo los textos originales
        const reorderedImages = imageOrder.map(url => {
            const originalImage = currentImages.find(img => 
                (typeof img === 'string' && img === url) || 
                (typeof img === 'object' && img.image === url)
            );
            
            if (typeof originalImage === 'string') {
                return originalImage;
            } else {
                return originalImage; // Ya es un objeto con image y text
            }
        });

        // Actualizar configuración con el nuevo orden
        await siteSettings.update({
            carousel_images: reorderedImages,
            updated_by: req.user.id,
            updated_at: new Date()
        });

        // Clear settings cache after update
        clearSettingsCache();

        // Registrar en historial
        await CustomizationHistory.create({
            change_type: 'carousel',
            old_value: { carousel_images: currentImages },
            new_value: { carousel_images: reorderedImages },
            changed_by: req.user.id,
            changed_at: new Date()
        });

        res.json({
            success: true,
            message: 'Orden del carousel actualizado exitosamente',
            data: {
                carousel_images: reorderedImages
            }
        });

    } catch (error) {
        console.error('Error al reordenar imágenes del carousel:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al reordenar imágenes del carousel'
        });
    }
};