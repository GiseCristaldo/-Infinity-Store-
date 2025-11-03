import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box, Alert } from '@mui/material';

function RequireSuperAdmin({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // Mientras se verifica el estado de autenticación, mostramos un spinner
  if (loading || (hasToken && (!isAuthenticated || !user))) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si el usuario no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Si hay token pero aún no se ha resuelto el usuario, esperar (evitar redirecciones prematuras)
  if (hasToken && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Verificación estricta del rol de super administrador
  if (user?.rol !== 'super_admin') {
    console.warn('Intento de acceso no autorizado a área de super administración');
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Acceso denegado. No tienes permisos de super administrador.
        </Alert>
        <Navigate to="/" replace />
      </Box>
    );
  }

  // Si es un super admin autenticado, mostramos el contenido protegido
  return children;
}

export default RequireSuperAdmin;