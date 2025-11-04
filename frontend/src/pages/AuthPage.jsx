import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Snackbar,
  Divider,
  Container,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import { useTheme } from '../context/ThemeContext.jsx';
import { API_ENDPOINTS } from '../config/api.js';

// ----------------------------------------------------------------------
// DYNAMIC THEME INTEGRATION
// ----------------------------------------------------------------------

// Constantes de configuración de Google Sign-In (GSI)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'; 
const GOOGLE_GSI_SCRIPT = 'https://accounts.google.com/gsi/client';
// Asegúrate de que esta variable de entorno esté definida en tu proyecto (por ejemplo, en .env)
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''; 

console.log("Valor de CLIENT_ID:", CLIENT_ID); 
console.log("Tipo de CLIENT_ID:", typeof CLIENT_ID); 

// Componente combinado de Autenticación (Login y Registro)
function AuthPage() {
  const [tabIndex, setTabIndex] = useState(0); // 0 para Login, 1 para Registro
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  
  // Use dynamic theme
  const { currentSettings } = useTheme();
  const [successMessage, setSuccessMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(true);

  const navigate = useNavigate();
  const { login, googleLogin } = useAuth(); // Obtiene las funciones login y googleLogin del AuthContext
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
 
  // --- GSI: Callback para manejar la respuesta del token de Google ---
  const handleCredentialResponse = useCallback(async (response) => {
    const idToken = response.credential;
    console.log("idToken recibido:", idToken);
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Usar la función googleLogin del contexto para autenticar con Google
      const result = await googleLogin(idToken);

      if (result.success) {
        setSuccessMessage(result.message || 'Inicio de sesión con Google exitoso.');
        setSnackbarOpen(true);
        
        // Lógica de Redirección
        if (result.user && result.user.rol === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.message || 'Error al iniciar sesión con Google.');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Error durante el login con Google:', err);
      setError('Error al iniciar sesión con Google. Por favor, inténtalo de nuevo.');
      setSnackbarOpen(true);
    }
    setLoading(false);
  }, [googleLogin, navigate]); // Dependencias: Aseguramos que se actualice si cambian

  // --- GSI: Cargar script e inicializar Google ---
  useEffect(() => {
    // Es crucial que el CLIENT_ID exista antes de inicializar GSI
    if (!CLIENT_ID) {
        setError('ERROR: La variable de entorno VITE_GOOGLE_CLIENT_ID no está definida o es inválida.');
        setLoadingGoogle(false);
        return;
    }
     if (window.google) {
        setLoadingGoogle(false); // <--- Desactiva si ya se cargó
        return; 
    }
    // Comprobar si ya se ha cargado para evitar duplicados
    const script = document.createElement('script');
    script.src = GOOGLE_GSI_SCRIPT;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleCredentialResponse, // La función que maneja el token JWT
          auto_select: false,
        });
        // **ACCIÓN CLAVE:** Indica que la inicialización fue exitosa
        setLoadingGoogle(false); 

      } else {
        // En caso de que el script cargue pero falle la inicialización (raro)
        setLoadingGoogle(false); 
      }
    };

    document.body.appendChild(script);

    // No se requiere limpieza del botón aquí, el segundo useEffect se encarga.
    // Solo se devuelve una función de limpieza si necesitas limpiar el script.
    return () => {
    };
  }, [CLIENT_ID, handleCredentialResponse]);

  // --- GSI: Renderizar el botón cuando el tab de Login esté activo (CORRECCIÓN APLICADA) ---
  useEffect(() => {
     /// 1. Debe estar en el tab de Login (0)
    // 2. La librería de Google debe estar cargada (window.google existe)
    // 3. El estado loadingGoogle debe ser false (confirmando inicialización)
    if (tabIndex === 0 && !loadingGoogle && window.google && window.google.accounts && window.google.accounts.id) {
        const buttonContainer = document.getElementById('google-sign-in-button');
        
        if (buttonContainer) {
            buttonContainer.innerHTML = '';
            
            window.google.accounts.id.renderButton(
                buttonContainer,
                { 
                    theme: "outline", 
                    size: "large", 
                    text: "signin_with",
                    width: "300", 
                } 
            );
        }
    }
    // Si el tab cambia a Registro (1), borramos el contenido
    else if (tabIndex === 1) {
        const buttonContainer = document.getElementById('google-sign-in-button');
        if (buttonContainer) {
             buttonContainer.innerHTML = '';
        }
    }
  }, [tabIndex, loadingGoogle]); // <--- AÑADE loadingGoogle a las dependencias

  // Función para validar email 
  const validateEmail = (email) => { 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
    return emailRegex.test(email); 
  }; 

  // Función para validar contraseña 
  const validatePassword = (password) => { 
    return password.length >= 8; 
  }; 

  // Handlers para limpiar errores cuando el usuario empieza a escribir 
  const handleEmailChange = (e) => { 
    setEmail(e.target.value); 
    if (emailError) setEmailError(false); 
    if (error) setError(null); 
  }; 

  const handlePasswordChange = (e) => { 
    setPassword(e.target.value); 
    if (passwordError) setPasswordError(false); 
    if (error) setError(null); 
  }; 

  const handleNameChange = (e) => { 
    setName(e.target.value); 
    if (nameError) setNameError(false); 
    if (error) setError(null); 
  }; 

  const handleConfirmPasswordChange = (e) => { 
    setConfirmPassword(e.target.value); 
    if (confirmPasswordError) setConfirmPasswordError(false); 
    if (error) setError(null); 
  }; 

  // Handler para cambiar entre pestañas de Login y Registro
  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
    setError(null); 
    setSuccessMessage(null);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    //Resetear todos los estados de error 
    setEmailError(false); 
    setPasswordError(false); 
    setNameError(false); 
    setConfirmPasswordError(false); 
  };

  // Handler para el cierre del Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  // Lógica para el Login de Usuario
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); 
    setSuccessMessage(null);
    
    // Resetear errores 
    setEmailError(false); 
    setPasswordError(false); 
  
    // Validaciones personalizadas 
    let hasErrors = false; 

   // Validación especial: si ambos campos están vacíos 
  if (!email.trim() && !password.trim()) { 
    setEmailError(true); 
    setPasswordError(true); 
    setError('Por favor, completa todos los campos requeridos'); 
    hasErrors = true; 
  } else { 
    if (!email.trim()) { 
      setEmailError(true); 
      setError('El correo electrónico es obligatorio'); 
      hasErrors = true; 
    } else if (!validateEmail(email)) { 
      setEmailError(true); 
      setError('Por favor, ingresa un correo electrónico válido'); 
      hasErrors = true; 
    } 
  
    if (!password.trim()) { 
      setPasswordError(true); 
      setError('La contraseña es obligatoria'); 
      hasErrors = true; 
    } 
  } 
  
  if (hasErrors) { 
    return; 
  } 
  
  setLoading(true); 
  
  // Usa la función login del contexto de autenticación 
  const result = await login(email, password); 
  
  if (result.success) { 
    setSuccessMessage(result.message); 
    setSnackbarOpen(true); 
    // --- LÓGICA DE REDIRECCIÓN BASADA EN ROL --- 
    if (result.user && result.user.rol === 'admin') { 
      navigate('/admin'); 
    } else { 
      navigate('/'); 
    } 
  } else { 
    setError(result.message); 
    setSnackbarOpen(true); 
  } 
  setLoading(false); 
};

  // Lógica para el Registro de Usuario
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null); 
    
    // Resetear errores 
    setNameError(false); 
    setEmailError(false); 
    setPasswordError(false); 
    setConfirmPasswordError(false); 
  
    // Validaciones personalizadas 
    let hasErrors = false; 
//Validación especial: si todos los campos están vacíos 
  if (!name.trim() && !email.trim() && !password.trim() && !confirmPassword.trim()) { 
    setNameError(true); 
    setEmailError(true); 
    setPasswordError(true); 
    setConfirmPasswordError(true); 
    setError('Por favor, completa todos los campos requeridos'); 
    hasErrors = true; 
  } else { 
    // Validaciones individuales 
    if (!name.trim()) { 
      setNameError(true); 
      setError('El nombre es obligatorio'); 
      hasErrors = true; 
    } 

    if (!email.trim()) { 
      setEmailError(true); 
      setError('El correo electrónico es obligatorio'); 
      hasErrors = true; 
    } else if (!validateEmail(email)) { 
      setEmailError(true); 
      setError('Por favor, ingresa un correo electrónico válido'); 
      hasErrors = true; 
    } 

    if (!password.trim()) { 
      setPasswordError(true); 
      setError('La contraseña es obligatoria'); 
      hasErrors = true; 
    } else if (!validatePassword(password)) { 
      setPasswordError(true); 
      setError('La contraseña debe tener al menos 8 caracteres'); 
      hasErrors = true; 
    } 

    if (!confirmPassword.trim()) { 
      setConfirmPasswordError(true); 
      setError('Confirma tu contraseña'); 
      hasErrors = true; 
    } else if (password !== confirmPassword) { 
      setConfirmPasswordError(true); 
      setError('Las contraseñas no coinciden'); 
      hasErrors = true; 
    } 
  } 

  if (hasErrors) { 
    return; 
  } 

  setLoading(true); 
  try { 
    const response = await axios.post(API_ENDPOINTS.AUTH.REGISTER, { 
      nombre: name, 
      email, 
      password, 
      confirmPassword: confirmPassword, 
    }); 
    setSuccessMessage(response.data.message || 'Registro exitoso. ¡Ahora puedes iniciar sesión!'); 
    setSnackbarOpen(true); 
    setTabIndex(0); 
    setEmail(''); 
    setPassword(''); 
    setConfirmPassword(''); 
    setName(''); 
  } catch (err) { 
    console.error('Error durante el registro:', err.response?.data || err.message); 
    setError(err.response?.data?.message || 'Error al registrar usuario. Inténtalo de nuevo.'); 
    setSnackbarOpen(true); 
  } finally { 
      setLoading(false); 
  } 
};

  return (
    // Use dynamic theme colors
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4,
            mb: 4,
            // Use dynamic background
            background: currentSettings?.color_palette ? 
              `linear-gradient(135deg, ${currentSettings.color_palette.accent_color}40 0%, ${currentSettings.color_palette.secondary_color}20 100%)` :
              'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            py: 8
          }}
        >
        <Paper elevation={0} sx={{ 
            p: { xs: 2, sm: 4 }, 
            width: { xs: '90%', sm: 450 }, 
            backgroundColor: '#ffffff', // Fondo blanco para el formulario
            borderRadius: 3, // Bordes más redondeados
            boxShadow: currentSettings?.color_palette ? 
              `0 8px 32px ${currentSettings.color_palette.primary_color}20` :
              '0 8px 32px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
            }}
        >
            <Tabs value={tabIndex} onChange={handleTabChange} centered 
                sx={{ mb: 3, 
                      // Hacer los tabs completamente redondeados
                      '& .MuiTabs-indicator': { display: 'none' }, // Ocultar el indicador por defecto
                      '& .MuiTab-root': { 
                        borderRadius: '25px',
                        margin: '0 4px',
                        backgroundColor: '#f5f5f5', // Color inactivo por defecto
                        color: currentSettings?.color_palette?.text_color || '#666',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: '#eeeeee',
                        }
                      },
                      '& .Mui-selected': { 
                        color: 'white !important',
                        backgroundColor: `${currentSettings?.color_palette?.primary_color || '#d4a5a5'} !important`,
                        '&:hover': {
                          backgroundColor: `${currentSettings?.color_palette?.accent_color || '#e8c4c4'} !important`,
                        }
                      }
                }}>
                <Tab label="INICIAR SESIÓN" />
                <Tab label="REGISTRARSE" />
            </Tabs>

            {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
            )}
            
            {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <CircularProgress color="secondary" size={24} />
            </Box>
            )}

            {tabIndex === 0 && ( // Formulario de Login
            <Box component="form" onSubmit={handleLogin} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ 
                  textAlign: 'center', 
                  color: currentSettings?.color_palette?.text_color || '#333333', 
                  fontWeight: 'bold' 
                }}>
                Iniciar Sesión
                </Typography>
                
                <TextField
                  label="Correo Electrónico"
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                  error={emailError}
                  helperText={emailError ? 'Por favor, ingresa un correo electrónico válido' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8f9fa',
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: currentSettings?.color_palette?.accent_color || '#d4a5a5',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                    },
                  }}
                />
                
                <TextField
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  error={passwordError}
                  helperText={passwordError ? 'La contraseña es obligatoria' : ''}
                />

                <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2, 
                  borderRadius: 8,
                  backgroundColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: currentSettings?.color_palette?.secondary_color || '#c9a9a9',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                  }
                }}
                disabled={loading}
                >
                INICIAR SESIÓN
                </Button>
                
                {/* --- SECCIÓN DE GOOGLE LOGIN --- */}
                <Divider sx={{ my: 3 }}>
                    <Typography variant="caption" color="text.secondary">o continúa con</Typography>
                </Divider>
                {/* El contenedor del botón debe tener un ancho fijo para centrarse bien */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
                    <Box id="google-sign-in-button" sx={{ width: 300 }}>
                        {/* El botón de Google se renderizará aquí mediante el useEffect */}
                        {loadingGoogle && (
            <CircularProgress size={30} color="secondary" sx={{ p: 0.5 }} />
        )}
                    </Box>
                </Box>
                {/* ---------------------------------- */}
                
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                ¿No tienes una cuenta?{' '}
                <Button onClick={() => setTabIndex(1)} sx={{ 
                  textTransform: 'none', 
                  color: currentSettings?.color_palette?.primary_color || '#d4a5a5', 
                  fontWeight: 'bold',
                  '&:hover': {
                    color: currentSettings?.color_palette?.secondary_color || '#c9a9a9',
                  }
                }}>
                    Regístrate aquí
                </Button>
                </Typography>
            </Box>
            )}

            {tabIndex === 1 && ( // Formulario de Registro
            <Box component="form" onSubmit={handleRegister} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', color: 'text.primary', fontWeight: 'bold' }}>
                Crear Cuenta
                </Typography>
                
                <TextField
                  label="Nombre Completo"
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={name}
                  onChange={handleNameChange}
                  disabled={loading}
                  error={nameError}
                  helperText={nameError ? 'El nombre es obligatorio' : ''}
                />
                
                <TextField
                  label="Correo Electrónico"
                  type="text"
                  variant="outlined"
                  fullWidth
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                  error={emailError}
                  helperText={emailError ? 'Por favor, ingresa un correo electrónico válido' : ''}
                />
                
                <TextField
                  label="Contraseña"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  error={passwordError}
                  helperText={passwordError ? 'La contraseña debe tener al menos 8 caracteres' : ''}
                />
                
                <TextField
                  label="Confirmar Contraseña"
                  type="password"
                  variant="outlined"
                  fullWidth
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  disabled={loading}
                  error={confirmPasswordError}
                  helperText={confirmPasswordError ? 'Las contraseñas no coinciden' : ''}
                />

                <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ 
                  mt: 2, 
                  borderRadius: 8,
                  backgroundColor: currentSettings?.color_palette?.primary_color || '#d4a5a5',
                  color: '#ffffff',
                  '&:hover': {
                    backgroundColor: currentSettings?.color_palette?.secondary_color || '#c9a9a9',
                  },
                  '&:disabled': {
                    backgroundColor: '#cccccc',
                  }
                }}
                disabled={loading}
                >
                REGISTRARSE
                </Button>
                
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                ¿Ya tienes una cuenta?{' '}
                <Button onClick={() => setTabIndex(0)} sx={{ 
                  textTransform: 'none', 
                  color: currentSettings?.color_palette?.primary_color || '#d4a5a5', 
                  fontWeight: 'bold',
                  '&:hover': {
                    color: currentSettings?.color_palette?.secondary_color || '#c9a9a9',
                  }
                }}>
                    Inicia sesión aquí
                </Button>
                </Typography>
            </Box>
            )}
        </Paper>
        
        {/* Snackbar para mostrar mensajes de éxito o error */}
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