# Dynamic Theme System Documentation

## Overview

The dynamic theme system allows super administrators to customize the appearance of the ecommerce platform in real-time. This includes color palettes, typography, and other visual elements.

## Backend Implementation

### API Endpoints

#### Color Palette Management

**GET /api/super-admin/customization/palettes**
- Returns all available color palettes
- Requires super admin authentication
- Response includes active palette information

```json
{
  "success": true,
  "message": "Paletas de colores obtenidas exitosamente",
  "data": {
    "palettes": [
      {
        "id": 1,
        "name": "Elegante Rosa",
        "primary_color": "#d4a5a5",
        "secondary_color": "#c9a9a9",
        "accent_color": "#e8c4c4",
        "text_color": "#5d4e4e",
        "is_currently_active": true
      }
    ],
    "active_palette_id": 1,
    "total_count": 8
  }
}
```

**PUT /api/super-admin/customization/palette**
- Changes the active color palette
- Requires super admin authentication
- Creates history record of the change

Request body:
```json
{
  "palette_id": 2
}
```

Response:
```json
{
  "success": true,
  "message": "Paleta de colores cambiada exitosamente a \"Azul Corporativo\"",
  "data": {
    "palette": {
      "id": 2,
      "name": "Azul Corporativo",
      "primary_color": "#4a90e2",
      "secondary_color": "#7bb3f0",
      "accent_color": "#a8d0f7",
      "text_color": "#2c3e50"
    },
    "previous_palette_id": 1,
    "changed_at": "2024-01-01T12:00:00.000Z",
    "changed_by": 1
  }
}
```

#### Public Settings

**GET /api/settings/current**
- Public endpoint (no authentication required)
- Returns current theme settings for frontend application

```json
{
  "success": true,
  "message": "Configuración de tema actual obtenida exitosamente",
  "data": {
    "site_name": "Infinity Store",
    "hero_image_url": null,
    "carousel_images": [],
    "footer_content": "© 2024 Infinity Store. Todos los derechos reservados.",
    "primary_font": "Inter",
    "heading_font": "Orbitron",
    "color_palette": {
      "id": 1,
      "name": "Elegante Rosa",
      "primary_color": "#d4a5a5",
      "secondary_color": "#c9a9a9",
      "accent_color": "#e8c4c4",
      "text_color": "#5d4e4e"
    }
  }
}
```

### Models

#### ColorPalette
- Stores predefined color combinations
- Validates hex color codes
- Tracks active status

#### SiteSettings
- Central configuration for site appearance
- References active color palette
- Includes typography and branding settings

#### CustomizationHistory
- Tracks all theme changes
- Stores before/after values
- Links changes to users for audit trail

## Frontend Implementation

### ThemeContext

The `DynamicThemeProvider` manages theme state and provides real-time updates:

```jsx
import { DynamicThemeProvider } from './context/ThemeContext.jsx';

function App() {
  return (
    <DynamicThemeProvider>
      <YourAppComponents />
    </DynamicThemeProvider>
  );
}
```

### Theme Service

The `themeService` handles theme application and CSS generation:

```javascript
import themeService from './services/themeService.js';

// Load current settings
const settings = await themeService.getCurrentSettings();

// Apply preview theme
themeService.applyPreview(newSettings);

// Remove preview
themeService.removePreview();

// Apply theme permanently
themeService.applyThemeToDOM(settings);
```

### CSS Custom Properties

The system uses CSS custom properties for dynamic theming:

```css
:root {
  --color-primary: #d4a5a5;
  --color-secondary: #c9a9a9;
  --color-accent: #e8c4c4;
  --color-text: #5d4e4e;
  --font-primary: "Inter", sans-serif;
  --font-heading: "Orbitron", sans-serif;
  --background-gradient: linear-gradient(135deg, #f8f4f4, #f0e8e8);
}
```

### Hooks

#### useThemeSettings
Provides theme management functionality:

```javascript
import { useThemeSettings } from './hooks/useThemeSettings.js';

function ThemeCustomizer() {
  const {
    themeSettings,
    loading,
    applyPreview,
    clearPreview,
    applySettings
  } = useThemeSettings();

  const handlePreview = (newSettings) => {
    applyPreview(newSettings);
  };

  const handleApply = async (newSettings) => {
    const result = await applySettings(newSettings);
    if (result.success) {
      // Settings applied successfully
    }
  };
}
```

## Real-time Updates

The system supports real-time theme updates without page reload:

1. **Preview Mode**: Temporarily apply changes for testing
2. **Live Application**: Apply changes immediately to all users
3. **CSS Variables**: Dynamic updates through custom properties
4. **Font Loading**: Automatic Google Fonts integration

## Security Considerations

- Super admin authentication required for theme changes
- Input validation for color codes and font names
- Change history tracking for audit purposes
- Sanitization of user inputs

## Performance Optimizations

- CSS custom properties for efficient updates
- Caching of theme settings
- Lazy loading of Google Fonts
- Minimal DOM manipulation

## Error Handling

- Graceful fallbacks to default theme
- Comprehensive error messages
- Validation of color codes and settings
- Recovery mechanisms for failed updates