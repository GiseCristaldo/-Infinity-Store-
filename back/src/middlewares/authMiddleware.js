// src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'; 

dotenv.config();

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer TOKEN

  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Ahora req.user tiene {id, rol}
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && (req.user.rol === 'admin' || req.user.rol === 'super_admin')) {
      next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
  }
};

// Middleware de administrador mejorado con soporte de jerarquía de roles
export const requireAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido',
      code: 'AUTH_TOKEN_REQUIRED'
    });
  }

  const userRole = req.user.rol;
  
  if (userRole === 'admin' || userRole === 'super_admin') {
    // Registrar acceso de admin para monitoreo de seguridad
    console.log(`Acceso Admin: Usuario ${req.user.id} (${userRole}) accedió a ${req.method} ${req.originalUrl} en ${new Date().toISOString()}`);
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: se requieren privilegios de administrador o super administrador',
      code: 'ADMIN_ACCESS_DENIED'
    });
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.rol === 'super_admin') {
      next();
  } else {
    return res.status(403).json({ message: 'Acceso denegado: se requiere rol de super administrador' });
  }
};

// Middleware de autenticación de administrador mejorado (para admins regulares y super admins)
export const adminAuth = (req, res, next) => {
  // Primero verificar que el token existe y es válido
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Token de acceso requerido para operaciones de administrador',
      code: 'ADMIN_TOKEN_REQUIRED'
    });
  }

  try {
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Verificar rol de admin o super admin
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: se requieren privilegios de administrador',
        code: 'ADMIN_ACCESS_DENIED'
      });
    }

    // Registrar acceso de admin para monitoreo de seguridad
    console.log(`Acceso Admin: Usuario ${req.user.id} (${req.user.rol}) accedió a ${req.method} ${req.originalUrl} en ${new Date().toISOString()}`);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token de administrador expirado',
        code: 'ADMIN_TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token de administrador inválido',
        code: 'ADMIN_TOKEN_INVALID'
      });
    } else {
      console.error('Error Auth Admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno de autenticación',
        code: 'ADMIN_AUTH_ERROR'
      });
    }
  }
};

export const superAdminAuth = (req, res, next) => {
  // Primero verificar que el token existe y es válido
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Token de acceso requerido para operaciones de super administrador',
      code: 'SUPER_ADMIN_TOKEN_REQUIRED'
    });
  }

  try {
    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Verificar rol de super admin
    if (!req.user || req.user.rol !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: se requieren privilegios de super administrador',
        code: 'SUPER_ADMIN_ACCESS_DENIED'
      });
    }

    // Registrar acceso de super admin para monitoreo de seguridad
    console.log(`Acceso Super Admin: Usuario ${req.user.id} accedió a ${req.method} ${req.originalUrl} en ${new Date().toISOString()}`);
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token de super administrador expirado',
        code: 'SUPER_ADMIN_TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token de super administrador inválido',
        code: 'SUPER_ADMIN_TOKEN_INVALID'
      });
    } else {
      console.error('Error Auth Super Admin:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno de autenticación',
        code: 'SUPER_ADMIN_AUTH_ERROR'
      });
    }
  }
};
