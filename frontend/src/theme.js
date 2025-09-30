import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    // Colores basados en tu imagen de referencia
    primary: {
      main: '#7e57c2', // Un morado oscuro profundo para el fondo principal de la barra/app
      light: '#6A0DAD', // Un morado ligeramente más claro
      dark: '#2A004B',  // Un morado aún más oscuro
      contrastText: '#ffffff', // Asegura que el texto sobre primary sea blanco
    },
    secondary: {
      main: '#a806ffff', // Un rosa/fucsia vibrante para acentos y botones de acción
      light: '#6A0DAD',
      dark: '#BF0064',
      contrastText: '#ffffff', // Asegura que el texto sobre secondary sea blanco
    },
    error: {
      main: '#CF6679', // Un rojo/salmón para errores, siguiendo un esquema oscuro
    },
    warning: {
      main: '#FFC107', // Amarillo/ámbar para advertencias
    },
    info: {
      main: '#03DAC6', // Un turquesa para información
    },
    success: {
      main: '#4CAF50', // Verde para éxito
    },
    background: {
      default: 'linear-gradient(to right, rgba(238, 174, 202, 0.8), rgba(148, 187, 233, 0.8))', // Un fondo muy oscuro casi negro, para el cuerpo de la app
      paper: '#7e57c2',   // Un morado oscuro para tarjetas y superficies elevadas
    },
    text: {
      primary: '#ffffff', // Gris muy claro para texto principal
      secondary: '#ffffff', // Gris claro para texto secundario
    },
  },
   typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // Definimos una familia de fuentes separada para los títulos
    h1: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h1
      fontSize: '3rem',
      fontWeight: 700,
      color: '#7e57c2'
    },
    h2: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h2
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#ffffff'
    },
    h3: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h3
      fontSize: '2rem',
      fontWeight: 500,
      color: '#E0E0E0'
    },
    h4: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h4
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#E0E0E0'
    },
    h5: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h5
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#E0E0E0'
    },
    h6: { 
      fontFamily: '"Orbitron", sans-serif', // <-- Fuente para h6
      fontSize: '1.20rem',
      fontWeight: 600,
      color: '#ffffff'
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#3F0071',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#1A0033',
            color: '#E0E0E0',
            '& fieldset': {
              borderColor: '#6A0DAD',
            },
            '&:hover fieldset': {
              borderColor: '#E53E90',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#E53E90',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#B0B0B0',
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#E53E90',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2A004B',
          color: '#E0E0E0',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(229, 62, 144, 0.1)',
          },
        },
      },
    },
  },
});


export default theme;
