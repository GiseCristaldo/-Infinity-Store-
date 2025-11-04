import { SiteSettings } from '../src/models/index.js';
import { sequelize } from '../src/config/database.js';

async function migrateCarouselStructure() {
  try {
    console.log('🔄 Iniciando migración de estructura del carousel...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    const settings = await SiteSettings.findOne();
    
    if (!settings) {
      console.log('ℹ️ No se encontraron configuraciones');
      return;
    }

    console.log('📊 Configuraciones encontradas:', settings.id);
    console.log('🎠 Carousel images actuales:', JSON.stringify(settings.carousel_images, null, 2));

    if (!settings.carousel_images || settings.carousel_images.length === 0) {
      console.log('ℹ️ No hay imágenes de carousel para migrar');
      return;
    }

    // Migrar estructura de 'text' a 'title' y 'subtitle'
    const migratedImages = settings.carousel_images.map((img, index) => {
      if (img.text && !img.title) {
        console.log(`🔄 Migrando imagen ${index + 1}: "${img.text}" -> title`);
        return {
          image: img.image,
          title: img.text,
          subtitle: img.subtitle || ''
        };
      }
      return img;
    });

    // Actualizar en la base de datos
    await settings.update({
      carousel_images: migratedImages
    });

    console.log('✅ Migración completada');
    console.log('🎠 Nuevas imágenes:', JSON.stringify(migratedImages, null, 2));

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

migrateCarouselStructure();