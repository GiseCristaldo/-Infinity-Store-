import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext.jsx';
import themeService from '../services/themeService.js';

/**
 * Hook for managing theme settings and real-time updates
 */
export const useThemeSettings = () => {
  const { themeSettings, loading, error, updateThemeSettings, refreshThemeSettings } = useTheme();
  const [previewMode, setPreviewMode] = useState(false);
  const [previewSettings, setPreviewSettings] = useState(null);

  // Apply preview theme
  const applyPreview = (settings) => {
    setPreviewSettings(settings);
    setPreviewMode(true);
    themeService.applyPreview(settings);
  };

  // Clear preview and return to current theme
  const clearPreview = () => {
    setPreviewMode(false);
    setPreviewSettings(null);
    themeService.removePreview();
  };

  // Apply settings permanently (this would typically call an API)
  const applySettings = async (settings) => {
    try {
      // Clear preview first
      if (previewMode) {
        clearPreview();
      }
      
      // Update context with new settings
      updateThemeSettings(settings);
      
      // Apply to DOM
      themeService.applyThemeToDOM(settings);
      
      return { success: true };
    } catch (error) {
      console.error('Error applying theme settings:', error);
      return { success: false, error: error.message };
    }
  };

  // Get current effective settings (preview or actual)
  const getCurrentSettings = () => {
    return previewMode ? previewSettings : themeSettings;
  };

  // Check if settings are different from current
  const hasChanges = (newSettings) => {
    if (!themeSettings) return false;
    
    // Compare color palette
    if (newSettings.color_palette && themeSettings.color_palette) {
      const currentPalette = themeSettings.color_palette;
      const newPalette = newSettings.color_palette;
      
      return (
        currentPalette.primary_color !== newPalette.primary_color ||
        currentPalette.secondary_color !== newPalette.secondary_color ||
        currentPalette.accent_color !== newPalette.accent_color ||
        currentPalette.text_color !== newPalette.text_color
      );
    }
    
    // Compare fonts
    if (newSettings.primary_font !== themeSettings.primary_font ||
        newSettings.heading_font !== themeSettings.heading_font) {
      return true;
    }
    
    // Compare other settings
    if (newSettings.site_name !== themeSettings.site_name ||
        newSettings.footer_content !== themeSettings.footer_content) {
      return true;
    }
    
    return false;
  };

  return {
    // Current state
    themeSettings,
    loading,
    error,
    previewMode,
    previewSettings,
    
    // Actions
    applyPreview,
    clearPreview,
    applySettings,
    refreshThemeSettings,
    
    // Utilities
    getCurrentSettings,
    hasChanges,
  };
};

/**
 * Hook for real-time theme updates (useful for admin interfaces)
 */
export const useThemeUpdates = () => {
  const [isListening, setIsListening] = useState(false);
  
  useEffect(() => {
    if (!isListening) return;
    
    // Add listener for theme changes
    const removeListener = themeService.addListener((settings) => {
      console.log('Theme updated:', settings);
    });
    
    return removeListener;
  }, [isListening]);
  
  const startListening = () => setIsListening(true);
  const stopListening = () => setIsListening(false);
  
  return {
    isListening,
    startListening,
    stopListening,
  };
};

export default useThemeSettings;