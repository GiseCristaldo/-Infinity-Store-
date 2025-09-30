import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

function RequireAdmin({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mientras se verifica el estado de autenticación, mostramos un spinner
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Si el usuario no está autenticado o no es admin, lo redirigimos a la página de login
  if (!isAuthenticated || user?.rol !== 'admin') {
    // Guardamos la ubicación a la que intentaba acceder para redirigirlo de vuelta si el login es exitoso
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Si es un admin autenticado, mostramos el contenido protegido
  return children;
}

export default RequireAdmin;