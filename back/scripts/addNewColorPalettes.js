import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addNewColorPalettes() {
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
    
    // Nuevas paletas basadas en la imagen proporcionada
    const newPalettes = [
      {
        name: 'Monocromático Elegante',
        primary_color: '#141414',
        secondary_color: '#ffffff',
        accent_color: '#f0f0f0',
        text_color: '#141414',
        is_active: false
      },
      {
        name: 'Lavanda Suave',
        primary_color: '#b4b4dc',
        secondary_color: '#c8dcf0',
        accent_color: '#f0f0f0',
        text_color: '#141414',
        is_active: false
      },
      {
        name: 'Azul Serenidad',
        primary_color: '#b4c8dc',
        secondary_color: '#c8dcf0',
        accent_color: '#ffffff',
        text_color: '#141414',
        is_active: false
      },
      {
        name: 'Contraste Moderno',
        primary_color: '#141414',
        secondary_color: '#b4b4dc',
        accent_color: '#f0f0f0',
        text_color: '#ffffff',
        is_active: false
      },
      {
        name: 'Cielo Nublado',
        primary_color: '#c8dcf0',
        secondary_color: '#b4c8dc',
        accent_color: '#f0f0f0',
        text_color: '#141414',
        is_active: false
      }
    ];
    
    console.log('🔄 Agregando nuevas paletas de colores...');
    
    // Verificar si cada paleta ya existe antes de insertarla
    for (const palette of newPalettes) {
      const [existing] = await connection.execute(
        'SELECT COUNT(*) as count FROM color_palettes WHERE name = ?',
        [palette.name]
      );
      
      if (existing[0].count === 0) {
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
        
        console.log(`✅ Paleta "${palette.name}" agregada`);
      } else {
        console.log(`⚠️  Paleta "${palette.name}" ya existe, omitiendo...`);
      }
    }
    
    // Mostrar todas las paletas disponibles
    const [allPalettes] = await connection.execute('SELECT name, primary_color, secondary_color, accent_color FROM color_palettes ORDER BY id');
    
    console.log('\n🎨 Paletas de colores disponibles:');
    allPalettes.forEach(palette => {
      console.log(`- ${palette.name}: ${palette.primary_color} | ${palette.secondary_color} | ${palette.accent_color}`);
    });
    
    console.log('\n🎉 Nuevas paletas agregadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la adición de paletas:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

addNewColorPalettes()
  .then(() => {
    console.log('✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });