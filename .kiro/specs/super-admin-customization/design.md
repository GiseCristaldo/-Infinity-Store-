# Design Document

## Overview

El sistema de super administrador permitirá la personalización completa del branding y apariencia del ecommerce. Se implementará como una extensión del sistema de roles existente, agregando un nuevo rol "super_admin" con capacidades de gestión de administradores y personalización de la plataforma.

## Architecture

### Backend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Super Admin System                       │
├─────────────────────────────────────────────────────────────┤
│  Controllers:                                               │
│  ├── superAdminController.js (gestión de admins)           │
│  ├── customizationController.js (colores, imágenes)        │
│  └── brandingController.js (nombre, footer)                │
├─────────────────────────────────────────────────────────────┤
│  Models:                                                    │
│  ├── User.js (extendido con rol super_admin)               │
│  ├── ColorPalette.js (paletas predefinidas)                │
│  ├── SiteSettings.js (configuraciones globales)            │
│  └── CustomizationHistory.js (historial de cambios)        │
├─────────────────────────────────────────────────────────────┤
│  Middleware:                                                │
│  ├── superAdminAuth.js (verificación de super admin)       │
│  └── imageUpload.js (procesamiento de imágenes)            │
└─────────────────────────────────────────────────────────────┘
```

### Frontend Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Super Admin Dashboard                       │
├─────────────────────────────────────────────────────────────┤
│  Pages:                                                     │
│  ├── SuperAdminDashboard.jsx (panel principal)             │
│  ├── AdminManagement.jsx (gestión de admins)               │
│  ├── ThemeCustomization.jsx (paletas de colores)           │
│  ├── TypographySettings.jsx (selección de tipografías)     │
│  ├── ImageManagement.jsx (hero section, carousel)          │
│  └── BrandingSettings.jsx (nombre, footer)                 │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                │
│  ├── ColorPalettePicker.jsx (selector de paletas)          │
│  ├── FontSelector.jsx (selector de tipografías)            │
│  ├── ImageUploader.jsx (subida de imágenes)                │
│  ├── LivePreview.jsx (vista previa en tiempo real)         │
│  └── ChangeHistory.jsx (historial de modificaciones)       │
├─────────────────────────────────────────────────────────────┤
│  Context:                                                   │
│  ├── ThemeContext.jsx (gestión dinámica de temas)          │
│  └── SuperAdminContext.jsx (estado del super admin)        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. User Model Extension

Extender el modelo User existente para incluir el rol "super_admin":

```javascript
// Modificación en User.js
rol: {
    type: DataTypes.ENUM('cliente', 'admin', 'super_admin'),
    defaultValue: 'cliente',
    allowNull: false
}
```

### 2. New Models

#### ColorPalette Model
```javascript
{
    id: INTEGER (PK),
    name: STRING(50), // "Elegante Rosa", "Azul Corporativo"
    primary_color: STRING(7), // #d4a5a5
    secondary_color: STRING(7), // #c9a9a9
    accent_color: STRING(7), // #e8c4c4
    text_color: STRING(7), // #5d4e4e
    is_active: BOOLEAN,
    created_at: DATE
}
```

#### SiteSettings Model
```javascript
{
    id: INTEGER (PK),
    site_name: STRING(50), // "Infinity Store"
    hero_image_url: STRING(255),
    carousel_images: JSON, // Array de URLs
    footer_content: TEXT,
    active_palette_id: INTEGER (FK),
    primary_font: STRING(50), // "Inter", "Roboto", "Dancing Script"
    heading_font: STRING(50), // "Orbitron", "Playfair Display", "Caveat"
    updated_by: INTEGER (FK -> User),
    updated_at: DATE
}
```

#### CustomizationHistory Model
```javascript
{
    id: INTEGER (PK),
    change_type: ENUM('color_palette', 'typography', 'hero_image', 'carousel', 'branding'),
    old_value: JSON,
    new_value: JSON,
    changed_by: INTEGER (FK -> User),
    changed_at: DATE
}
```

### 3. API Endpoints

#### Super Admin Management
```
POST   /api/super-admin/admins          - Crear nuevo admin
GET    /api/super-admin/admins          - Listar admins
PUT    /api/super-admin/admins/:id      - Actualizar admin
DELETE /api/super-admin/admins/:id      - Desactivar admin
```

#### Customization
```
GET    /api/customization/palettes      - Obtener paletas disponibles
PUT    /api/customization/palette       - Cambiar paleta activa
GET    /api/customization/fonts         - Obtener tipografías disponibles
PUT    /api/customization/fonts         - Cambiar tipografías
POST   /api/customization/hero-image    - Subir imagen hero
POST   /api/customization/carousel      - Gestionar imágenes carousel
PUT    /api/customization/branding      - Actualizar nombre y footer
GET    /api/customization/history       - Obtener historial de cambios
POST   /api/customization/revert/:id    - Revertir cambio
```

#### Public Settings
```
GET    /api/settings/current           - Obtener configuración actual (público)
```

## Data Models

### Color Palette System

Se implementarán 8 paletas predefinidas que combinen armoniosamente:

1. **Elegante Rosa** (actual)
   - Primary: #d4a5a5, Secondary: #c9a9a9, Accent: #e8c4c4, Text: #5d4e4e

2. **Azul Corporativo**
   - Primary: #4a90e2, Secondary: #7bb3f0, Accent: #a8d0f7, Text: #2c3e50

3. **Verde Natura**
   - Primary: #27ae60, Secondary: #58d68d, Accent: #85e6a3, Text: #1e8449

4. **Púrpura Moderno**
   - Primary: #8e44ad, Secondary: #bb8fce, Accent: #d7bde2, Text: #6c3483

5. **Naranja Vibrante**
   - Primary: #e67e22, Secondary: #f39c12, Accent: #f8c471, Text: #d35400

6. **Gris Profesional**
   - Primary: #34495e, Secondary: #5d6d7e, Accent: #85929e, Text: #2c3e50

7. **Rojo Pasión**
   - Primary: #e74c3c, Secondary: #ec7063, Accent: #f1948a, Text: #c0392b

8. **Turquesa Fresco**
   - Primary: #1abc9c, Secondary: #48c9b0, Accent: #76d7c4, Text: #17a085

### Typography System

Se implementarán combinaciones de tipografías predefinidas con opciones cursivas:

#### Primary Font Options (Texto general)
1. **Inter** - Sans-serif moderna y legible
2. **Roboto** - Sans-serif clásica de Google
3. **Open Sans** - Sans-serif amigable y versátil
4. **Lato** - Sans-serif humanista
5. **Dancing Script** - Cursiva elegante y fluida ✨
6. **Caveat** - Cursiva casual y manuscrita ✨

#### Heading Font Options (Títulos y encabezados)
1. **Orbitron** - Futurista y tecnológica (actual)
2. **Playfair Display** - Serif elegante y sofisticada
3. **Montserrat** - Sans-serif geométrica y moderna
4. **Poppins** - Sans-serif redondeada y amigable
5. **Great Vibes** - Cursiva script muy elegante ✨
6. **Pacifico** - Cursiva surf y relajada ✨

#### Font Combinations Presets
1. **Moderno Profesional**: Inter + Orbitron
2. **Elegante Clásico**: Open Sans + Playfair Display
3. **Casual Amigable**: Lato + Poppins
4. **Artístico Cursivo**: Roboto + Great Vibes ✨
5. **Creativo Manuscrito**: Inter + Dancing Script ✨
6. **Relajado Surf**: Open Sans + Pacifico ✨

### Image Management

#### Hero Section
- Formato: JPG, PNG, WebP
- Tamaño recomendado: 1920x600px
- Tamaño máximo: 5MB
- Redimensionamiento automático para responsive

#### Carousel
- Formato: JPG, PNG, WebP
- Tamaño recomendado: 800x400px
- Máximo 10 imágenes
- Tamaño máximo por imagen: 3MB
- Orden configurable mediante drag & drop

## Error Handling

### Validation Rules

1. **Admin Creation**
   - Email único y válido
   - Nombre entre 2-50 caracteres
   - Rol válido (admin, no super_admin)

2. **Color Palette**
   - Códigos hexadecimales válidos
   - Paleta debe tener 4 colores
   - Contraste mínimo para accesibilidad

3. **Image Upload**
   - Formatos permitidos: JPG, PNG, WebP
   - Tamaño máximo validado
   - Dimensiones mínimas verificadas

4. **Branding**
   - Nombre del sitio: 1-50 caracteres
   - Footer: máximo 1000 caracteres
   - HTML básico permitido en footer

5. **Typography**
   - Fuentes deben estar en lista predefinida
   - Combinaciones validadas para legibilidad
   - Fallbacks automáticos para navegadores antiguos

### Error Responses

```javascript
// Estructura estándar de errores
{
    success: false,
    message: "Descripción del error",
    errors: {
        field: "Detalle específico del campo"
    },
    code: "ERROR_CODE"
}
```

## Testing Strategy

### Unit Tests

1. **Model Tests**
   - Validación de campos en ColorPalette
   - Relaciones en SiteSettings
   - Constraints en CustomizationHistory

2. **Controller Tests**
   - Autenticación de super admin
   - Validación de datos de entrada
   - Manejo de errores

3. **Service Tests**
   - Procesamiento de imágenes
   - Aplicación de paletas de colores
   - Generación de historial

### Integration Tests

1. **API Tests**
   - Flujo completo de cambio de paleta
   - Subida y procesamiento de imágenes
   - Gestión de administradores

2. **Frontend Tests**
   - Renderizado de vista previa
   - Interacción con selectores de color
   - Navegación del dashboard

### E2E Tests

1. **Super Admin Workflow**
   - Login como super admin
   - Cambio completo de tema
   - Gestión de administradores
   - Verificación de cambios en frontend público

2. **Permission Tests**
   - Acceso denegado para usuarios regulares
   - Acceso denegado para admins regulares
   - Funcionalidad completa para super admin

## Security Considerations

### Authentication & Authorization

1. **Role-Based Access Control**
   - Middleware específico para super_admin
   - Verificación en cada endpoint sensible
   - Logs de acceso y cambios

2. **Input Validation**
   - Sanitización de HTML en footer
   - Validación de tipos de archivo
   - Límites de tamaño estrictos

3. **File Upload Security**
   - Validación de magic numbers
   - Almacenamiento fuera del webroot
   - Nombres de archivo únicos y seguros

### Data Protection

1. **Change Tracking**
   - Historial completo de modificaciones
   - Identificación del usuario responsable
   - Capacidad de rollback

2. **Backup Strategy**
   - Respaldo automático antes de cambios críticos
   - Versionado de configuraciones
   - Recuperación de imágenes

## Performance Considerations

### Image Optimization

1. **Automatic Resizing**
   - Múltiples tamaños para responsive
   - Compresión optimizada
   - Formato WebP cuando sea posible

2. **CDN Integration**
   - Servir imágenes desde CDN
   - Cache headers apropiados
   - Lazy loading en frontend

### Theme Application

1. **CSS Variables**
   - Uso de custom properties CSS
   - Cambio dinámico sin recarga
   - Fallbacks para navegadores antiguos

2. **Caching Strategy**
   - Cache de configuraciones en memoria
   - Invalidación automática en cambios
   - Optimización de consultas DB

## Implementation Phases

### Phase 1: Core Infrastructure
- Extensión del modelo User
- Nuevos modelos de datos
- Middleware de autenticación
- API endpoints básicos

### Phase 2: Admin Management
- CRUD de administradores
- Panel de gestión
- Validaciones y permisos

### Phase 3: Theme System
- Paletas predefinidas
- Selector de colores
- Aplicación dinámica de temas
- Vista previa en tiempo real

### Phase 4: Image Management
- Subida de imágenes
- Procesamiento y optimización
- Gestión de carousel
- Hero section customizable

### Phase 5: Branding & Polish
- Configuración de nombre y footer
- Historial de cambios
- Sistema de rollback
- Optimizaciones finales