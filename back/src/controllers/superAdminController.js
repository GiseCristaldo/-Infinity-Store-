import { User } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { sendEmail, tplWelcomeUser, tplNewUserAdmin, ADMIN_EMAIL } from '../services/email.service.js';


// CREATE NEW ADMIN - Super Admin only
export const createAdmin = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validate required fields
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos (nombre, email, password, rol) son obligatorios.',
        code: 'USER_CREATION_MISSING_FIELDS'
      });
    }

    // Validate role
    if (rol !== 'admin' && rol !== 'cliente') {
      return res.status(400).json({
        success: false,
        message: 'Rol inválido. Solo se pueden crear administradores o clientes.',
        code: 'INVALID_ROLE'
      });
    }

    // Trim whitespace from email
    const trimmedEmail = email.trim();

    // Email length validation
    if (trimmedEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'El email no puede exceder los 254 caracteres.',
        code: 'ADMIN_EMAIL_TOO_LONG'
      });
    }

    if (trimmedEmail.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'El email debe tener al menos 5 caracteres.',
        code: 'ADMIN_EMAIL_TOO_SHORT'
      });
    }

    // Email format validation
    const atIndex = trimmedEmail.indexOf('@');
    const dotIndex = trimmedEmail.lastIndexOf('.');

    if (atIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'El email debe contener el símbolo @.',
        code: 'ADMIN_EMAIL_INVALID_FORMAT'
      });
    }

    if (dotIndex < atIndex || dotIndex === -1 || dotIndex === trimmedEmail.length - 1) {
      return res.status(400).json({
        success: false,
        message: 'El email debe tener un dominio válido (ej. ".com", ".net").',
        code: 'ADMIN_EMAIL_INVALID_DOMAIN'
      });
    }

    if (atIndex === 0 || dotIndex - atIndex <= 1) {
      return res.status(400).json({
        success: false,
        message: 'El email no tiene un formato válido (partes faltantes).',
        code: 'ADMIN_EMAIL_INVALID_PARTS'
      });
    }

    // Check if email already exists (email uniqueness requirement)
    const existingUser = await User.findOne({ where: { email: trimmedEmail } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado en el sistema.',
        code: 'ADMIN_EMAIL_ALREADY_EXISTS'
      });
    }

    // Password security validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres.',
        code: 'ADMIN_PASSWORD_TOO_SHORT'
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña no puede exceder los 128 caracteres.',
        code: 'ADMIN_PASSWORD_TOO_LONG'
      });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe incluir al menos una mayúscula.',
        code: 'ADMIN_PASSWORD_NO_UPPERCASE'
      });
    }

    if (!/\d/.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe incluir al menos un número.',
        code: 'ADMIN_PASSWORD_NO_NUMBER'
      });
    }

    const specialCharRegex = /[@$!%*?&]/;
    if (!specialCharRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe incluir al menos un carácter especial (@, $, !, %, *, ?, o &).',
        code: 'ADMIN_PASSWORD_NO_SPECIAL_CHAR'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with specified role (admin or cliente)
    const newUser = await User.create({
      nombre,
      email: trimmedEmail,
      password: hashedPassword,
      rol: rol, // Can be 'admin' or 'cliente'
      loginMethod: 'local'
    });

    // Send notification emails (non-blocking)
    try {
      const adminHtml = tplNewUserAdmin(newUser.nombre, newUser.email);
      const userHtml = tplWelcomeUser(newUser.nombre);
      
      if (ADMIN_EMAIL) {
        const subject = rol === 'admin' ? 'Nuevo administrador creado por Super Admin' : 'Nuevo cliente creado por Super Admin';
        sendEmail({ 
          to: ADMIN_EMAIL, 
          subject: subject, 
          html: adminHtml 
        }).catch(console.warn);
      }
      
      const welcomeSubject = rol === 'admin' ? '¡Bienvenido como Administrador a Infinity Store!' : '¡Bienvenido a Infinity Store!';
      sendEmail({ 
        to: newUser.email, 
        subject: welcomeSubject, 
        html: userHtml 
      }).catch(console.warn);
    } catch (e) {
      console.warn('Fallo al enviar correos de creación de admin:', e?.message || e);
    }

    // Log user creation for security
    console.log(`User Created: Super Admin ${req.user.id} created new ${rol} ${newUser.id} (${newUser.email}) at ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: `${rol === 'admin' ? 'Administrador' : 'Cliente'} creado correctamente`,
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        date_register: newUser.date_register
      }
    });

  } catch (error) {
    console.error('Error en la creación de administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear administrador',
      code: 'ADMIN_CREATION_ERROR'
    });
  }
};

// GET ALL USERS - Super Admin only
export const getAllAdmins = async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Get search parameter
    const search = req.query.search || '';

    // Build where clause for filtering all user types (admin, super_admin, cliente)
    const whereClause = {
      rol: ['admin', 'super_admin', 'cliente'] // Include all roles
    };

    // Add search functionality if search term provided
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Use findAndCountAll to get admins and total count
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] }, // Exclude password
      order: [['date_register', 'DESC']],
      limit: limit,
      offset: offset,
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    // Log user listing access
    console.log(`User List Access: Super Admin ${req.user.id} accessed user list at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      admins: rows, // Mantengo el nombre 'admins' para compatibilidad con el frontend
      totalItems: count,
      totalPages: totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener administradores',
      code: 'ADMIN_LIST_ERROR'
    });
  }
};

// UPDATE ADMIN - Super Admin only
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, isActive } = req.body;

    // Validate that the admin exists
    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado.',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Prevent modification of super_admin accounts (role restriction)
    if (admin.rol === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede modificar cuentas de super administrador.',
        code: 'SUPER_ADMIN_MODIFICATION_DENIED'
      });
    }

    // Validate that the target is an admin
    if (admin.rol !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden modificar cuentas de administrador.',
        code: 'NON_ADMIN_MODIFICATION_DENIED'
      });
    }

    // Store old values for logging
    const oldValues = {
      nombre: admin.nombre,
      email: admin.email,
      isActive: admin.is_active // Usar el campo correcto del modelo
    };

    // Update fields if provided
    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacío.',
          code: 'ADMIN_NAME_EMPTY'
        });
      }
      admin.nombre = nombre.trim();
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim();
      
      // Email validation
      if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
        return res.status(400).json({
          success: false,
          message: 'El email debe tener entre 5 y 254 caracteres.',
          code: 'ADMIN_EMAIL_INVALID_LENGTH'
        });
      }

      // Check if new email already exists (excluding current admin)
      const existingUser = await User.findOne({ 
        where: { 
          email: trimmedEmail,
          id: { [Op.ne]: id } // Exclude current admin from check
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está registrado por otro usuario.',
          code: 'ADMIN_EMAIL_ALREADY_EXISTS'
        });
      }

      admin.email = trimmedEmail;
    }

    // Handle activation/deactivation
    if (isActive !== undefined) {
      admin.is_active = Boolean(isActive); // Usar el campo correcto del modelo
    }

    await admin.save();

    // Log admin update for security
    console.log(`Admin Updated: Super Admin ${req.user.id} updated admin ${admin.id} at ${new Date().toISOString()}`, {
      oldValues,
      newValues: {
        nombre: admin.nombre,
        email: admin.email,
        isActive: admin.is_active // Usar el campo correcto del modelo
      }
    });

    // Return the updated admin (without password)
    const adminResponse = admin.toJSON();
    delete adminResponse.password;

    res.status(200).json({
      success: true,
      message: 'Administrador actualizado correctamente',
      admin: adminResponse
    });

  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar administrador',
      code: 'ADMIN_UPDATE_ERROR'
    });
  }
};

// DEACTIVATE ADMIN - Super Admin only (soft delete via isActive flag)
export const deactivateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the admin exists
    const admin = await User.findByPk(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrador no encontrado.',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Prevent deactivation of super_admin accounts (role restriction)
    if (admin.rol === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'No se puede desactivar cuentas de super administrador.',
        code: 'SUPER_ADMIN_DEACTIVATION_DENIED'
      });
    }

    // Validate that the target is an admin
    if (admin.rol !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden desactivar cuentas de administrador.',
        code: 'NON_ADMIN_DEACTIVATION_DENIED'
      });
    }

    // Check if already deactivated
    if (admin.isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'El administrador ya está desactivado.',
        code: 'ADMIN_ALREADY_DEACTIVATED'
      });
    }

    // Deactivate the admin (soft delete)
    admin.isActive = false;
    await admin.save();

    // Log admin deactivation for security
    console.log(`Admin Deactivated: Super Admin ${req.user.id} deactivated admin ${admin.id} (${admin.email}) at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Administrador desactivado correctamente.',
      admin: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        rol: admin.rol,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error('Error al desactivar administrador:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al desactivar administrador',
      code: 'ADMIN_DEACTIVATION_ERROR'
    });
  }
};