import { API_BASE_URL } from '../config/api.js';

class FontService {
  constructor() {
    this.cache = new Map();
    this.loadingPromises = new Map();
  }

  // Get available font options from API
  async getFontOptions() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/super-admin/customization/fonts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to get font options');
      }
    } catch (error) {
      console.error('Error getting font options:', error);
      throw error;
    }
  }

  // Update site fonts
  async updateFonts(fontData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/super-admin/customization/fonts`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fontData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Failed to update fonts');
      }
    } catch (error) {
      console.error('Error updating fonts:', error);
      throw error;
    }
  }

  // Get font combinations presets
  getFontCombinations() {
    return [
      { 
        id: 'moderno-profesional',
        name: 'Moderno Profesional', 
        primary_font: 'Inter', 
        heading_font: 'Orbitron',
        description: 'Combinación moderna y profesional',
        preview_text: {
          heading: 'Título Moderno',
          body: 'Texto profesional y legible para contenido general.'
        }
      },
      { 
        id: 'elegante-clasico',
        name: 'Elegante Clásico', 
        primary_font: 'Open Sans', 
        heading_font: 'Playfair Display',
        description: 'Elegancia clásica con serif',
        preview_text: {
          heading: 'Título Elegante',
          body: 'Texto clásico y sofisticado con excelente legibilidad.'
        }
      },
      { 
        id: 'casual-amigable',
        name: 'Casual Amigable', 
        primary_font: 'Lato', 
        heading_font: 'Poppins',
        description: 'Estilo casual y amigable',
        preview_text: {
          heading: 'Título Amigable',
          body: 'Texto casual y accesible que invita a la lectura.'
        }
      },
      { 
        id: 'artistico-cursivo',
        name: 'Artístico Cursivo', 
        primary_font: 'Roboto', 
        heading_font: 'Great Vibes',
        description: 'Combinación artística con cursiva elegante ✨',
        preview_text: {
          heading: 'Título Artístico',
          body: 'Texto equilibrado con toques artísticos y elegantes.'
        }
      },
      { 
        id: 'creativo-manuscrito',
        name: 'Creativo Manuscrito', 
        primary_font: 'Inter', 
        heading_font: 'Dancing Script',
        description: 'Estilo creativo con toque manuscrito ✨',
        preview_text: {
          heading: 'Título Creativo',
          body: 'Texto moderno con personalidad creativa y única.'
        }
      },
      { 
        id: 'relajado-surf',
        name: 'Relajado Surf', 
        primary_font: 'Open Sans', 
        heading_font: 'Pacifico',
        description: 'Estilo relajado y surf ✨',
        preview_text: {
          heading: 'Título Relajado',
          body: 'Texto tranquilo y relajante con vibras playeras.'
        }
      }
    ];
  }

  // Get font categories and descriptions
  getFontCategories() {
    return {
      primary_fonts: [
        { 
          name: 'Inter', 
          category: 'sans-serif', 
          description: 'Sans-serif moderna y legible',
          weights: [300, 400, 500, 600, 700],
          googleFont: true
        },
        { 
          name: 'Roboto', 
          category: 'sans-serif', 
          description: 'Sans-serif clásica de Google',
          weights: [300, 400, 500, 600, 700],
          googleFont: true
        },
        { 
          name: 'Open Sans', 
          category: 'sans-serif', 
          description: 'Sans-serif amigable y versátil',
          weights: [300, 400, 500, 600, 700],
          googleFont: true
        },
        { 
          name: 'Lato', 
          category: 'sans-serif', 
          description: 'Sans-serif humanista',
          weights: [300, 400, 500, 600, 700],
          googleFont: true
        },
        { 
          name: 'Dancing Script', 
          category: 'cursive', 
          description: 'Cursiva elegante y fluida ✨',
          weights: [400, 500, 600, 700],
          googleFont: true
        },
        { 
          name: 'Caveat', 
          category: 'cursive', 
          description: 'Cursiva casual y manuscrita ✨',
          weights: [400, 500, 600, 700],
          googleFont: true
        }
      ],
      heading_fonts: [
        { 
          name: 'Orbitron', 
          category: 'sans-serif', 
          description: 'Futurista y tecnológica',
          weights: [400, 500, 600, 700, 900],
          googleFont: true
        },
        { 
          name: 'Playfair Display', 
          category: 'serif', 
          description: 'Serif elegante y sofisticada',
          weights: [400, 500, 600, 700, 900],
          googleFont: true
        },
        { 
          name: 'Montserrat', 
          category: 'sans-serif', 
          description: 'Sans-serif geométrica y moderna',
          weights: [300, 400, 500, 600, 700, 900],
          googleFont: true
        },
        { 
          name: 'Poppins', 
          category: 'sans-serif', 
          description: 'Sans-serif redondeada y amigable',
          weights: [300, 400, 500, 600, 700, 900],
          googleFont: true
        },
        { 
          name: 'Great Vibes', 
          category: 'cursive', 
          description: 'Cursiva script muy elegante ✨',
          weights: [400],
          googleFont: true
        },
        { 
          name: 'Pacifico', 
          category: 'cursive', 
          description: 'Cursiva surf y relajada ✨',
          weights: [400],
          googleFont: true
        },
        // Shrikhand (Google Font) para títulos display
        {
          name: 'Shrikhand',
          category: 'serif',
          description: 'Display llamativa para títulos',
          weights: [400],
          googleFont: true
        }
      ]
    };
  }

  // Generate CSS for font preview
  generateFontPreviewCSS(primaryFont, headingFont) {
    const fontCategories = this.getFontCategories();
    
    const primaryFontData = fontCategories.primary_fonts.find(f => f.name === primaryFont);
    const headingFontData = fontCategories.heading_fonts.find(f => f.name === headingFont);
    
    const primaryFallback = this.generateFontFallbacks(primaryFont, primaryFontData?.category);
    const headingFallback = this.generateFontFallbacks(headingFont, headingFontData?.category);

    return `
      .font-preview-primary {
        font-family: ${primaryFallback};
        font-weight: 400;
        line-height: 1.6;
      }
      .font-preview-heading {
        font-family: ${headingFallback};
        font-weight: 600;
        line-height: 1.2;
      }
    `;
  }

  // Generate font fallbacks based on category
  generateFontFallbacks(fontName, category) {
    const fallbackMap = {
      'sans-serif': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
      'serif': 'Georgia, "Times New Roman", Times, serif',
      'cursive': 'cursive, "Apple Chancery", "Brush Script MT", fantasy',
      'monospace': '"Courier New", Courier, monospace'
    };

    const fallback = fallbackMap[category] || fallbackMap['sans-serif'];
    return `"${fontName}", ${fallback}`;
  }

  // Load Google Font with caching
  async loadGoogleFont(fontName, weights = [400]) {
    const cacheKey = `${fontName}-${weights.join(',')}`;
    
    // Return cached promise if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Return immediately if already loaded
    if (this.cache.has(cacheKey)) {
      return Promise.resolve();
    }

    const loadPromise = new Promise((resolve, reject) => {
      const fontQuery = `${fontName.replace(/\s+/g, '+')}:wght@${weights.join(';')}`;
      const linkElement = document.createElement('link');
      
      linkElement.rel = 'stylesheet';
      linkElement.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
      
      linkElement.onload = () => {
        this.cache.set(cacheKey, true);
        this.loadingPromises.delete(cacheKey);
        resolve();
      };
      
      linkElement.onerror = () => {
        this.loadingPromises.delete(cacheKey);
        reject(new Error(`Failed to load font: ${fontName}`));
      };
      
      document.head.appendChild(linkElement);
    });

    this.loadingPromises.set(cacheKey, loadPromise);
    return loadPromise;
  }

  // Preload multiple fonts
  async preloadFonts(fonts) {
    const loadPromises = fonts.map(font => {
      const fontData = this.getFontCategories().primary_fonts.find(f => f.name === font) ||
                      this.getFontCategories().heading_fonts.find(f => f.name === font);
      
      if (fontData && fontData.googleFont) {
        return this.loadGoogleFont(font, fontData.weights);
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(loadPromises);
    } catch (error) {
      console.warn('Some fonts failed to load:', error);
      // Don't throw error, continue with available fonts
    }
  }
}

// Create singleton instance
const fontService = new FontService();

export default fontService;