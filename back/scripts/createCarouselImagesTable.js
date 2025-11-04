import { sequelize } from '../src/config/database.js';

async function createCarouselImagesTable() {
  try {
    console.log('🏗️ Creando tabla carousel_images...');
    
    await sequelize.authenticate();
    
    // Crear la tabla carousel_images
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS carousel_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        title VARCHAR(255) DEFAULT '',
        subtitle TEXT,
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        updated_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id),
        FOREIGN KEY (updated_by) REFERENCES users(id)
      )
    `);
    
    console.log('✅ Tabla carousel_images creada exitosamente');
    
    // Migrar datos existentes del JSON a la nueva tabla
    console.log('📦 Migrando datos existentes...');
    
    const [siteSettings] = await sequelize.query(
      'SELECT carousel_images FROM site_settings WHERE id = 1'
    );
    
    if (siteSettings.length > 0 && siteSettings[0].carousel_images) {
      const existingImages = siteSettings[0].carousel_images;
      
      for (let i = 0; i < existingImages.length; i++) {
        const img = existingImages[i];
        await sequelize.query(`
          INSERT INTO carousel_images (image_url, title, subtitle, display_order, created_by, updated_by)
          VALUES (?, ?, ?, ?, 1, 1)
        `, {
          replacements: [
            img.image || '',
            img.title || '',
            img.subtitle || '',
            i
          ]
        });
        console.log(`✅ Migrada imagen ${i + 1}: ${img.title || 'Sin título'}`);
      }
    }
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

createCarouselImagesTable();