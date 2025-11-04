# Infinity Store — Implementación técnica del Panel de Super Admin

Este documento describe, con foco técnico, la implementación realizada para el Panel de Super Admin: modelos, rutas, controladores, middleware, subida de imágenes, frontend y flujos clave. No es un documento de marketing; su objetivo es explicar cómo está programado y cómo funciona.

## 1. Objetivo y alcance

- Habilitar un panel exclusivo para usuarios con rol `super_admin`.
- Permitir personalización de tema (paletas y tipografías), branding (nombre y footer), gestión de imágenes clave (hero y carrusel) y auditoría con historial y revert.
- Integrar protección por rol y registro de cambios para trazabilidad.

## 2. Arquitectura general

- Backend: Express + Sequelize (MySQL), JWT, Multer.
- Frontend: React + Vite, Material‑UI (MUI), Axios, ThemeContext para aplicar cambios en tiempo real.
- Persistencia de configuración visual en `SiteSettings` y auditoría en `CustomizationHistory`.

## 3. Modelos y base de datos

- `ColorPalette` (`back/src/models/ColorPalette.js`):
  - Campos: `name`, `primary_color`, `secondary_color`, `accent_color`, `text_color`, `is_active`, `created_at`.
  - Validación de colores en hex: `^#[0-9A-Fa-f]{6}$`.
  - Tabla: `color_palettes`.

- `SiteSettings` (`back/src/models/SiteSettings.js`):
  - Configuración activa: `site_name`, `hero_image_url`, `carousel_images` (JSON `{image,title,subtitle}`), `footer_content`.
  - Personalización: `active_palette_id` (FK a paleta), `primary_font`, `heading_font`, `updated_by`, `updated_at`.
  - Método `getOrCreateDefault` para estado inicial consistente.
  - Validaciones: `isUrl`, `len`, `isIn` para fuentes.

- `CustomizationHistory` (`back/src/models/CustomizationHistory.js`):
  - Campos: `change_type` (enum), `old_value`, `new_value`, `changed_by`, `changed_at`.
  - Métodos: `logChange(changeType, old, new, userId)` y `getHistory(options)` con paginación e include de usuario.

- Relaciones (`back/src/models/index.js`):
  - `SiteSettings.belongsTo(ColorPalette)` vía `active_palette_id`.
  - `SiteSettings.belongsTo(User)` vía `updated_by`.
  - `CustomizationHistory.belongsTo(User)` vía `changed_by`.

## 4. Autorización (middleware)

- `superAdminAuth` (`back/src/middlewares/authMiddleware.js`):
  - Verifica token JWT y maneja casos de faltante, inválido o expirado.
  - Exige `role = 'super_admin'` para acceso.
  - Responde con mensajes claros de error y registra el acceso.

## 5. Rutas y endpoints

- Rutas principales montadas en `'/api/super-admin'` (`back/src/app.js`, `back/src/routes/superAdminRoutes.js`).
- Categorías:
  - Roles: `POST /change-role` (promoción `client → admin`).
  - Personalización: paletas, fonts y branding.
  - Imágenes: hero y carrusel.
  - Historial: `GET /customization/history` y revert `POST /customization/revert/:id`.
- Otros endpoints relevantes:
  - `GET /api/settings/current` (carga de configuración para frontend).
  - Rutas de imágenes/carrusel en `imageRoutes.js` y `simpleCarouselRoutes.js`.

## 6. Controladores y lógica

- `customizationController.js`:
  - `getFontOptions`: combos predefinidos de fuentes.
  - `updateSiteFonts`: valida fuentes permitidas, actualiza `SiteSettings` y registra en `CustomizationHistory` (`typography`).
  - `updateBrandingSettings`: valida y actualiza `site_name` y `footer_content`; registra (`branding`).
  - Gestión de paletas y carrusel según rutas definidas.

- `imageController.js`:
  - `uploadHeroImage`: recibe archivo (Multer), valida dimensiones, reemplaza anterior, actualiza `hero_image_url` y registra (`hero_image`).
  - Carrusel: subida, edición de textos y eliminación, actualizando `SiteSettings.carousel_images` y registrando eventos (`carousel_*`).

- `superAdminController.js`:
  - `changeUserRole`: promueve `client → admin` con validaciones para proteger `super_admin` y casos inválidos.

## 7. Subida de imágenes (Multer)

- `imageUpload.js`:
  - `customizationStorage`: almacenamiento de archivos con nombres únicos bajo `back/uploads/customization`.
  - `imageFileFilter`: tipos permitidos (JPG, PNG, WebP) y límites de tamaño.
  - Middlewares: `uploadHeroImage` (single, 5MB), `uploadCarouselImages` (múltiples, 3MB c/u, máx 10).
  - Utilidades: `handleMulterError`, `cleanupFiles`, `validateImageDimensions` (placeholder, validación reforzada en controlador).

## 8. Frontend: aplicación de tema y páginas

- `ThemeContext.jsx`:
  - `loadThemeSettings`: `GET /api/settings/current` con cache y fallback en `localStorage`.
  - `createDynamicTheme`: genera tema MUI usando paleta activa y fuentes del `SiteSettings`.
  - `useEffect`: aplica variables CSS (`--color-*`, `--font-*`, `--background-gradient`).
  - `loadThemeFonts`: precarga Google Fonts según fuentes escogidas.
  - `updateThemeSettings`: soporta preview en tiempo real y actualización tras aplicar cambios.

- Rutas y guardas:
  - `AppRoutes.jsx`: páginas de Super Admin protegidas con `RequireSuperAdmin`.
  - `ResponsiveAppBar.jsx`: navegación con entradas de Super Admin.

- Páginas clave:
  - `ThemeCustomization.jsx`: gestiona paletas (preview + apply).
  - `TypographySettings.jsx`: gestiona tipografías (combos + apply).
  - `BrandingSettings.jsx`: nombre del sitio y footer (preview + save).
  - `ImageManagement.jsx`/`SimpleCarouselManager.jsx`: hero y carrusel (subida/edición/eliminación).
  - `ChangeHistory.jsx`: listado, filtros y revert de cambios.

## 9. Flujos de trabajo implementados

- Aplicar paleta:
  - POST a `/api/super-admin/customization/palette` → actualiza `active_palette_id` → `CustomizationHistory.logChange('color_palette', ...)` → frontend refresca `ThemeContext` y CSS.

- Cambiar tipografías:
  - POST a `/api/super-admin/customization/fonts` → valida `isIn` → actualiza `SiteSettings` → registra `typography` → frontend carga Google Fonts y actualiza tema.

- Subir hero:
  - POST a `/api/super-admin/images/hero` → valida tipo/tamaño/dimensiones → guarda archivo → actualiza `hero_image_url` → registra `hero_image` → frontend refleja cambio.

- Carrusel:
  - Subida/edición/eliminación → actualiza `SiteSettings.carousel_images` → registra eventos `carousel_image_added`, `carousel_text_updated`, `carousel_image_deleted`.

- Historial y revert:
  - `GET /customization/history` muestra cambios con paginación y detalles.
  - `POST /customization/revert/:id` aplica `old_value` cuando procede y registra nuevo cambio para trazabilidad.

## 10. Validaciones y seguridad

- Modelos: `isUrl`, `len`, `isIn` y hex para colores; restricciones de rol en actualización de usuarios.
- Middleware: verificación JWT y rol `super_admin`.
- Subida de archivos: filtros de tipo y tamaño, manejo de errores con `handleMulterError`.

## 11. Decisiones de diseño

- Uso de `SiteSettings` como fuente de verdad única para tema/branding.
- `carousel_images` JSON por simplicidad y velocidad; migrado a tabla dedicada cuando fue necesario (`CarouselImage`).
- `getOrCreateDefault` asegura inicialización sin operaciones manuales.
- Enum de `CustomizationHistory` para categorizar y operar revert según tipo.

## 12. Limitaciones y mejoras posibles

- `validateImageDimensions` como placeholder: puede reforzarse con `sharp` u otro.
- `theme.js` base por defecto; la dinámica principal se maneja en `ThemeContext` (mantener consistencia de uso).
- Extender `isIn` de fuentes si se desea ampliar catálogo; requiere coordinación con `getFontOptions` y carga de Google Fonts.

## 13. Referencias de archivos

- Modelos: `back/src/models/ColorPalette.js`, `back/src/models/SiteSettings.js`, `back/src/models/CustomizationHistory.js`, `back/src/models/index.js`.
- Controladores: `back/src/controllers/customizationController.js`, `back/src/controllers/imageController.js`, `back/src/controllers/superAdminController.js`.
- Rutas: `back/src/routes/superAdminRoutes.js`, `back/src/routes/settings.routes.js`, `back/src/routes/imageRoutes.js`, `back/src/routes/simpleCarouselRoutes.js`, `back/src/app.js`.
- Middlewares: `back/src/middlewares/authMiddleware.js`, `back/src/middlewares/imageUpload.js`.
- Frontend: `frontend/src/context/ThemeContext.jsx`, `frontend/src/routes/AppRoutes.jsx`, `frontend/src/components/ResponsiveAppBar.jsx`, `frontend/src/pages/superadmin/ThemeCustomization.jsx`, `frontend/src/pages/superadmin/TypographySettings.jsx`, `frontend/src/pages/superadmin/BrandingSettings.jsx`, `frontend/src/pages/superadmin/ImageManagement.jsx`, `frontend/src/pages/superadmin/SimpleCarouselManager.jsx`, `frontend/src/pages/superadmin/ChangeHistory.jsx`.