import { sequelize } from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function addIsActiveColumn() {
  try {
    console.log('🔄 Iniciando migración: Agregar columna isActive a la tabla users...');
    
    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'isActive'
    `, { type: QueryTypes.SELECT });
    
    if (results && results.length > 0) {
      console.log('✅ La columna isActive ya existe en la tabla users');
      return;
    }
    
    // Add the isActive column
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE
    `);
    
    console.log('✅ Columna isActive agregada exitosamente');
    
    // Update existing users to be active by default
    const [updateResult] = await sequelize.query(`
      UPDATE users SET isActive = TRUE WHERE isActive IS NULL
    `);
    
    console.log('✅ Usuarios existentes actualizados como activos');
    
    // Add index for better performance
    try {
      await sequelize.query(`
        CREATE INDEX idx_users_isActive ON users(isActive)
      `);
      console.log('✅ Índice creado para la columna isActive');
    } catch (indexError) {
      if (indexError.message.includes('Duplicate key name')) {
        console.log('ℹ️  El índice ya existe');
      } else {
        console.warn('⚠️  No se pudo crear el índice:', indexError.message);
      }
    }
    
    console.log('🎉 Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Execute migration if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addIsActiveColumn()
    .then(() => {
      console.log('✅ Migración ejecutada correctamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error ejecutando migración:', error);
      process.exit(1);
    });
}

export { addIsActiveColumn };