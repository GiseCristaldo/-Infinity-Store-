import { sequelize } from '../src/config/database.js';

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Check current users table structure
    const [results] = await sequelize.query(`
      DESCRIBE users
    `);
    
    console.log('📋 Estructura actual de la tabla users:');
    console.table(results);
    
    // Check if isActive column exists
    const hasIsActive = results.some(column => column.Field === 'isActive');
    console.log(`🔍 ¿Existe columna isActive? ${hasIsActive ? '✅ Sí' : '❌ No'}`);
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testConnection();