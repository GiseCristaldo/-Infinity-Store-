import { SiteSettings } from '../src/models/index.js';

/**
 * Script para arreglar los datos del carousel que se corrompieron durante la migración
 */
async function fixCarouselData() {
    try {
        console.log('Arreglando datos del carousel...');
        
        // Obtener configuración actual
        const siteSettings = await SiteSettings.findOne();
        
        if (!siteSettings) {
            console.log('No se encontró configuración del sitio');
            return;
        }
        
        // Datos correctos basados en las imágenes disponibles
        const correctCarouselImages = [
            {
                image: '/uploads/customization/1762112527215-58830305.png',
                text: 'Tenemos nuevos Comics!!'
            },
            {
                image: '/uploads/customization/1762112527234-403305156.png',
                text: 'Cómics y Mangas con 20% OFF'
            },
            {
                image: '/uploads/customization/1762112527264-865195120.png',
                text: 'Ediciones Limitadas de cartas'
            }
        ];
        
        // Actualizar la base de datos
        await siteSettings.update({
            carousel_images: correctCarouselImages,
            updated_at: new Date()
        });
        
        console.log('✅ Datos del carousel arreglados exitosamente.');
        console.log('Imágenes del carousel:');
        correctCarouselImages.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img.image} - "${img.text}"`);
        });
        
    } catch (error) {
        console.error('❌ Error al arreglar datos:', error);
        throw error;
    }
}

// Ejecutar si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    fixCarouselData()
        .then(() => {
            console.log('Arreglo completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error:', error);
            process.exit(1);
        });
}

export { fixCarouselData };