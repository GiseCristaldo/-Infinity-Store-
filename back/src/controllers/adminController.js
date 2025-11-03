import { User } from '../models/index.js';
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { sendEmail, tplWelcomeUser, tplNewUserAdmin, ADMIN_EMAIL } from '../services/email.service.js';

// CREAR NUEVO CLIENTE - Solo para administradores (restringido al rol cliente)
export const createClient = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos (nombre, email, password) son obligatorios.',
        code: 'USER_CREATION_MISSING_FIELDS'
      });
    }

    // Forzar rol a cliente para administradores regulares
    const rol = 'cliente';

    // Limpiar espacios en blanco del email
    const trimmedEmail = email.trim();

    // Validación de longitud del email
    if (trimmedEmail.length > 254) {
      return res.status(400).json({
        success: false,
        message: 'El email no puede exceder los 254 caracteres.',
        code: 'CLIENT_EMAIL_TOO_LONG'
      });
    }

    if (trimmedEmail.length < 5) {
      return res.status(400).json({
        success: false,
        message: 'El email debe tener al menos 5 caracteres.',
        code: 'CLIENT_EMAIL_TOO_SHORT'
      });
    }

    // Validación de formato del email
    const atIndex = trimmedEmail.indexOf('@');
    const dotIndex = trimmedEmail.lastIndexOf('.');

    if (atIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'El email debe contener el símbolo @.',
        code: 'CLIENT_EMAIL_INVALID_FORMAT'
      });
    }

    if (dotIndex < atIndex || dotIndex === -1 || dotIndex === trimmedEmail.length - 1) {
      return res.status(400).json({
        success: false,
        message: 'El email debe tener un dominio válido (ej. ".com", ".net").',
        code: 'CLIENT_EMAIL_INVALID_DOMAIN'
      });
    }

    if (atIndex === 0 || dotIndex - atIndex <= 1) {
      return res.status(400).json({
        success: false,
        message: 'El email no tiene un formato válido (partes faltantes).',
        code: 'CLIENT_EMAIL_INVALID_PARTS'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ where: { email: trimmedEmail } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email ya está registrado en el sistema.',
        code: 'CLIENT_EMAIL_ALREADY_EXISTS'
      });
    }

    // Validación de seguridad de contraseña (menos estricta para clientes)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres.',
        code: 'CLIENT_PASSWORD_TOO_SHORT'
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña no puede exceder los 128 caracteres.',
        code: 'CLIENT_PASSWORD_TOO_LONG'
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario con rol cliente
    const newUser = await User.create({
      nombre,
      email: trimmedEmail,
      password: hashedPassword,
      rol: rol,
      loginMethod: 'local'
    });

    // Enviar emails de notificación (sin bloquear)
    try {
      const adminHtml = tplNewUserAdmin(newUser.nombre, newUser.email);
      const userHtml = tplWelcomeUser(newUser.nombre);
      
      if (ADMIN_EMAIL) {
        sendEmail({ 
          to: ADMIN_EMAIL, 
          subject: 'Nuevo cliente creado por Administrador', 
          html: adminHtml 
        }).catch(console.warn);
      }
      
      sendEmail({ 
        to: newUser.email, 
        subject: '¡Bienvenido a Infinity Store!', 
        html: userHtml 
      }).catch(console.warn);
    } catch (e) {
      console.warn('Fallo al enviar correos de creación de cliente:', e?.message || e);
    }

    // Registrar creación de usuario para seguridad
    console.log(`Cliente Creado: Admin ${req.user.id} creó nuevo cliente ${newUser.id} (${newUser.email}) en ${new Date().toISOString()}`);

    res.status(201).json({
      success: true,
      message: 'Cliente creado correctamente',
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        rol: newUser.rol,
        date_register: newUser.date_register
      }
    });

  } catch (error) {
    console.error('Error en la creación de cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear cliente',
      code: 'CLIENT_CREATION_ERROR'
    });
  }
};

// OBTENER TODOS LOS CLIENTES - Solo para administradores
export const getAllClients = async (req, res) => {
  try {
    // Obtener parámetros de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    // Obtener parámetro de búsqueda
    const search = req.query.search || '';

    // Construir cláusula where para filtrar solo clientes
    const whereClause = {
      rol: 'cliente'
    };

    // Agregar funcionalidad de búsqueda si se proporciona término
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Usar findAndCountAll para obtener clientes y conteo total
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] }, // Excluir contraseña
      order: [['date_register', 'DESC']],
      limit: limit,
      offset: offset,
    });

    // Calcular total de páginas
    const totalPages = Math.ceil(count / limit);

    // Registrar acceso a lista de usuarios para seguridad
    console.log(`Acceso Lista Clientes: Admin ${req.user.id} accedió a lista de clientes en ${new Date().toISOString()}`);

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
    console.error('Error al obtener clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener clientes',
      code: 'CLIENT_LIST_ERROR'
    });
  }
};

// ACTUALIZAR CLIENTE - Solo para administradores
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, isActive } = req.body;

    // Validate that the client exists
    const client = await User.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado.',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Validate that the target is a client
    if (client.rol !== 'cliente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden modificar cuentas de cliente.',
        code: 'NON_CLIENT_MODIFICATION_DENIED'
      });
    }

    // Store old values for logging
    const oldValues = {
      nombre: client.nombre,
      email: client.email,
      isActive: client.is_active
    };

    // Update fields if provided
    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El nombre no puede estar vacío.',
          code: 'CLIENT_NAME_EMPTY'
        });
      }
      client.nombre = nombre.trim();
    }

    if (email !== undefined) {
      const trimmedEmail = email.trim();
      
      // Email validation
      if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
        return res.status(400).json({
          success: false,
          message: 'El email debe tener entre 5 y 254 caracteres.',
          code: 'CLIENT_EMAIL_INVALID_LENGTH'
        });
      }

      // Check if new email already exists (excluding current client)
      const existingUser = await User.findOne({ 
        where: { 
          email: trimmedEmail,
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Este email ya está registrado por otro usuario.',
          code: 'CLIENT_EMAIL_ALREADY_EXISTS'
        });
      }

      client.email = trimmedEmail;
    }

    // Handle activation/deactivation
    if (isActive !== undefined) {
      client.is_active = Boolean(isActive);
    }

    await client.save();

    // Log client update for security
    console.log(`Client Updated: Admin ${req.user.id} updated client ${client.id} at ${new Date().toISOString()}`, {
      oldValues,
      newValues: {
        nombre: client.nombre,
        email: client.email,
        isActive: client.is_active
      }
    });

    // Return the updated client (without password)
    const clientResponse = client.toJSON();
    delete clientResponse.password;

    res.status(200).json({
      success: true,
      message: 'Cliente actualizado correctamente',
      admin: clientResponse // Mantengo 'admin' para compatibilidad con frontend
    });

  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al actualizar cliente',
      code: 'CLIENT_UPDATE_ERROR'
    });
  }
};

// DEACTIVATE CLIENT - Admin only
export const deactivateClient = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the client exists
    const client = await User.findByPk(id);
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado.',
        code: 'CLIENT_NOT_FOUND'
      });
    }

    // Validate that the target is a client
    if (client.rol !== 'cliente') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden desactivar cuentas de cliente.',
        code: 'NON_CLIENT_DEACTIVATION_DENIED'
      });
    }

    // Check if already deactivated
    if (client.is_active === false) {
      return res.status(400).json({
        success: false,
        message: 'El cliente ya está desactivado.',
        code: 'CLIENT_ALREADY_DEACTIVATED'
      });
    }

    // Deactivate the client (soft delete)
    client.is_active = false;
    await client.save();

    // Log client deactivation for security
    console.log(`Client Deactivated: Admin ${req.user.id} deactivated client ${client.id} (${client.email}) at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      message: 'Cliente desactivado correctamente.',
      admin: { // Mantengo 'admin' para compatibilidad con frontend
        id: client.id,
        nombre: client.nombre,
        email: client.email,
        rol: client.rol,
        isActive: client.is_active
      }
    });

  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al desactivar cliente',
      code: 'CLIENT_DEACTIVATION_ERROR'
    });
  }
};