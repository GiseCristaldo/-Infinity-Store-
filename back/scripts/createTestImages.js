import { SiteSettings } from '../src/models/index.js';

/**
 * Script para crear imágenes de prueba en el carousel
 */
async function createTestImages() {
    try {
        console.log('Creando imágenes de prueba para el carousel...');
        
        // Obtener configuración actual
        let siteSettings = await SiteSettings.findOne();
        
        if (!siteSettings) {
            siteSettings = await SiteSettings.getOrCreateDefault();
        }
        
        // Crear imágenes de prueba usando URLs externas
        const testImages = [
            {
                image: 'https://picsum.photos/800/400?random=1',
                text: 'Imagen de Prueba 1 - Editable'
            },
            {
                image: 'https://picsum.photos/800/400?random=2',
                text: 'Imagen de Prueba 2 - También Editable'
            },
            {
                image: 'https://picsum.photos/800/400?random=3',
                text: 'Imagen de Prueba 3 - Texto Personalizable'
            }
        ];
        
        // Actualizar la base de datos
        await siteSettings.update({
            carousel_images: testImages,
            updated_at: new Date()
        });
        
        console.log('✅ Imágenes de prueba creadas exitosamente.');
        console.log('Imágenes del carousel:');
        testImages.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img.image} - "${img.text}"`);
        });
        
    } catch (error) {
        console.error('❌ Error al crear imágenes de prueba:', error);
        throw error;
    }
}

// Ejecutar si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    createTestImages()
        .then(() => {
            console.log('Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error:', error);
            process.exit(1);
        });
}

export { createTestImages };