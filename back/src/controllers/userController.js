import { User } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library'; 
import { sendEmail, tplWelcomeUser, tplNewUserAdmin, ADMIN_EMAIL } from '../services/email.service.js';
import { SiteSettings } from '../models/index.js'; 

// REGISTRO de usuario - siempre cliente
export const registerUser = async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
     // 1. Validate required fields
        if (!nombre || !email || !password) {
            return res.status(400).json({ message: 'Todos los campos (nombre, email, password) son obligatorios.' });
        }
        
    // Trim whitespace from email
    const trimmedEmail = email.trim();
  
    if (trimmedEmail.length > 254) {
    return res.status(400).json({ 
        message: 'El email no puede exceder los 254 caracteres.' 
    });
}

if (trimmedEmail.length < 5) {
    return res.status(400).json({ 
        message: 'El email debe tener al menos 5 caracteres.' 
    });
}

    // --- SIMPLIFIED EMAIL FORMAT VALIDATION (REQUISITO: Valid email format) ---
    const atIndex = trimmedEmail.indexOf('@');
    const dotIndex = trimmedEmail.lastIndexOf('.');

    // 1. Must contain an '@'
    if (atIndex === -1) {
      return res.status(400).json({ message: 'El email debe contener el símbolo @.' });
    }

    // 2. Must contain a '.' after the '@' and cannot end with '.'
    if (dotIndex < atIndex || dotIndex === -1 || dotIndex === trimmedEmail.length - 1) {
      return res.status(400).json({ message: 'El email debe tener un dominio válido (ej. ".com", ".net").' });
    }

    // 3. Local part (before @) and domain part (between @ and .) cannot be empty
    if (atIndex === 0 || dotIndex - atIndex <= 1) {
       return res.status(400).json({ message: 'El email no tiene un formato válido (partes faltantes).' });
    }
    // --- END OF SIMPLIFIED EMAIL VALIDATION ---

    // Check if email already exists (REQUISITO: Clear error cases)
    const existingUser = await User.findOne({ where: { email: trimmedEmail } });
    if (existingUser) {
      return res.status(400).json({ message: 'Este email ya está registrado.' });
    }


    // --- SIMPLIFIED PASSWORD SECURITY VALIDATION (REQUISITO: Minimum security criteria) ---
    
    // 1. Minimum length (8 characters)
    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    
    // 2. Maximum length (128 characters)
    if (password.length > 128) {
    return res.status(400).json({ 
        message: 'La contraseña no puede exceder los 128 caracteres.' 
    });
}

    // 2. Uppercase (at least one)
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'La contraseña debe incluir al menos una mayúscula.' });
    }

    // 3. Number (at least one)
    if (!/\d/.test(password)) {
      return res.status(400).json({ message: 'La contraseña debe incluir al menos un número.' });
    }

    // 4. Special character (at least one of the required ones)
    const specialCharRegex = /[@$!%*?&]/;
    if (!specialCharRegex.test(password)) {
      return res.status(400).json({ message: 'La contraseña debe incluir al menos un carácter especial (@, $, !, %, *, ?, o &).' });
    }

    // Validate password confirmation (REQUISITO: Password must match)
    if (password !== req.body.confirmPassword) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden.' });
    }

    // Hash password (REQUISITO: Encrypted passwords / Security)
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(password, salt); 


    // Crear usuario con rol por defecto 'cliente' (REQUISITO: Persistencia)
    const newUser = await User.create({
      nombre,
      email,
      password: hashedPassword,
      rol: 'cliente',
      loginMethod: 'local'
    });

    // Enviar correos (no bloqueante para la respuesta)
    try {
      const adminHtml = tplNewUserAdmin(newUser.nombre, newUser.email);
      const userHtml = tplWelcomeUser(newUser.nombre);
      if (ADMIN_EMAIL) {
        sendEmail({ to: ADMIN_EMAIL, subject: 'Nuevo usuario registrado', html: adminHtml }).catch(console.warn);
      }
      sendEmail({ to: newUser.email, subject: '¡Bienvenido a Infinity Store!', html: userHtml }).catch(console.warn);
    } catch (e) {
      console.warn('Fallo al enviar correos de registro:', e?.message || e);
    }

    res.status(201).json({ message: 'Usuario registrado correctamente',
  user: {
                id: newUser.id,
                nombre: newUser.nombre,
                email: newUser.email,
                rol: newUser.rol,
                date_register: newUser.date_register
            }
            });
} catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ message: 'Error en el registro del usuario' });
  }
};

// ALTERNATIVE LOGIN WITH GOOGLE (REQUISITO: Google login support)
export const googleAuthHandler = async (req, res) => { 
    const { idToken } = req.body;

    // 1. Validate required token
    if (!idToken) {
        return res.status(400).json({ message: 'El token de Google es obligatorio.' });
    }

    try {
        let userData;
        
        // 1. CLAVE DE AUDIENCIA: Usamos la variable de backend
        const CLIENT_ID_AUDIENCE = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
        
        // Inicializa el cliente con la clave
        const client = new OAuth2Client(CLIENT_ID_AUDIENCE); 

        // DEBUG: Muestra la clave que Node está leyendo (CRÍTICO)
        console.log("DEBUG BACKEND CLIENT_ID used for Audience:", CLIENT_ID_AUDIENCE); 
        
        // =========================================================================
        // ✅ CÓDIGO DE VERIFICACIÓN REAL
        // -------------------------------------------------------------------------
        
        try {
            if (!CLIENT_ID_AUDIENCE) {
                // Mensaje de error más claro
                throw new Error('GOOGLE_CLIENT_ID no está configurada correctamente en el backend (revisa tu .env).'); 
            }
            
            // Llama a la API de Google para verificar el token
            const ticket = await client.verifyIdToken({
                idToken: idToken,
                audience: CLIENT_ID_AUDIENCE, // Asegura que el token sea para tu app
            });
            // Obtiene los datos del payload verificado
            const payload = ticket.getPayload();
            
            userData = {
                email: payload.email,
                name: payload.name
            };

        } catch (error) {
            console.error('Error verificando token de Google:', error.message);
            
            // Devuelve error 401 si Google reporta un token inválido
            return res.status(401).json({ message: 'Token de Google inválido o caducado.' });
        }
        
        // =========================================================================
        
        const email = userData.email.trim();
        const nombre = userData.name;

        // 2. Busca al usuario en la base de datos
        let user = await User.findOne({ where: { email } });

        if (!user) {
            // 3. Si el usuario no existe, crea la cuenta (primer login)
            const tempHashedPassword = bcrypt.hashSync(email, 10); 
            
            user = await User.create({
                nombre: nombre,
                email: email,
                password: tempHashedPassword, 
                rol: 'cliente', 
                loginMethod: 'google' 
            });
            // Emails de bienvenida y notificación al admin (solo en primera creación)
            try {
              const adminHtml = tplNewUserAdmin(user.nombre, user.email);
              const userHtml = tplWelcomeUser(user.nombre);
              if (ADMIN_EMAIL) {
                sendEmail({ to: ADMIN_EMAIL, subject: 'Nuevo usuario (Google)', html: adminHtml }).catch(console.warn);
              }
              sendEmail({ to: user.email, subject: '¡Bienvenido a Infinity Store!', html: userHtml }).catch(console.warn);
            } catch (e) {
              console.warn('Fallo al enviar correos de google signup:', e?.message || e);
            }
        }
        
        // Check if user account is active (for both existing and new users)
        if (!user.is_active) {
            return res.status(403).json({ 
                message: 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.' 
            });
        }
        
        // 4. Genera el token JWT local con permisos basados en rol
        const permissions = [];
        if (user.rol === 'admin') {
          permissions.push('admin');
        } else if (user.rol === 'super_admin') {
          permissions.push('admin', 'super_admin', 'customization');
        }

        const token = jwt.sign(
            { 
              user: { 
                id: user.id, 
                rol: user.rol,
                permissions: permissions
              } 
            },
            process.env.JWT_SECRET,
            { expiresIn: user.rol === 'super_admin' ? '4h' : '2h' }
        );

        // Log admin/super admin Google logins for security
        if (user.rol === 'admin' || user.rol === 'super_admin') {
          console.log(`${user.rol.toUpperCase()} Google Login: User ${user.id} (${user.email}) logged in at ${new Date().toISOString()}`);
        }

        // 5. Devuelve el éxito
        res.json({
            success: true,
            message: 'Login con Google exitoso',
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol,
                permissions: permissions
            }
        });

    } catch (error) {
        console.error('Error en el login con Google:', error);
        res.status(500).json({ message: 'Error interno del servidor al procesar el login con Google.' });
    }
};

// SUPER ADMIN LOGIN - Enhanced login with super admin specific handling
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email y contraseña son obligatorios para el acceso de super administrador.',
        code: 'SUPER_ADMIN_CREDENTIALS_REQUIRED'
      });
    }

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales de super administrador inválidas.',
        code: 'SUPER_ADMIN_INVALID_CREDENTIALS'
      });
    }

    // Verificar que el usuario tenga rol de super_admin
    if (user.rol !== 'super_admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Acceso denegado: cuenta sin privilegios de super administrador.',
        code: 'SUPER_ADMIN_INSUFFICIENT_PRIVILEGES'
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales de super administrador inválidas.',
        code: 'SUPER_ADMIN_INVALID_CREDENTIALS'
      });
    }

    // Check if super admin account is active
    if (!user.is_active) {
      return res.status(403).json({ 
        success: false,
        message: 'Cuenta de super administrador desactivada. Contacta al soporte técnico.',
        code: 'SUPER_ADMIN_ACCOUNT_INACTIVE'
      });
    }

    // Generar token JWT con información extendida para super admin
    const token = jwt.sign(
      { 
        user: { 
          id: user.id, 
          rol: user.rol,
          permissions: ['admin', 'super_admin', 'customization'] // Explicit permissions
        } 
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' } // Longer session for super admin
    );

    // Log successful super admin login
    console.log(`Super Admin Login: User ${user.id} (${user.email}) logged in at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: 'Login de super administrador exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        permissions: ['admin', 'super_admin', 'customization']
      }
    });
  } catch (error) {
    console.error('Error en login de super administrador:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al procesar login de super administrador',
      code: 'SUPER_ADMIN_LOGIN_ERROR'
    });
  }
};

// LOGIN admin or client
export const loginUser = async (req, res) => {

  try {
    const { email, password } = req.body;

// ... (código loginUser)
    // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
        }
    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email } });

   if (!user) {
            // REQUISITO: Clear and consistent error messages for invalid credentials
            return res.status(401).json({ message: 'Credenciales inválidas (email o contraseña incorrectos).' });
        }
        
    // --- GOOGLE ACCOUNT HANDLING: PREVENT LOCAL LOGIN ---  
    // Si la cuenta fue creada con Google, debe usar el botón de Google.
    if (user.loginMethod === 'google') {
        return res.status(403).json({ 
            message: 'Esta cuenta fue registrada usando Google. Por favor, utiliza el botón "Iniciar sesión con Google".'
        });
    }
    // --------------------------------------------------------

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Credenciales inválidas (email o contraseña incorrectos).' }); // Unified message

    // Check if user account is active
    if (!user.is_active) {
        return res.status(403).json({ 
            message: 'Tu cuenta ha sido desactivada. Contacta al administrador para más información.' 
        });
    }

    // Generar token JWT con permisos basados en rol
    const permissions = [];
    if (user.rol === 'admin') {
      permissions.push('admin');
    } else if (user.rol === 'super_admin') {
      permissions.push('admin', 'super_admin', 'customization');
    }

    const token = jwt.sign(
      { 
        user: { 
          id: user.id, 
          rol: user.rol,
          permissions: permissions
        } 
      },
      process.env.JWT_SECRET,
      { expiresIn: user.rol === 'super_admin' ? '4h' : '2h' } // Longer session for super admin
    );

    // Log admin/super admin logins for security
    if (user.rol === 'admin' || user.rol === 'super_admin') {
      console.log(`${user.rol.toUpperCase()} Login: User ${user.id} (${user.email}) logged in at ${new Date().toISOString()}`);
    }

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        permissions: permissions
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error interno del servidor al iniciar sesión' });
  }
};

// OBTENER USUARIO LOGUEADO
export const getLoggedUser = async (req, res) => {
    try {
        const userId = req.user.id; 

        const user = await User.findByPk(userId, {
            attributes: ['id', 'nombre', 'email', 'rol'],
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};



// GET ALL USERS (Admin only) 
export const getAllUsers = async (req, res) => {
  try {
    // 1. Get pagination parameters from query string (e.g., /admin/users?page=1&limit=10)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // 2. Use findAndCountAll to get users and total count
    const { count, rows } = await User.findAndCountAll({
      attributes: { exclude: ['password'] }, // Exclude password
      order: [['date_register', 'DESC']],
      limit: limit,
      offset: offset,
    });

    // 3. Calculate total pages
    const totalPages = Math.ceil(count / limit);

    // 4. Send response with pagination data
    res.status(200).json({
      users: rows,
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};
// 5. Update a user (Admin only)
export const updateUser = async (req, res) => {
  try {
    const {id}  = req.params; // ID of the user to edit
    const { nombre, email, rol } = req.body; // Data to update

    // Validate that the user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Update fields
    user.nombre = nombre || user.nombre;
    user.email = email || user.email;


        await user.save();

    // Return the updated user (without password)
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.status(200).json({ message: 'Usuario actualizado correctamente', user: userResponse });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar usuario' });
  }
};
// 6. Delete a user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // ID of the user to delete

    // Validate that the user exists
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Delete the user
    await user.destroy();

    res.status(200).json({ message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar usuario' });
  }
};

// UPDATE USER PROFILE
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nombre, email, currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Validate required fields
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos'
      });
    }

    // Validate email format
    const trimmedEmail = email.trim();
    if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'El email debe tener entre 5 y 254 caracteres'
      });
    }

    const atIndex = trimmedEmail.indexOf('@');
    const dotIndex = trimmedEmail.lastIndexOf('.');
    if (atIndex === -1 || dotIndex < atIndex || dotIndex === -1 || dotIndex === trimmedEmail.length - 1) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido'
      });
    }

    // Check if email is already taken by another user
    if (trimmedEmail !== user.email) {
      const existingUser = await User.findOne({ where: { email: trimmedEmail } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está registrado por otro usuario'
        });
      }
    }

    // If changing password, validate current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual requerida para cambiar contraseña'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      // Hash new password
      const saltRounds = 10;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
      user.password = hashedNewPassword;
    }

    // Update user data
    user.nombre = nombre;
    user.email = trimmedEmail;

    // Handle avatar upload if present
    if (req.file) {
      // Here you would handle file upload to your storage service
      // For now, we'll just store the filename
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    // Return updated user data (without password)
    const updatedUser = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      avatar: user.avatar,
      date_register: user.date_register,
      is_active: user.is_active
    };

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar perfil'
    });
  }
};

// GET USER PROFILE
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        avatar: user.avatar,
        date_register: user.date_register,
        is_active: user.is_active
      }
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener perfil'
    });
  }
};