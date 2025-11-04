import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import fontService from '../services/fontService.js';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Generate font fallbacks using font service
const generateFontFallbacks = (fontName, category) => {
  return fontService.generateFontFallbacks(fontName, category);
};

// Get font category from font service
const getFontCategory = (fontName) => {
  const fontCategories = fontService.getFontCategories();
  const primaryFont = fontCategories.primary_fonts.find(f => f.name === fontName);
  const headingFont = fontCategories.heading_fonts.find(f => f.name === fontName);
  return primaryFont?.category || headingFont?.category || 'sans-serif';
};

// Default theme configuration
const createDynamicTheme = (settings) => {
  const colorPalette = settings?.color_palette;
  const primaryFont = settings?.primary_font || 'Inter';
  const headingFont = settings?.heading_font || 'Orbitron';

  // Generate proper font fallbacks
  const primaryFontFamily = generateFontFallbacks(primaryFont, getFontCategory(primaryFont));
  const headingFontFamily = generateFontFallbacks(headingFont, getFontCategory(headingFont));

  // Default colors if no palette is provided
  const colors = {
    primary: colorPalette?.primary_color || '#d4a5a5',
    secondary: colorPalette?.secondary_color || '#c9a9a9',
    accent: colorPalette?.accent_color || '#e8c4c4',
    text: colorPalette?.text_color || '#5d4e4e'
  };

  return createTheme({
    palette: {
      primary: {
        main: colors.primary,
        light: colors.accent,
        dark: adjustBrightness(colors.primary, -20),
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.secondary,
        light: adjustBrightness(colors.secondary, 20),
        dark: adjustBrightness(colors.secondary, -20),
        contrastText: colors.text,
      },
      error: {
        main: colors.primary,
      },
      warning: {
        main: '#e8c4a0',
      },
      info: {
        main: '#a5c4d4',
      },
      success: {
        main: '#a5d4a5',
      },
      background: {
        // Usar color sólido para evitar errores de parsing en componentes MUI
        default: adjustBrightness(colors.accent, 15),
        paper: '#ffffff',
      },
      text: {
        primary: colors.text,
        secondary: adjustBrightness(colors.text, 30),
      },
    },
    typography: {
      fontFamily: primaryFontFamily,
      h1: { 
        fontFamily: headingFontFamily,
        fontSize: '3rem',
        fontWeight: 700,
        color: colors.primary,
        lineHeight: 1.2
      },
      h2: { 
        fontFamily: headingFontFamily,
        fontSize: '2.5rem',
        fontWeight: 600,
        color: colors.text,
        lineHeight: 1.25
      },
      h3: { 
        fontFamily: headingFontFamily,
        fontSize: '2rem',
        fontWeight: 500,
        color: colors.text,
        lineHeight: 1.3
      },
      h4: { 
        fontFamily: headingFontFamily,
        fontSize: '1.75rem',
        fontWeight: 500,
        color: colors.text,
        lineHeight: 1.35
      },
      h5: { 
        fontFamily: headingFontFamily,
        fontSize: '1.5rem',
        fontWeight: 500,
        color: colors.text,
        lineHeight: 1.4
      },
      h6: { 
        fontFamily: headingFontFamily,
        fontSize: '1.25rem',
        fontWeight: 600,
        color: colors.text,
        lineHeight: 1.45
      },
      body1: {
        fontFamily: primaryFontFamily,
        fontSize: '1rem',
        lineHeight: 1.6
      },
      body2: {
        fontFamily: primaryFontFamily,
        fontSize: '0.875rem',
        lineHeight: 1.5
      },
      button: {
        fontFamily: primaryFontFamily,
        fontWeight: 600,
        textTransform: 'none'
      }
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          colorPrimary: {
            backgroundColor: colors.primary,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 4px 12px ${hexToRgba(colors.primary, 0.3)}`,
            },
          },
          contained: {
            backgroundColor: colors.primary,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: colors.accent,
            },
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
      // Aplicar el gradiente global al body sin romper el palette
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: `linear-gradient(135deg, ${adjustBrightness(colors.accent, 30)}, ${adjustBrightness(colors.accent, 15)})`,
            backgroundAttachment: 'fixed',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            background: `linear-gradient(135deg, ${adjustBrightness(colors.accent, 30)}, ${adjustBrightness(colors.accent, 15)})`,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0 8px 25px ${hexToRgba(colors.primary, 0.2)}`,
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              // Usar color del theme a través del callback si fuera necesario
              '& fieldset': { borderColor: colors.accent },
              '&:hover fieldset': { borderColor: colors.primary },
              '&.Mui-focused fieldset': { borderColor: colors.primary },
            },
            '& .MuiInputBase-input': {
              color: colors.text,
            },
            '& .MuiInputLabel-root': {
              color: adjustBrightness(colors.text, 30),
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: colors.primary,
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            // mantener colores sólidos para evitar problemas de parsing
            backgroundColor: '#ffffff',
            color: colors.text,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: hexToRgba(colors.primary, 0.1),
            },
          },
        },
      },
    },
  });
};

// Helper function to adjust brightness of hex colors
const adjustBrightness = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const DynamicThemeProvider = ({ children }) => {
  const [themeSettings, setThemeSettings] = useState(null);
  const [previewSettings, setPreviewSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Load fonts for the current theme
  const loadThemeFonts = async (settings) => {
    try {
      const fontsToLoad = [];
      
      if (settings.primary_font) {
        fontsToLoad.push(settings.primary_font);
      }
      if (settings.heading_font) {
        fontsToLoad.push(settings.heading_font);
      }
      
      if (fontsToLoad.length > 0) {
        await fontService.preloadFonts(fontsToLoad);
      }
    } catch (error) {
      console.warn('Failed to load some fonts:', error);
      // Don't throw error, continue with fallback fonts
    }
  };

  // Load theme settings from API with enhanced caching and error handling
  const loadThemeSettings = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Check for cached settings first (unless force refresh)
      if (!forceRefresh) {
        const cachedSettings = localStorage.getItem('themeSettings');
        const cacheTimestamp = localStorage.getItem('themeSettingsTimestamp');
        const cacheAge = Date.now() - (parseInt(cacheTimestamp) || 0);
        
        // Use cache if it's less than 5 minutes old
        if (cachedSettings && cacheAge < 5 * 60 * 1000) {
          try {
            const parsedSettings = JSON.parse(cachedSettings);
            await loadThemeFonts(parsedSettings);
            setThemeSettings(parsedSettings);
            setError(null);
            setLoading(false);
            console.log('Loaded theme settings from cache');
            return parsedSettings;
          } catch (parseError) {
            console.warn('Failed to parse cached settings:', parseError);
          }
        }
      }
      
      // Fetch from API (use relative path with Vite proxy; fallback to env base URL)
      const baseUrl = import.meta.env.VITE_API_URL || '';
      const url = baseUrl ? `${baseUrl}/api/settings/current` : `/api/settings/current`;
      const response = await fetch(url, {
        headers: {
          'Cache-Control': forceRefresh ? 'no-cache' : 'max-age=300'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load theme settings`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Load fonts before setting theme
        await loadThemeFonts(data.data);
        setThemeSettings(data.data);
        
        // Store in localStorage with timestamp
        localStorage.setItem('themeSettings', JSON.stringify(data.data));
        localStorage.setItem('themeSettingsTimestamp', Date.now().toString());
        setError(null);
        
        console.log('Loaded theme settings from API', data.cached ? '(cached)' : '(fresh)');
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to load theme settings');
      }
    } catch (err) {
      console.error('Error loading theme settings:', err);
      setError(err.message);
      
      // Try to load from localStorage as fallback
      const cachedSettings = localStorage.getItem('themeSettings');
      if (cachedSettings) {
        try {
          const parsedSettings = JSON.parse(cachedSettings);
          await loadThemeFonts(parsedSettings);
          setThemeSettings(parsedSettings);
          console.log('Loaded theme settings from cache (fallback)');
          return parsedSettings;
        } catch (parseError) {
          console.warn('Failed to parse cached settings:', parseError);
        }
      }
      
      // Use default settings as final fallback
      const defaultSettings = {
        site_name: 'Infinity Store',
        primary_font: 'Inter',
        heading_font: 'Orbitron',
        color_palette: {
          primary_color: '#d4a5a5',
          secondary_color: '#c9a9a9',
          accent_color: '#e8c4c4',
          text_color: '#5d4e4e'
        },
        hero_image_url: null,
        carousel_images: [],
        footer_content: '© 2024 Infinity Store. Todos los derechos reservados.'
      };
      
      // Load default fonts
      await loadThemeFonts(defaultSettings);
      setThemeSettings(defaultSettings);
      console.log('Using default theme settings');
      return defaultSettings;
    } finally {
      setLoading(false);
    }
  };

  // Update theme settings (for real-time updates)
  const updateThemeSettings = async (newSettings, temporary = false) => {
    // If fonts are being updated, load them first
    if (newSettings.primary_font || newSettings.heading_font) {
      await loadThemeFonts(newSettings);
    }
    
    if (temporary) {
      // Update preview settings for temporary changes
      setPreviewSettings(prev => ({
        ...(prev || themeSettings),
        ...newSettings
      }));
      setIsPreviewMode(true);
    } else {
      // Update actual theme settings
      setThemeSettings(prev => ({
        ...prev,
        ...newSettings
      }));
      
      // Update localStorage
      const updatedSettings = { ...themeSettings, ...newSettings };
      localStorage.setItem('themeSettings', JSON.stringify(updatedSettings));
      
      // Clear preview mode if active
      if (isPreviewMode) {
        setPreviewSettings(null);
        setIsPreviewMode(false);
      }
    }
  };

  // Update fonts specifically (for font preview)
  const updateFonts = async (primaryFont, headingFont, temporary = false) => {
    const fontSettings = {};
    if (primaryFont) fontSettings.primary_font = primaryFont;
    if (headingFont) fontSettings.heading_font = headingFont;
    
    await updateThemeSettings(fontSettings, temporary);
  };

  // Update color palette (for color preview)
  const updateColorPalette = async (colorPalette, temporary = false) => {
    await updateThemeSettings({ color_palette: colorPalette }, temporary);
  };

  // Update branding settings (for branding preview)
  const updateBranding = async (branding, temporary = false) => {
    await updateThemeSettings(branding, temporary);
  };

  // Enter preview mode with specific settings
  const enterPreviewMode = async (settings) => {
    await updateThemeSettings(settings, true);
  };

  // Exit preview mode and revert to original settings
  const exitPreviewMode = () => {
    setPreviewSettings(null);
    setIsPreviewMode(false);
  };

  // Apply preview changes permanently
  const applyPreviewChanges = async () => {
    if (previewSettings) {
      await updateThemeSettings(previewSettings, false);
    }
  };

  // Refresh theme settings from API (force refresh)
  const refreshThemeSettings = async (forceRefresh = true) => {
    return await loadThemeSettings(forceRefresh);
  };

  // Auto-refresh settings periodically (every 5 minutes)
  useEffect(() => {
    const autoRefreshInterval = setInterval(() => {
      // Only auto-refresh if not in preview mode
      if (!isPreviewMode) {
        loadThemeSettings(false); // Use cache if available
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, [isPreviewMode]);

  // Listen for storage events to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'themeSettings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          if (JSON.stringify(newSettings) !== JSON.stringify(themeSettings)) {
            console.log('Theme settings updated in another tab, syncing...');
            loadThemeFonts(newSettings).then(() => {
              setThemeSettings(newSettings);
            });
          }
        } catch (error) {
          console.warn('Failed to sync theme settings from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [themeSettings]);

  // Listen for custom theme update events (for real-time updates)
  useEffect(() => {
    const handleThemeUpdate = (event) => {
      console.log('Received theme update event:', event.detail);
      refreshThemeSettings(true);
    };

    window.addEventListener('themeUpdated', handleThemeUpdate);
    return () => window.removeEventListener('themeUpdated', handleThemeUpdate);
  }, []);

  // Initial load
  useEffect(() => {
    loadThemeSettings(false);
  }, []);

  // Get current effective settings (preview or actual)
  const currentSettings = isPreviewMode ? previewSettings : themeSettings;

  // Create theme based on current effective settings (preview or actual)
  const theme = createDynamicTheme(currentSettings);

  // Apply CSS custom properties for dynamic theming
  useEffect(() => {
    if (currentSettings) {
      const root = document.documentElement;
      
      // Apply color palette if available
      if (currentSettings.color_palette) {
        const palette = currentSettings.color_palette;
        root.style.setProperty('--color-primary', palette.primary_color);
        root.style.setProperty('--color-secondary', palette.secondary_color);
        root.style.setProperty('--color-accent', palette.accent_color);
        root.style.setProperty('--color-text', palette.text_color);
        
        // Apply derived colors
        root.style.setProperty('--color-primary-light', adjustBrightness(palette.primary_color, 20));
        root.style.setProperty('--color-primary-dark', adjustBrightness(palette.primary_color, -20));
        root.style.setProperty('--color-secondary-light', adjustBrightness(palette.secondary_color, 20));
        root.style.setProperty('--color-secondary-dark', adjustBrightness(palette.secondary_color, -20));
        
        // Apply background gradient
        const accentLight = adjustBrightness(palette.accent_color, 30);
        const accentMedium = adjustBrightness(palette.accent_color, 15);
        root.style.setProperty('--background-gradient', `linear-gradient(135deg, ${accentLight}, ${accentMedium})`);
      }
      
      // Apply typography with proper fallbacks
      if (currentSettings.primary_font) {
        const primaryFontFamily = generateFontFallbacks(
          currentSettings.primary_font, 
          getFontCategory(currentSettings.primary_font)
        );
        root.style.setProperty('--font-primary', primaryFontFamily);
      }
      
      if (currentSettings.heading_font) {
        const headingFontFamily = generateFontFallbacks(
          currentSettings.heading_font, 
          getFontCategory(currentSettings.heading_font)
        );
        root.style.setProperty('--font-heading', headingFontFamily);
      }
      
      // Update document title if site name is available
      if (currentSettings.site_name) {
        const titleSuffix = isPreviewMode ? ' (Preview)' : '';
        document.title = currentSettings.site_name + titleSuffix;
      }
    }
  }, [currentSettings, isPreviewMode]);

  // Trigger theme update event (for real-time updates across components)
  const triggerThemeUpdate = (updatedSettings = null) => {
    const event = new CustomEvent('themeUpdated', {
      detail: updatedSettings || currentSettings
    });
    window.dispatchEvent(event);
  };

  const contextValue = {
    themeSettings,
    previewSettings,
    currentSettings,
    loading,
    error,
    isPreviewMode,
    updateThemeSettings,
    updateFonts,
    updateColorPalette,
    updateBranding,
    enterPreviewMode,
    exitPreviewMode,
    applyPreviewChanges,
    refreshThemeSettings,
    loadThemeSettings,
    loadThemeFonts,
    triggerThemeUpdate
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};