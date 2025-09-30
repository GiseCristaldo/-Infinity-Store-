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
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 

// ----------------------------------------------------------------------
// CONFIGURACIÓN DEL TEMA (Tema basado en Rosa/Magenta)
// ----------------------------------------------------------------------
const pinkTheme = createTheme({
  palette: {
    primary: {
      main: '#3F51B5', // Azul primario base (Mantener para consistencia de Material-UI si es necesario)
    },
    secondary: {
      main: "#d4a5a5",// Rosa suave para acentos y botones
      light: '#39002C',
    },
    background: {
      // Usaremos un fondo blanco para el Paper (modal) y un gris claro para el fondo principal
      default: '#f5f5f5', 
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#777777',
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          // Simplificamos la apariencia de los inputs
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f5f5f5',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
            '&:hover fieldset': {
              borderColor: '#d4a5a5',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#e91e63',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        containedSecondary: {
          boxShadow: '0 4px 10px rgba(249, 29, 209, 0.47)', // Sombra para el botón rosa
          '&:hover': {
            boxShadow: '0 6px 15px rgba(233, 30, 203, 0.6)',
          },
        },
      },
    },
  },
});
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
      navigate('/admin/dashboard'); 
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
    // URL ajustada para consistencia con el BASE_URL 
    const response = await axios.post(`${BASE_URL}/api/users/register`, { 
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
    // Se envuelve todo en ThemeProvider para aplicar la nueva paleta de colores
    <ThemeProvider theme={pinkTheme}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 4,
            mb: 4,
            // Aplicar un fondo suave al body
            backgroundColor: pinkTheme.palette.background.default, 
            minHeight: '100vh',
            py: 8
          }}
        >
        <Paper elevation={0} sx={{ 
            p: { xs: 2, sm: 4 }, 
            width: { xs: '90%', sm: 450 }, 
            backgroundColor: pinkTheme.palette.background.paper, // Fondo blanco/claro
            borderRadius: 3, // Bordes más redondeados
            border: '1px solid #e0e0e0'
            }}
        >
            <Tabs value={tabIndex} onChange={handleTabChange} centered 
                sx={{ mb: 3, 
                      // Hacer los tabs completamente redondeados
                      '& .MuiTabs-indicator': { backgroundColor: pinkTheme.palette.secondary.main },
                      '& .MuiTab-root': { 
                        color: pinkTheme.palette.text.secondary,
                        borderRadius: '25px',
                        margin: '0 4px',
                        backgroundColor: tabIndex === 0 ? '#d4a5a5' : '#f5f5f5',
                        color: tabIndex === 0 ? 'white' : '#666',
                        '&:hover': {
                          backgroundColor: tabIndex === 0 ? '#e8c4c4' : '#eeeeee',
                        }
                      },
                      '& .Mui-selected': { 
                        color: 'white !important',
                        backgroundColor: '#e8c4c4'
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
                <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', color: 'text.primary', fontWeight: 'bold' }}>
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
                color="secondary"
                size="large"
                sx={{ mt: 2, borderRadius: 8 }}
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
                <Button onClick={() => setTabIndex(1)} sx={{ textTransform: 'none', color: 'secondary.main', fontWeight: 'bold' }}>
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
                color="secondary"
                size="large"
                sx={{ mt: 2, borderRadius: 8 }}
                disabled={loading}
                >
                REGISTRARSE
                </Button>
                
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                ¿Ya tienes una cuenta?{' '}
                <Button onClick={() => setTabIndex(0)} sx={{ textTransform: 'none', color: 'secondary.main', fontWeight: 'bold' }}>
                    Inicia sesión aquí
                </Button>
                </Typography>
            </Box>
            )}
        </Paper>
        </Box>

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
    </ThemeProvider>
  );
}

export default AuthPage;