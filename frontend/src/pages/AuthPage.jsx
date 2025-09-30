// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  Alert,
  Snackbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx'; // Importa el hook useAuth

// Componente combinado de Autenticación (Login y Registro)
function AuthPage() {
  const [tabIndex, setTabIndex] = useState(0); // 0 para Login, 1 para Registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Para registro
  const [error, setError] = useState(null); // Para mensajes de error de la API
  const [successMessage, setSuccessMessage] = useState(null); // Para mensajes de éxito
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Nuevo estado de carga para los formularios

  const navigate = useNavigate();
  const { login } = useAuth(); // Obtiene la función login del AuthContext
 

  // Handler para cambiar entre pestañas de Login y Registro
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError(null); // Limpiar errores al cambiar de pestaña
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  // Handler para el cierre del Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Lógica para el Registro de Usuario
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar errores anteriores

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) { // Ejemplo de validación básica de contraseña
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/users/register', {
        nombre: name,
        email,
        password,
      });

      setSuccessMessage(response.data.message || 'Registro exitoso. ¡Ahora puedes iniciar sesión!');
      setSnackbarOpen(true);
      // Opcional: Redirigir al login automáticamente o cambiar de pestaña
      setTabIndex(0); // Cambiar a la pestaña de Login después del registro exitoso
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');

    } catch (err) {
      console.error('Error durante el registro:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error al registrar usuario. Inténtalo de nuevo.');
    }
  };

   // Lógica para el Login de Usuario
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Inicia carga
    setError(null); // Limpiar errores anteriores
    setSuccessMessage(null);

    // Usa la función login del contexto de autenticación
    const result = await login(email, password);

    if (result.success) {
      setSuccessMessage(result.message);
      setSnackbarOpen(true);
    // --- LÓGICA DE REDIRECCIÓN BASADA EN ROL ---
      // Verificamos el rol del usuario que nos devuelve la función login
      if (result.user && result.user.rol === 'admin') {
        // Si es admin, lo llevamos al dashboard de administración
        navigate('/admin/dashboard');
      } else {
        // Si es cliente, lo llevamos a la página de inicio
        navigate('/');
      }
    } else {
      setError(result.message);
      setSnackbarOpen(true);
    }
    setLoading(false); // Finaliza carga
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        mb: 4,
      }}
    >
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, width: { xs: '90%', sm: 450 }, backgroundColor: 'background.paper', borderRadius: 2 }}>
        <Tabs value={tabIndex} onChange={handleTabChange} centered sx={{ mb: 3 }}>
          <Tab label="Iniciar Sesión" />
          <Tab label="Registrarse" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tabIndex === 0 && ( // Formulario de Login
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', color: 'text.primary' }}>
              Iniciar Sesión
            </Typography>
            <TextField
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Contraseña"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 2, borderRadius: 8 }}
            >
              Iniciar Sesión
            </Button>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              ¿No tienes una cuenta?{' '}
              <Button onClick={() => setTabIndex(1)} sx={{ textTransform: 'none', color: 'secondary.light' }}>
                Regístrate aquí
              </Button>
            </Typography>
          </Box>
        )}

        {tabIndex === 1 && ( // Formulario de Registro
          <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', color: 'text.primary' }}>
              Registrarse
            </Typography>
            <TextField
              label="Nombre Completo"
              type="text"
              variant="outlined"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Contraseña"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirmar Contraseña"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ mt: 2, borderRadius: 8 }}
            >
              Registrarse
            </Button>
            <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
              ¿Ya tienes una cuenta?{' '}
              <Button onClick={() => setTabIndex(0)} sx={{ textTransform: 'none', color: 'secondary.light' }}>
                Inicia Sesión
              </Button>
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Snackbar para mensajes de éxito/error temporales */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={successMessage ? 'success' : 'error'} sx={{ width: '100%' }}>
          {successMessage || error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AuthPage;