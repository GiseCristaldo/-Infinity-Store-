import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importamos el hook de tu contexto
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth(); // Usamos el contexto para saber el estado

  // 1. Mientras se verifica el token, mostramos un spinner de carga.
  //    Esto evita un parpadeo o una redirección prematura.
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // 2. Si la carga terminó y el usuario NO está autenticado, lo redirigimos a /auth.
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // 3. Si la carga terminó y el usuario SÍ está autenticado, mostramos el contenido protegido.
  return <Outlet />;
};

export default ProtectedRoute;