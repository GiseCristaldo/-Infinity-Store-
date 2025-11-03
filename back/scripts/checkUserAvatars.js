import { sequelize } from '../src/config/database.js';
import { User } from '../src/models/index.js';

async function checkUserAvatars() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    // Obtener todos los usuarios con sus avatares
    const users = await User.findAll({
      attributes: ['id', 'nombre', 'email', 'avatar', 'date_register', 'is_active'],
      order: [['id', 'ASC']]
    });

    console.log('\n📊 Usuarios en la base de datos:');
    console.log('=====================================');
    
    users.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Nombre: ${user.nombre}`);
      console.log(`Email: ${user.email}`);
      console.log(`Avatar: ${user.avatar || 'NULL'}`);
      console.log(`Fecha registro: ${user.date_register}`);
      console.log(`Activo: ${user.is_active}`);
      console.log('-------------------------------------');
    });

    console.log(`\n📈 Total de usuarios: ${users.length}`);
    const usersWithAvatar = users.filter(user => user.avatar);
    console.log(`👤 Usuarios con avatar: ${usersWithAvatar.length}`);

    if (usersWithAvatar.length === 0) {
      console.log('\n⚠️  Ningún usuario tiene avatar configurado.');
      console.log('💡 Para probar la funcionalidad, puedes:');
      console.log('   1. Subir un avatar desde la interfaz');
      console.log('   2. O agregar manualmente una URL de prueba');
    }

  } catch (error) {
    console.error('❌ Error al verificar usuarios:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔌 Conexión cerrada.');
  }
}

// Ejecutar el script
checkUserAvatars()
  .then(() => {
    console.log('🎉 Script completado exitosamente.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error en el script:', error);
    process.exit(1);
  });