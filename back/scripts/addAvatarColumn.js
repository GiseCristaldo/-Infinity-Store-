import { sequelize } from '../src/config/database.js';
import { QueryTypes } from 'sequelize';

async function addAvatarColumn() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Verificar si la columna avatar ya existe
    const [results] = await sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'avatar'
    `, { type: QueryTypes.SELECT });

    if (results) {
      console.log('⚠️  La columna avatar ya existe en la tabla users.');
      return;
    }

    // Agregar la columna avatar
    console.log('🔄 Agregando columna avatar a la tabla users...');
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN avatar VARCHAR(500) DEFAULT NULL
    `);

    console.log('✅ Columna avatar agregada exitosamente.');
    console.log('📝 La columna avatar puede almacenar URLs de hasta 500 caracteres.');

  } catch (error) {
    console.error('❌ Error al agregar columna avatar:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
addAvatarColumn()
  .then(() => {
    console.log('🎉 Script completado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });