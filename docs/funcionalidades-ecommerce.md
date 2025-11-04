# Infinity Store — Borrador de funcionalidades orientado a marketing

Este documento resume las capacidades del e‑commerce "Infinity Store" y cómo agregan valor a usuarios finales, administradores y super administradores. Está diseñado para presentar el producto de forma clara y atractiva para stakeholders comerciales y técnicos.

## Propuesta de valor

- Tienda online moderna, segura y escalable.
- Autenticación confiable (JWT + Google Sign‑In) que reduce fricción y aumenta conversiones.
- Gestión integral de catálogo, usuarios y contenidos visuales.
- Experiencia cuidada en navegación, búsqueda y detalle de producto.
- Arquitectura modular que facilita evolución y personalizaciones.

---

## Experiencia de Cliente (Usuarios)

- Autenticación flexible:
  - Registro y login tradicionales (email + contraseña) con validación fuerte de seguridad.
  - Inicio de sesión con Google (Google Identity Services) para una entrada rápida y segura.
- Perfil y cuenta:
  - Visualización y edición de datos básicos (nombre, email).
  - Cambios de contraseña con ayudas de validación.
- Exploración y descubrimiento:
  - Home dinámico con carrusel de imágenes.
  - Listado y detalle de productos con imágenes, precio y disponibilidad.
  - Búsqueda integrada y navegación por categorías.
- Carrito y checkout:
  - Añadir y actualizar cantidades de productos.
  - Flujo de creación de orden con cálculo de totales y validación de stock.
  - Historial de pedidos del usuario autenticado.
- Notificaciones y UX:
  - Mensajes de éxito/error claros en acciones clave.
  - Diseño responsive y componentes MUI para una interfaz moderna.

Beneficios:
- Menos fricción al iniciar sesión → mayor probabilidad de conversión.
- Validaciones y feedback inmediato → confianza y satisfacción del usuario.
- Catálogo claro y visual → impulso en tasa de clics y carrito.
- Asistencia inmediata con chatbot integrado (consultas de productos, envíos, soporte).
- Emails transaccionales confiables con `nodemailer` (Bienvenida al usuario nuevo, Email de suscripción).

---

## Roles y Permisos

- Visitante (no autenticado):
  - Navegar por el catálogo, ver categorías y detalle de productos.
  - Búsqueda y filtros básicos.
- Cliente (autenticado):
  - Registro/Login (email + contraseña) o Google Sign‑In.
  - Carrito y checkout: añadir productos, validar stock, crear orden.
  - Mis Órdenes: visualizar historial y detalle de pedidos.
  - Perfil: edición de datos personales y cambio de contraseña.
- Admin:
  - Gestión de catálogo (productos y categorías): crear, editar, eliminar, imágenes, stock y precios.
  - Gestión de clientes: listado, creación/edición, activación/desactivación.
  - Gestión de órdenes: visualizar, actualizar estado y detalle.
  - No puede cambiar roles ni modificar cuentas admin/super_admin.
  - Notificación al admin por registro de usuarios (local y Google). 
  - Notificación al admin por mensajes de contacto

- Super Admin:
  - Gobernanza de roles: puede promover clientes a administradores (exclusivo). No se permite modificar super_admin.
  - Personalización: paletas de color preconfiguradas, tipografías, branding (nombre del sitio y footer).
  - Gestión de imágenes y textos del carrusel (ofertas/contenidos).
  - Historial de cambios de personalización.

---

## Panel de Administración (Admin)

- Gestión de catálogo (productos):
  - Creación, edición y eliminación de productos.
  - Subida de múltiples imágenes por producto (con soporte de orden y principal).
  - Control de stock, precio, etc.
- Gestión de usuarios (clientes):
  - Listado paginado de clientes.
  - Creación y edición de clientes.
  - Activación/desactivación de cuentas de clientes.
  - No puede cambiar roles ni gestionar administradores/super_admin.
- Órdenes:
  - Listado y detalle de órdenes.
  - Actualización de estado cuando corresponde.
- Seguridad operativa:
  - Acceso protegido por JWT.
  - Validación de privilegios de acceso (admin).

Beneficios:
- Control total del catálogo y la presentación visual.
- Reducción de costos operativos gracias a herramientas internas.
- Flexibilidad para campañas (Cambios visuales rápidos).
- Gestión eficiente de imágenes con `multer` (productos, carrusel, branding).
- Automatización de notificaciones con `nodemailer` (alertas, cambios de estado, alta de usuarios).
- Soporte y respuestas rápidas mediante chatbot para FAQs operativas.

---

## Panel de Super Admin (Super Administrador)

- Privilegios extendidos:
  - Acceso sólo para cuentas con rol `super_admin`.
  - Gestión avanzada de configuración del sitio y administración.
- Operaciones de alto nivel:
  - Gobernanza de roles y seguridad: promoción de cliente → admin (exclusivo). No modifica cuentas `super_admin`.
  - Personalización: selección de paletas de colores y tipografías disponibles.
  - Gestión de imágenes y textos de los slides del carrusel.
  - Branding: cambio de nombre de la marca y contenido del footer.
  - Visualización del historial de cambios de personalización.
- Integración y escalabilidad:
  - Configuración de credenciales (Google, correo, base de datos) vía entorno.
  - Supervisión de políticas de seguridad, CORS y entornos de despliegue.

Beneficios:
- Gobernanza centralizada del ecosistema.
- Seguridad y cumplimiento mejorados.
- Escalabilidad y control en múltiples ambientes.
- Personalización visual ágil con `multer` (imágenes del sitio, carrusel).
- Comunicación proactiva con `nodemailer` (avisos de cambios críticos, auditoría).
- Experiencia guiada con chatbot para configuración y ayuda contextual.

---

## Integraciones y Seguridad

- Google Identity Services (GSI): login social confiable y verificación de tokens con `google-auth-library`.
- JWT con expiración: sesiones seguras y controladas.
- Validación fuerte de contraseñas: mínimo 8 caracteres, mayúscula, número y carácter especial.
- SMTP/Nodemailer: emails transaccionales (bienvenida, notificación a admin).
- Multer para archivos: subida robusta de imágenes (con límites y filtros de tipo).
- CORS y Helmet: protección y configuración de acceso controlado desde el frontend.

---

## Arquitectura y Tecnologías

- Backend: Node.js + Express, Sequelize (MySQL), JWT, bcrypt, multer, dotenv.
- Frontend: React + Vite, MUI, Axios, rutas con React Router.
- Base de datos: modelo relacional para usuarios, productos, órdenes y configuración del sitio.
- Personalización: SiteSettings para branding y contenidos visuales centralizados.

---

## Diferenciales competitivos

- Experiencia de compra rápida y segura.
- Backoffice potente para catálogo, usuarios y branding.
- Arquitectura lista para crecer: modular, escalable y fácil de mantener.
- Integraciones esenciales (Google, email), con posibilidad de extender (pasarelas de pago, analytics, cupones).

---

## Roadmap sugerido (extensiones)

- Pasarelas de pago (Mercado Pago, Stripe) con estados y Webhooks.
- Cupones y campañas de marketing.
- Reportes y analytics (ventas, productos más vistos, cohortes).
- Reseñas y calificaciones de productos.
- CMS ligero para contenido estático (FAQ, envíos, políticas).

---

## Mensaje comercial

Infinity Store combina una experiencia de compra moderna con un panel administrativo versátil. Su autenticación confiable, gestión de imágenes y branding dinámico permiten lanzar campañas y ajustar el catálogo en tiempo real. La arquitectura segura y modular reduce el costo de mantenimiento y facilita la expansión del negocio.