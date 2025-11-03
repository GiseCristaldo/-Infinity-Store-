import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function addIsActiveColumn() {
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
    
    // Check if column exists
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'is_active'
    `, [process.env.DB_NAME || 'e-commerce']);
    
    if (columns.length > 0) {
      console.log('✅ La columna is_active ya existe en la tabla users');
      return;
    }
    
    console.log('🔄 Agregando columna is_active...');
    
    // Add the is_active column
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE
    `);
    
    console.log('✅ Columna is_active agregada exitosamente');
    
    // Update existing users to be active
    const [result] = await connection.execute(`
      UPDATE users SET is_active = TRUE
    `);
    
    console.log(`✅ ${result.affectedRows} usuarios actualizados como activos`);
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada');
    }
  }
}

addIsActiveColumn()
  .then(() => {
    console.log('✅ Script ejecutado correctamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error ejecutando script:', error);
    process.exit(1);
  });