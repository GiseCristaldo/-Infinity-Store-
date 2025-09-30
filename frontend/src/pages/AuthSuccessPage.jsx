// src/pages/AuthSuccessPage.jsx
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

function AuthSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Guardar en localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Actualizar contexto
        setToken(token);
        setUser(user);

        // Redirigir según el rol
        if (user.rol === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error procesando datos de autenticación:', error);
        navigate('/auth?error=invalid_data');
      }
    } else {
      navigate('/auth?error=missing_data');
    }
  }, [searchParams, navigate, setUser, setToken]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completando autenticación...
      </Typography>
    </Box>
  );
}

export default AuthSuccessPage;