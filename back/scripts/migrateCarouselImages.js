import { SiteSettings } from '../src/models/index.js';

/**
 * Script para migrar las imágenes del carousel del formato antiguo (array de strings)
 * al nuevo formato (array de objetos con image y text)
 */
async function migrateCarouselImages() {
    try {
        console.log('Iniciando migración de imágenes del carousel...');
        
        // Obtener configuración actual
        const siteSettings = await SiteSettings.findOne();
        
        if (!siteSettings) {
            console.log('No se encontró configuración del sitio');
            return;
        }
        
        const currentImages = siteSettings.carousel_images || [];
        
        if (currentImages.length === 0) {
            console.log('No hay imágenes del carousel para migrar');
            return;
        }
        
        // Verificar si ya están en el nuevo formato
        const isAlreadyMigrated = currentImages.every(img => 
            typeof img === 'object' && img.hasOwnProperty('image') && img.hasOwnProperty('text')
        );
        
        if (isAlreadyMigrated) {
            console.log('Las imágenes del carousel ya están en el nuevo formato');
            return;
        }
        
        // Migrar al nuevo formato
        const migratedImages = currentImages.map((imageData, index) => {
            if (typeof imageData === 'string') {
                // Formato antiguo: solo URL
                return {
                    image: imageData,
                    text: `Slide ${index + 1}` // Texto por defecto
                };
            } else if (typeof imageData === 'object' && imageData.image) {
                // Ya está en el nuevo formato o parcialmente migrado
                return {
                    image: imageData.image,
                    text: imageData.text || `Slide ${index + 1}`
                };
            } else {
                // Formato desconocido, usar valores por defecto
                console.warn(`Formato desconocido para imagen en índice ${index}:`, imageData);
                return {
                    image: imageData.toString(),
                    text: `Slide ${index + 1}`
                };
            }
        });
        
        // Actualizar la base de datos
        await siteSettings.update({
            carousel_images: migratedImages,
            updated_at: new Date()
        });
        
        console.log(`✅ Migración completada exitosamente. ${migratedImages.length} imágenes migradas.`);
        console.log('Nuevas imágenes del carousel:');
        migratedImages.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img.image} - "${img.text}"`);
        });
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        throw error;
    }
}

// Ejecutar la migración si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateCarouselImages()
        .then(() => {
            console.log('Migración completada');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error en la migración:', error);
            process.exit(1);
        });
}

export { migrateCarouselImages };