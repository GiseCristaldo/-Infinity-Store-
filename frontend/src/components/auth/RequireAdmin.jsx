import React, { useEffect } from 'react';
import { useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box, Alert } from '@mui/material';

function RequireAdmin({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Efecto para verificar continuamente el estado del usuario
  useEffect(() => {
    // Si el usuario cambia y ya no es admin, redirigir inmediatamente
    if (!loading && isAuthenticated && user?.rol !== 'admin') {
      console.warn('Acceso denegado: Usuario no es administrador');
      navigate('/auth', { replace: true });
    }
  }, [user, isAuthenticated, loading, navigate]);

  // Mientras se verifica el estado de autenticación, mostramos un spinner
  if (loading) {
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

  // Verificación estricta del rol de administrador
  if (user?.rol !== 'admin') {
    console.warn('Intento de acceso no autorizado a área de administración');
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh" p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Acceso denegado. No tienes permisos de administrador.
        </Alert>
        <Navigate to="/" replace />
      </Box>
    );
  }

  // Si es un admin autenticado, mostramos el contenido protegido
  return children;
}

export default RequireAdmin;