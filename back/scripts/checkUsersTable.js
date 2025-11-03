import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsersTable() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'e-commerce'
    });
    
    console.log('✅ Conexión establecida');
    
    // Check table structure
    const [columns] = await connection.execute('DESCRIBE users');
    
    console.log('📋 Estructura de la tabla users:');
    console.table(columns);
    
    // Check if isActive column exists
    const hasIsActive = columns.some(column => column.Field === 'isActive');
    console.log(`\n🔍 ¿Existe columna isActive? ${hasIsActive ? '✅ Sí' : '❌ No'}`);
    
    if (!hasIsActive) {
      console.log('\n🔄 Agregando columna isActive...');
      await connection.execute(`
        ALTER TABLE users 
        ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT TRUE
      `);
      console.log('✅ Columna isActive agregada');
      
      // Update existing users
      await connection.execute('UPDATE users SET isActive = TRUE');
      console.log('✅ Usuarios existentes actualizados');
    }
    
    // Check users count
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Total de usuarios: ${userCount[0].count}`);
    
    // Check specific user
    const [user] = await connection.execute(
      'SELECT id, nombre, email, rol, isActive FROM users WHERE email = ?', 
      ['giselle.evelyn@email.com']
    );
    
    if (user.length > 0) {
      console.log('\n👤 Usuario encontrado:');
      console.table(user[0]);
    } else {
      console.log('\n❌ Usuario no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkUsersTable();