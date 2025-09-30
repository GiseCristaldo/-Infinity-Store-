// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Para acceder a la información del usuario

function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Mover la lógica de redirección a un useEffect
  useEffect(() => {
    // Si no hay usuario autenticado, redirigir al login
    if (!isAuthenticated) {
      navigate('/auth');
    }
    // Una vez que sabemos si el usuario está autenticado, podemos finalizar la carga
    setLoading(false);
  }, [isAuthenticated, navigate]);

  // Si está cargando o no hay usuario (aún no cargó o no existe), mostrar mensaje
  if (loading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Cargando información del perfil...</Typography>
      </Box>
    );
  }
const handleLogout = async () => {
    try {
      // Eliminar tokens y datos de usuario
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Ejecutar función de logout del contexto
      await logout();
      
      // Redirigir al login
      navigate('/auth');
      
      // Opcionalmente recargar para asegurar que todos los estados se resetean
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Si no hay usuario, mostrar un loader o nada mientras se redirige
  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
      <Box sx={{ p: 4, backgroundColor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: 'secondary.main', mb: 3 }}>
          Mi Perfil
        </Typography>
        <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
          Nombre: {user.nombre}
        </Typography>
        <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
          Email: {user.email}
        </Typography>
        <Typography variant="h6" color="text.primary" sx={{ mb: 3 }}>
          Rol: {user.rol}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          (La opción de editar tu perfil estará en el futuro)
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 3, mr: 2, borderRadius: 8 }} // Añadido mr para separar
          onClick={() => navigate('/mis-ordenes')} // <-- ¡Botón para ir a Mis Órdenes!
        >
          Ver Mis Órdenes
        </Button>
        <Button
          variant="contained"
          color="secondary"
          sx={{ mt: 3, mr: 2, borderRadius: 8 }}
          onClick={() => navigate('/')}
        >
          Volver a Inicio
        </Button>
        <Button
          variant="contained"
          color="error"
          sx={{ mt: 3, borderRadius: 8 }}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </Container>
  );
}

export default ProfilePage;