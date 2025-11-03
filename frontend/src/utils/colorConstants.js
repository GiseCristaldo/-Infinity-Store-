/**
 * Constantes de colores para mantener consistencia en toda la aplicación
 */

export const COLORS = {
  // Colores principales
  primary: {
    main: '#d4a5a5',
    light: '#e8c4c4',
    dark: '#b8888a',
    contrastText: '#ffffff'
  },
  
  // Colores secundarios
  secondary: {
    main: '#c9a9a9',
    light: '#e0d0d0',
    dark: '#a08080',
    contrastText: '#d4a5a5'
  },
  
  // Colores de estado
  success: '#a5d4a5',
  error: '#d4a5a5',
  warning: '#e8c4a0',
  info: '#a5c4d4',
  
  // Colores de texto
  text: {
    primary: '#333333',
    secondary: '#8a7575',
    light: '#333333'
  },
  
  // Colores de fondo
  background: {
    gradient: 'linear-gradient(135deg, #f8f4f4, #f0e8e8)',
    paper: '#ffffff',
    overlay: 'rgba(255, 255, 255, 0.9)'
  },
  
  // Sombras
  shadows: {
    light: '0 4px 12px rgba(212, 165, 165, 0.3)',
    medium: '0 6px 20px rgba(212, 165, 165, 0.4)',
    heavy: '0 8px 32px rgba(212, 165, 165, 0.15)'
  }
};

// Estilos de botón reutilizables
export const BUTTON_STYLES = {
  primary: {
    backgroundColor: COLORS.primary.main,
    color: COLORS.primary.contrastText,
    fontWeight: 600,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: COLORS.primary.light,
      transform: 'translateY(-2px)',
      boxShadow: COLORS.shadows.medium,
    },
  },
  
  outlined: {
    borderColor: COLORS.primary.main,
    color: COLORS.primary.main,
    fontWeight: 600,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: COLORS.primary.light,
      backgroundColor: 'rgba(212, 165, 165, 0.1)',
      transform: 'translateY(-1px)',
    },
  }
};

// Estilos de card reutilizables
export const CARD_STYLES = {
  base: {
    background: COLORS.background.gradient,
    borderRadius: 3,
    boxShadow: COLORS.shadows.heavy,
    border: '1px solid rgba(212, 165, 165, 0.2)',
    transition: 'all 0.3s ease',
  },
  
  hover: {
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(212, 165, 165, 0.25)',
    }
  }
};

// Paleta específica para el panel de administración (neutral solicitada)
export const ADMIN_COLORS = {
  primary: {
    main: '#a0b4c8',     // Cadet Blue (Crayola)
    light: '#c8dcf0',    // Columbia Blue
    dark: '#b4b4dc',     // Maximum Blue Purple
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#b4b4dc',
    light: '#c8dcf0',
    dark: '#a0b4c8',
    contrastText: '#141414'
  },
  text: {
    primary: '#141414',  // contraste legible
    secondary: '#a0b4c8',
    light: '#141414'
  },
  background: {
    gradient: 'linear-gradient(135deg, #ffffff, #f0f0f0)',
    paper: '#ffffff',    // White
    overlay: 'rgba(160, 180, 200, 0.12)', // sutil con Cadet Blue
    default: '#f0f0f0'   // Anti-Flash White
  },
  shadows: {
    light: '0 4px 12px rgba(160, 180, 200, 0.20)',
    medium: '0 6px 20px rgba(160, 180, 200, 0.30)',
    heavy: '0 8px 32px rgba(160, 180, 200, 0.18)'
  }
};