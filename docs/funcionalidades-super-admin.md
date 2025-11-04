# Infinity Store — Funcionalidades del Panel de Super Admin

Este documento resume las capacidades del Panel de Super Admin en "Infinity Store" y cómo aportan valor en gobernanza, personalización visual, gestión de imágenes clave y auditoría del sitio. Está orientado a stakeholders comerciales y técnicos que necesitan una visión clara y práctica del alcance.

## Propuesta de valor (Super Admin)

- Gobernanza centralizada de branding, estética y seguridad.
- Personalización ágil de paletas de color, tipografías y marca.
- Control de imágenes clave (Hero y Carrusel) para campañas.
- Historial de cambios con rollback para auditoría y seguridad.
- Arquitectura modular preparada para escalar y extender.

---

## Capacidades principales

- Acceso exclusivo: sólo usuarios con rol `super_admin`.
- Personalización integral del tema:
  - Paletas de color preconfiguradas con validación estricta.
  - Tipografías controladas (primaria y encabezados) con combinaciones predefinidas.
  - Branding: nombre del sitio y contenido del footer.
- Gestión de imágenes:
  - Hero: subida con validación de formato/tamaño/dimensiones.
  - Carrusel: subida múltiple, edición de textos, eliminación.
- Gobernanza de roles:
  - Promoción de clientes a administradores (exclusivo del Super Admin).
  - Bloqueos sobre cuenta `super_admin` para proteger la jerarquía.
- Auditoría y control:
  - Historial de cambios de personalización con detalles y revert.

Beneficios:
- Control total de la experiencia visual y de marca.
- Capacidad de reacción rápida ante campañas y temporadas.
- Cumplimiento y trazabilidad mediante historial y rollback.

---

## Personalización del sitio (Tema)

- Paletas de color:
  - Paletas almacenadas y validadas (hexadecimal) para primario, secundario, acento y texto.
  - Selección y aplicación de la paleta activa con impacto inmediato en el frontend.
- Tipografías:
  - Combinaciones predefinidas de fuente primaria y de encabezados.
  - Carga dinámica de Google Fonts para vista previa y aplicación.
- Branding:
  - Cambio del nombre del sitio y contenido del footer con validación.
  - Efecto instantáneo en componentes clave (navbar, páginas de login, elementos de UI).

Experiencia:
- Vista previa segura desde el panel.
- Aplicación definitiva con registro en historial y actualización del tema.

---

## Gestión de Imágenes

- Hero (portada):
  - Subida de una imagen destacada con filtros de tipo y límites de tamaño.
  - Validación de dimensiones recomendadas y reemplazo de la imagen anterior.
  - Actualización del `hero_image_url` y registro del cambio.
- Carrusel:
  - Subida múltiple (con límites por archivo y total) para campañas/regalos/ofertas.
  - Edición de textos del slide (título y subtítulo) para mensajes de marketing.
  - Eliminación de imágenes con actualización del orden.

Resultados:
- Portadas impactantes y carruseles coherentes con marca y promociones.
- Mejor comunicación visual y conversión.

---

## Gobernanza de Roles

- Cambio de rol seguro:
  - Promoción `cliente → admin` controlada por Super Admin.
  - Validaciones para impedir cambios a `super_admin` y situaciones no válidas.
- Propósito:
  - Escalar el equipo operativo con controles claros de acceso.
  - Mantener la integridad del sistema de permisos.

---

## Historial y Auditoría

- Registro de cambios:
  - `color_palette`, `typography`, `branding`, `hero_image`, `carousel`.
  - Eventos específicos: imagen añadida, texto editado, imagen eliminada, visibilidad de hero.
- Revert:
  - Posibilidad de deshacer cambios aplicando el `old_value` cuando procede.
  - Diálogos de confirmación y detalle en el panel de historia.

Ventajas:
- Trazabilidad completa y cumplimiento.
- Seguridad ante cambios no deseados.

---

## Integración y Seguridad

- Autenticación robusta: JWT con comprobación de rol `super_admin`.
- Subida de archivos con filtros de tipo y tamaño, almacenamiento organizado.
- Validaciones de contenido (hex para colores, listas permitidas para fuentes, URLs válidas).
- CORS, Helmet y buenas prácticas de entorno para despliegues controlados.

---

## Arquitectura y Flujo

- Backend:
  - Rutas bajo `'/api/super-admin'` protegidas por middleware de Super Admin.
  - Controladores de personalización e imágenes que actualizan `SiteSettings` y `CustomizationHistory`.
- Frontend:
  - Páginas: Personalización de Tema, Tipografías, Branding, Imágenes, Historial.
  - Guardas de ruta (RequireSuperAdmin) y `ThemeContext` para aplicar cambios en tiempo real.

Flujos clave:
- Aplicar paleta → actualiza paleta activa y variables CSS.
- Cambiar tipografías → valida fuentes, precarga Google Fonts y actualiza tema.
- Subir hero → guarda imagen, valida y actualiza portada.
- Carrusel → subida/edición/eliminación con impacto inmediato.

---

## Diferenciales competitivos (Super Admin)

- Control total sobre estética y branding sin depender de desarrollo.
- Auditoría y rollback que reducen riesgo y costos.
- Capacidades listas para campañas estacionales y A/B testing visual.
- Escalabilidad: fácil extensión de paletas, fuentes y tipos de cambio.

---

## Roadmap sugerido

- Más paletas y fuentes: catálogo ampliado y soportes regionales.
- Reglas avanzadas de visibilidad (hero/carrusel por temporada o segmento).
- Versionado de tema: snapshots y comparativas.
- Integración con CDNs para optimizar imágenes.
- Automatización de campañas con programaciones y plantillas.

---

## Mensaje para stakeholders

El Panel de Super Admin potencia la estrategia de marca con personalización ágil, gestión visual efectiva y auditoría rigurosa. Permite adaptar la experiencia del sitio a objetivos comerciales en tiempo real, reduciendo fricción operativa y manteniendo seguridad y consistencia.