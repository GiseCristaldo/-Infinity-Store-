import { API_BASE_URL } from '../config/api.js';

class ThemeService {
  constructor() {
    this.listeners = [];
    this.currentSettings = null;
  }

  // Add listener for theme changes
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of theme changes
  notifyListeners(settings) {
    this.currentSettings = settings;
    this.listeners.forEach(callback => callback(settings));
  }

  // Get current theme settings from API
  async getCurrentSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/settings/current`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this.notifyListeners(data.data);
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get current settings');
      }
    } catch (error) {
      console.error('Error getting current theme settings:', error);
      throw error;
    }
  }

  // Apply theme settings to DOM
  applyThemeToDOM(settings) {
    if (!settings) return;

    const root = document.documentElement;
    
    // Apply color palette if available
    if (settings.color_palette) {
      const palette = settings.color_palette;
      root.style.setProperty('--color-primary', palette.primary_color);
      root.style.setProperty('--color-secondary', palette.secondary_color);
      root.style.setProperty('--color-accent', palette.accent_color);
      root.style.setProperty('--color-text', palette.text_color);
      
      // Apply derived colors
      root.style.setProperty('--color-primary-light', this.adjustBrightness(palette.primary_color, 20));
      root.style.setProperty('--color-primary-dark', this.adjustBrightness(palette.primary_color, -20));
      root.style.setProperty('--color-secondary-light', this.adjustBrightness(palette.secondary_color, 20));
      root.style.setProperty('--color-secondary-dark', this.adjustBrightness(palette.secondary_color, -20));
      
      // Apply background gradients
      const accentLight = this.adjustBrightness(palette.accent_color, 30);
      const accentMedium = this.adjustBrightness(palette.accent_color, 15);
      root.style.setProperty('--background-gradient', `linear-gradient(135deg, ${accentLight}, ${accentMedium})`);
    }

    // Apply typography if available
    if (settings.primary_font) {
      root.style.setProperty('--font-primary', this.generateFontFallbacks(settings.primary_font));
    }
    
    if (settings.heading_font) {
      root.style.setProperty('--font-heading', this.generateFontFallbacks(settings.heading_font));
    }

    // Update document title
    if (settings.site_name) {
      document.title = settings.site_name;
    }

    // Notify listeners
    this.notifyListeners(settings);
  }

  // Generate CSS for theme preview (without applying to DOM)
  generatePreviewCSS(settings) {
    if (!settings?.color_palette) return '';

    const palette = settings.color_palette;
    const primaryFont = settings.primary_font || 'Inter';
    const headingFont = settings.heading_font || 'Orbitron';

    return `
      :root {
        --color-primary: ${palette.primary_color};
        --color-secondary: ${palette.secondary_color};
        --color-accent: ${palette.accent_color};
        --color-text: ${palette.text_color};
        --color-primary-light: ${this.adjustBrightness(palette.primary_color, 20)};
        --color-primary-dark: ${this.adjustBrightness(palette.primary_color, -20)};
        --color-secondary-light: ${this.adjustBrightness(palette.secondary_color, 20)};
        --color-secondary-dark: ${this.adjustBrightness(palette.secondary_color, -20)};
        --font-primary: ${this.generateFontFallbacks(primaryFont)};
        --font-heading: ${this.generateFontFallbacks(headingFont)};
        --background-gradient: linear-gradient(135deg, ${this.adjustBrightness(palette.accent_color, 30)}, ${this.adjustBrightness(palette.accent_color, 15)});
      }
    `;
  }

  // Create a temporary style element for preview
  createPreviewStyle(settings) {
    const css = this.generatePreviewCSS(settings);
    const styleElement = document.createElement('style');
    styleElement.id = 'theme-preview-styles';
    styleElement.textContent = css;
    return styleElement;
  }

  // Apply preview theme (temporary)
  applyPreview(settings) {
    // Remove existing preview
    this.removePreview();
    
    // Add new preview styles
    const styleElement = this.createPreviewStyle(settings);
    document.head.appendChild(styleElement);
    
    // Update document title for preview
    if (settings.site_name) {
      document.title = `${settings.site_name} (Preview)`;
    }
  }

  // Remove preview theme
  removePreview() {
    const existingPreview = document.getElementById('theme-preview-styles');
    if (existingPreview) {
      existingPreview.remove();
    }
    
    // Restore original title
    if (this.currentSettings?.site_name) {
      document.title = this.currentSettings.site_name;
    }
  }

  // Load Google Fonts dynamically with optimization
  loadGoogleFonts(fonts) {
    const fontFamilies = fonts.filter(font => this.isGoogleFont(font));
    
    if (fontFamilies.length === 0) return Promise.resolve();

    return new Promise((resolve, reject) => {
      // Create optimized font query with specific weights and display=swap
      const fontQuery = fontFamilies
        .map(font => {
          const fontName = font.replace(/\s+/g, '+');
          // Add specific weights for better performance
          return `${fontName}:wght@300;400;500;600;700`;
        })
        .join('&family=');
    
      const linkId = 'dynamic-google-fonts';
      let linkElement = document.getElementById(linkId);
      
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.id = linkId;
        linkElement.rel = 'stylesheet';
        linkElement.rel = 'preload';
        linkElement.as = 'style';
        linkElement.onload = () => {
          linkElement.rel = 'stylesheet';
          resolve();
        };
        linkElement.onerror = reject;
        document.head.appendChild(linkElement);
      } else {
        // Font already loaded or loading
        resolve();
      }
      
      linkElement.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
    });
  }

  // Check if font is a Google Font
  isGoogleFont(fontName) {
    const googleFonts = [
      'Inter', 'Roboto', 'Open Sans', 'Lato', 'Dancing Script', 'Caveat',
      'Orbitron', 'Playfair Display', 'Montserrat', 'Poppins', 'Great Vibes', 'Pacifico', 'Shrikhand'
    ];
    return googleFonts.includes(fontName);
  }

  // Generate font fallbacks based on font category
  generateFontFallbacks(fontName) {
    const fontCategories = {
      'Inter': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      'Roboto': '"Helvetica Neue", Helvetica, Arial, sans-serif',
      'Open Sans': '"Helvetica Neue", Helvetica, Arial, sans-serif',
      'Lato': '"Helvetica Neue", Helvetica, Arial, sans-serif',
      'Dancing Script': 'cursive, "Apple Chancery", "Brush Script MT", fantasy',
      'Caveat': 'cursive, "Marker Felt", "Comic Sans MS", fantasy',
      'Orbitron': '"Courier New", Courier, monospace, sans-serif',
      'Playfair Display': 'Georgia, "Times New Roman", Times, serif',
      'Montserrat': '"Helvetica Neue", Helvetica, Arial, sans-serif',
      'Poppins': '"Helvetica Neue", Helvetica, Arial, sans-serif',
      'Great Vibes': 'cursive, "Brush Script MT", "Lucida Handwriting", fantasy',
      'Pacifico': 'cursive, "Marker Felt", "Comic Sans MS", fantasy',
      'Shrikhand': 'Georgia, "Times New Roman", Times, serif'
    };

    const fallbacks = fontCategories[fontName] || 'sans-serif';
    return `"${fontName}", ${fallbacks}`;
  }

  // Preload critical fonts for better performance
  preloadFonts(fonts) {
    const criticalFonts = fonts.filter(font => this.isGoogleFont(font));
    
    criticalFonts.forEach(font => {
      const linkElement = document.createElement('link');
      linkElement.rel = 'preload';
      linkElement.as = 'font';
      linkElement.type = 'font/woff2';
      linkElement.crossOrigin = 'anonymous';
      
      // Generate Google Fonts URL for preloading
      const fontName = font.replace(/\s+/g, '+');
      linkElement.href = `https://fonts.gstatic.com/s/${fontName.toLowerCase()}/v1/${fontName.toLowerCase()}-regular.woff2`;
      
      document.head.appendChild(linkElement);
    });
  }

  // Helper function to adjust brightness of hex colors
  adjustBrightness(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }

  // Convert hex to rgba
  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Initialize theme service
  async initialize() {
    try {
      const settings = await this.getCurrentSettings();
      
      // Preload and load Google Fonts if needed
      const fontsToLoad = [];
      if (settings.primary_font && this.isGoogleFont(settings.primary_font)) {
        fontsToLoad.push(settings.primary_font);
      }
      if (settings.heading_font && this.isGoogleFont(settings.heading_font)) {
        fontsToLoad.push(settings.heading_font);
      }
      
      if (fontsToLoad.length > 0) {
        // Preload fonts for better performance
        this.preloadFonts(fontsToLoad);
        
        // Load fonts asynchronously
        await this.loadGoogleFonts(fontsToLoad);
      }
      
      // Apply theme after fonts are loaded
      this.applyThemeToDOM(settings);
      
      return settings;
    } catch (error) {
      console.error('Failed to initialize theme service:', error);
      // Apply theme even if font loading fails
      try {
        const settings = await this.getCurrentSettings();
        this.applyThemeToDOM(settings);
        return settings;
      } catch (fallbackError) {
        console.error('Failed to apply fallback theme:', fallbackError);
        throw error;
      }
    }
  }

  // Update fonts dynamically (for real-time preview)
  async updateFonts(primaryFont, headingFont) {
    try {
      const fontsToLoad = [];
      
      if (primaryFont && this.isGoogleFont(primaryFont)) {
        fontsToLoad.push(primaryFont);
      }
      if (headingFont && this.isGoogleFont(headingFont)) {
        fontsToLoad.push(headingFont);
      }
      
      // Load new fonts if needed
      if (fontsToLoad.length > 0) {
        await this.loadGoogleFonts(fontsToLoad);
      }
      
      // Apply font changes to DOM
      const root = document.documentElement;
      if (primaryFont) {
        root.style.setProperty('--font-primary', this.generateFontFallbacks(primaryFont));
      }
      if (headingFont) {
        root.style.setProperty('--font-heading', this.generateFontFallbacks(headingFont));
      }
      
      return true;
    } catch (error) {
      console.error('Failed to update fonts:', error);
      throw error;
    }
  }
}

// Create singleton instance
const themeService = new ThemeService();

export default themeService;