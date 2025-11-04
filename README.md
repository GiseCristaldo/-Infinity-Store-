# Infinity Store — README

Infinity Store es una plataforma de e‑commerce moderna, segura y escalable. Este README explica cómo levantar el proyecto localmente (backend + frontend) y cómo preparar la base de datos.

## Tecnologías clave

- Backend: Node.js + Express, Sequelize (MySQL), JWT, bcrypt, Helmet, CORS
- Autenticación: Google Identity Services (GSI) + login local
- Subida de archivos: Multer (imágenes de productos, categorías, hero, carrusel, avatares)
- Emails transaccionales: Nodemailer (SMTP)
- Frontend: React + Vite, Material UI, Axios, React Router

## Requisitos previos

- Node.js >= 18
- MySQL (recomendado: Docker con `docker-compose`)
- SMTP (opcional para correos reales)

## Base de datos (Docker)

Para un entorno reproducible de desarrollo:

1) Crear y levantar MySQL + Adminer:
```bash
# En la raíz del proyecto
docker compose up -d
```
- Puerto MySQL: `3306`
- Adminer (UI web): `http://localhost:8080` (servidor: `mysql`, usuario: `appuser`, pass: `app_pass`, base: `infinity_store_dev`)

2) Configurar `back/.env` (copiar desde `.env.example`):
```
DB_NAME=infinity_store_dev
DB_USER=appuser
DB_PASSWORD=app_pass
DB_HOST=127.0.0.1
DB_PORT=3306
JWT_SECRET=tu_clave_jwt_muy_segura_y_larga
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
FRONTEND_URL=http://localhost:5173
# SMTP opcional
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=tu_email_smtp@gmail.com
SMTP_PASS=tu_contraseña_de_aplicacion
FROM_NAME=Infinity Store
FROM_EMAIL=tu_email@dominio.com
ADMIN_EMAIL=admin@dominio.com
```

3) Inicializar esquema y datos de personalización:
```bash
cd back
npm install
node scripts/createCustomizationTables.js   # Crea tablas de personalización y paletas por defecto
node scripts/syncDB.js                      # Sincroniza el resto del esquema (usuarios, productos, etc.)
node scripts/createTestSuperAdmin.js        # Crea/actualiza un super admin de prueba
```
- Credenciales del super admin de prueba (impresas por el script):
  - Email: `test@superadmin.com`
  - Password: `TestAdmin123!`

Nota: Si no usas Docker, crea la base y el usuario manualmente y ajusta `DB_*`:
```sql
CREATE DATABASE infinity_store_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'appuser'@'%' IDENTIFIED BY 'app_pass';
GRANT ALL PRIVILEGES ON infinity_store_dev.* TO 'appuser'@'%';
FLUSH PRIVILEGES;
```

## Instalación y ejecución

Backend:
```bash
cd back
npm install
npm run dev
# Servirá API en http://localhost:3001/
```

Frontend:
```bash
cd frontend
npm install
npm run dev
# Vite en http://localhost:5173/
```

## Variables de entorno (frontend)

- `frontend/.env` (o `.env.local`):
```
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_API_BASE=http://localhost:3001
```

## Rutas principales (backend)

- Autenticación: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google`, `GET /api/auth/me`
- Usuarios: `GET /api/users/admin`, `PUT /api/users/admin/:id`, `DELETE /api/users/admin/:id`, `GET/PUT /api/users/profile`
- Productos: `GET /api/products`, `POST /api/products`, `POST /api/products/with-files`
- Categorías: `GET /api/categories`, `POST /api/categories`
- Archivos: `POST /api/files/upload/:productId`, `GET /api/files/product/:productId`, `PUT /api/files/primary/:fileId`
- Imágenes sitio: `POST /api/images/hero-image`, `POST /api/images/upload`, `PUT /api/images/carousel/:index`, `DELETE /api/images/carousel/:index`
- Super Admin: bajo `/api/super-admin` (roles, paletas, tipografías, branding, hero/carrusel, historial)
- Chat: `POST /api/chat`

## Notas de seguridad

- No subir `back/.env` ni secretos al repositorio.
- Usar `JWT_SECRET` fuerte y HTTPS en producción.
- `uploads/` se sirve como estático; no subir archivos sensibles.

## Troubleshooting

- Conexión a DB: verifica `DB_HOST=127.0.0.1` y que MySQL esté en `3306`.
- Permisos de usuario: usa Adminer para confirmar usuario/base.
- Migraciones/seed: re‑ejecuta `createCustomizationTables.js` si faltan paletas/config.

---

Documentación adicional:
- `docs/funcionalidades-ecommerce.md`
- `docs/funcionalidades-super-admin.md`
- `docs/super-admin-implementacion.md`