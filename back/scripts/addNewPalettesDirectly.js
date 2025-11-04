import { ColorPalette, sequelize } from '../src/models/index.js';

async function addNewPalettes() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    // Sincronizar modelos
    await sequelize.authenticate();
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
    
    const results = {
      created: [],
      skipped: []
    };
    
    // Verificar si cada paleta ya existe antes de insertarla
    for (const palette of newPalettes) {
      const existing = await ColorPalette.findOne({
        where: { name: palette.name }
      });
      
      if (!existing) {
        const newPalette = await ColorPalette.create(palette);
        results.created.push(newPalette.name);
        console.log(`✅ Paleta "${palette.name}" agregada`);
      } else {
        results.skipped.push(palette.name);
        console.log(`⚠️  Paleta "${palette.name}" ya existe, omitiendo...`);
      }
    }
    
    // Mostrar todas las paletas disponibles
    const allPalettes = await ColorPalette.findAll({
      order: [['name', 'ASC']]
    });
    
    console.log('\n🎨 Paletas de colores disponibles:');
    allPalettes.forEach(palette => {
      console.log(`- ${palette.name}: ${palette.primary_color} | ${palette.secondary_color} | ${palette.accent_color}`);
    });
    
    console.log(`\n🎉 Proceso completado:`);
    console.log(`   - Creadas: ${results.created.length}`);
    console.log(`   - Omitidas: ${results.skipped.length}`);
    console.log(`   - Total disponibles: ${allPalettes.length}`);
    
  } catch (error) {
    console.error('❌ Error durante la adición de paletas:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada');
  }
}

addNewPalettes()
  .then(() => {
    console.log('✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });