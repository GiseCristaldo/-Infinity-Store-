import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function createColorPalettes() {
  let connection;
  
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'e-commerce'
    });
    
    console.log('✅ Conexión establecida');
    
    // Verificar si ya existen paletas
    const [existingPalettes] = await connection.execute('SELECT COUNT(*) as count FROM color_palettes');
    
    if (existingPalettes[0].count > 0) {
      console.log('✅ Las paletas de colores ya existen');
      return;
    }
    
    console.log('🔄 Creando paletas de colores...');
    
    // Paletas de colores predefinidas
    const palettes = [
      {
        name: 'Rosa Elegante',
        primary_color: '#d4a5a5',
        secondary_color: '#c9a9a9',
        accent_color: '#e8c4c4',
        text_color: '#5d4e4e',
        is_active: true
      },
      {
        name: 'Azul Profesional',
        primary_color: '#4a90e2',
        secondary_color: '#357abd',
        accent_color: '#7bb3f0',
        text_color: '#2c3e50',
        is_active: false
      },
      {
        name: 'Verde Natural',
        primary_color: '#27ae60',
        secondary_color: '#229954',
        accent_color: '#58d68d',
        text_color: '#1e3a2e',
        is_active: false
      },
      {
        name: 'Naranja Vibrante',
        primary_color: '#e67e22',
        secondary_color: '#d35400',
        accent_color: '#f39c12',
        text_color: '#2c1810',
        is_active: false
      },
      {
        name: 'Púrpura Moderno',
        primary_color: '#8e44ad',
        secondary_color: '#7d3c98',
        accent_color: '#bb8fce',
        text_color: '#2c1810',
        is_active: false
      },
      {
        name: 'Gris Minimalista',
        primary_color: '#34495e',
        secondary_color: '#2c3e50',
        accent_color: '#95a5a6',
        text_color: '#2c3e50',
        is_active: false
      },
      {
        name: 'Rojo Pasión',
        primary_color: '#e74c3c',
        secondary_color: '#c0392b',
        accent_color: '#f1948a',
        text_color: '#2c1810',
        is_active: false
      },
      {
        name: 'Turquesa Fresco',
        primary_color: '#1abc9c',
        secondary_color: '#16a085',
        accent_color: '#7fb3d3',
        text_color: '#2c3e50',
        is_active: false
      }
    ];
    
    // Insertar cada paleta
    for (const palette of palettes) {
      await connection.execute(`
        INSERT INTO color_palettes (name, primary_color, secondary_color, accent_color, text_color, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [
        palette.name,
        palette.primary_color,
        palette.secondary_color,
        palette.accent_color,
        palette.text_color,
        palette.is_active
      ]);
      
      console.log(`✅ Paleta "${palette.name}" creada`);
    }
    
    // Crear configuración inicial del sitio si no existe
    const [existingSettings] = await connection.execute('SELECT COUNT(*) as count FROM site_settings');
    
    if (existingSettings[0].count === 0) {
      console.log('🔄 Creando configuración inicial del sitio...');
      
      await connection.execute(`
        INSERT INTO site_settings (
          site_name, 
          hero_image_url, 
          carousel_images, 
          footer_content, 
          active_palette_id, 
          primary_font, 
          heading_font, 
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        'Infinity Store',
        null,
        JSON.stringify([]),
        '© 2024 Infinity Store. Todos los derechos reservados.',
        1, // Primera paleta (Rosa Elegante)
        'Inter',
        'Orbitron'
      ]);
      
      console.log('✅ Configuración inicial del sitio creada');
    }
    
    console.log('🎉 Paletas de colores creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la creación de paletas:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

createColorPalettes()
  .then(() => {
    console.log('✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });