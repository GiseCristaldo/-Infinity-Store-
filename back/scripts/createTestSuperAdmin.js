import bcrypt from 'bcrypt';
import { User } from '../src/models/index.js';

/**
 * Script para crear un super admin de prueba
 */
async function createTestSuperAdmin() {
    try {
        console.log('Creando super admin de prueba...');
        
        const email = 'test@superadmin.com';
        const password = 'TestAdmin123!';
        
        // Verificar si ya existe
        const existingUser = await User.findOne({ where: { email } });
        
        if (existingUser) {
            console.log('El usuario ya existe, actualizando contraseña...');
            const hashedPassword = await bcrypt.hash(password, 10);
            await existingUser.update({ 
                password: hashedPassword,
                rol: 'super_admin'
            });
            console.log('✅ Usuario actualizado exitosamente');
        } else {
            // Crear nuevo usuario
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await User.create({
                nombre: 'Test Super Admin',
                email: email,
                password: hashedPassword,
                rol: 'super_admin',
                activo: true
            });
            console.log('✅ Super admin creado exitosamente');
        }
        
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
}

// Ejecutar si el script se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    createTestSuperAdmin()
        .then(() => {
            console.log('Proceso completado');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error:', error);
            process.exit(1);
        });
}

export { createTestSuperAdmin };