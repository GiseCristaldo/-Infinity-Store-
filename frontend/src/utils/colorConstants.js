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

// Paleta específica para el panel de administración (inspirada en ejemplo)
export const ADMIN_COLORS = {
  primary: {
    main: '#f28aa0',
    light: '#f9c2cf',
    dark: '#d96a84',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#f5b7b1',
    light: '#fde1dc',
    dark: '#e79a93',
    contrastText: '#ffffff'
  },
  text: {
    primary: '#1f1f1f',
    secondary: '#6f5a5a',
    light: '#1f1f1f'
  },
  background: {
    gradient: 'linear-gradient(135deg, #ffe4ea, #f9d6d9)',
    paper: '#ffffff',
    overlay: 'rgba(242, 138, 160, 0.08)',
    default: '#fdfdfd'
  },
  shadows: {
    light: '0 4px 12px rgba(242, 138, 160, 0.25)',
    medium: '0 6px 20px rgba(242, 138, 160, 0.35)',
    heavy: '0 8px 32px rgba(242, 138, 160, 0.18)'
  }
};