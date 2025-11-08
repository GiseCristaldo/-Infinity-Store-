// Centraliza tokens de color y estilos reutilizables tomando los valores del ThemeContext
// Usa variables CSS del tema (definidas en ThemeContext) para evitar hardcodes

export const COLORS = {
  primary: {
    main: 'var(--color-primary)',
    light: 'var(--color-primary-light)',
    dark: 'var(--color-primary-dark)',
    contrastText: '#f5cdc0',
  },
  secondary: {
    main: 'var(--color-secondary)',
    light: 'var(--color-secondary-light)',
    dark: 'var(--color-secondary-dark)',
    contrastText: '#f5cdc0',
  },
  accent: {
    main: 'var(--color-accent)',
    light: 'var(--color-accent-light)',
    dark: 'var(--color-accent-dark)',
    contrastText: '#f5cdc0',
  },
  text: {
    // Usa tokens MUI cuando se trabaje en sx: 'text.primary' y 'text.secondary'
    primary: 'text.primary',
    secondary: 'text.secondary',
  },
  background: {
    default: 'background.default',
    paper: 'background.paper',
    gradient: 'var(--background-gradient)',
  },
  success: '#a5d4a5',
  error: '#ff4d4f',
  warning: '#ffa940',
  info: '#40a9ff',
  // Sombras neutrales para evitar tinte rosado
  shadows: {
    soft: 'rgba(0, 0, 0, 0.06)',
    medium: 'rgba(0, 0, 0, 0.12)',
    strong: 'rgba(0, 0, 0, 0.18)',
  },
};

// Estilos de botón reutilizables (primario, outlined, texto)
export const BUTTON_STYLES = {
  primary: {
    color: COLORS.primary.contrastText,
    backgroundColor: COLORS.primary.main,
    boxShadow: `0 4px 12px ${COLORS.shadows.medium}`,
    '&:hover': {
      backgroundColor: COLORS.primary.light,
      boxShadow: `0 6px 14px ${COLORS.shadows.strong}`,
    },
    '&:active': {
      backgroundColor: COLORS.primary.dark,
    },
  },
  outlined: {
    color: COLORS.primary.main,
    border: `1px solid ${COLORS.primary.main}`,
    backgroundColor: 'transparent',
    '&:hover': {
      color: COLORS.primary.dark,
      borderColor: COLORS.primary.light,
      // Fondo tenue usando mezcla; si no es soportado, mantiene transparente
      backgroundColor: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
    },
  },
  text: {
    color: COLORS.primary.main,
    '&:hover': {
      color: COLORS.primary.dark,
      backgroundColor: 'transparent',
    },
  },
};

// Estilos de tarjeta/base de paneles
export const CARD_STYLES = {
  base: {
    backgroundColor: COLORS.background.paper,
    border: `1px solid ${COLORS.shadows.soft}`,
    boxShadow: `0 4px 12px ${COLORS.shadows.soft}`,
    borderRadius: 8,
  },
  subtle: {
    backgroundColor: 'transparent',
    border: `1px solid ${COLORS.shadows.soft}`,
    boxShadow: `0 2px 8px ${COLORS.shadows.soft}`,
    borderRadius: 8,
  },
};

// Paleta administrativa neutral (mantener)
export const ADMIN_COLORS = {
  neutral: {
    main: '#3c3c3c',
    light: '#6b6b6b',
    dark: '#1f1f1f',
    contrastText: '#ffffff',
  },
  success: '#52c41a',
  warning: '#faad14',
  error: '#f5222d',
};