import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import helmet from 'helmet';

import categoryRoutes from './routes/category.routes.js';
import authRoutes from './routes/auth.routes.js';
import orderRoutes from './routes/order.routes.js';
import productRoutes from './routes/product.routes.js'; 
import userRoutes from './routes/user.routes.js'; // <-- NUEVA IMPORTACIÓN
import fileRoutes from './routes/file.routes.js';
import chatRoutes from './routes/chat.routes.js';
import contactRoutes from './routes/contact.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import settingsRoutes from './routes/settings.routes.js';
import imageRoutes from './routes/imageRoutes.js';

dotenv.config();

const app = express();

// Configuración de CORS para permitir solicitudes desde el frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://localhost:5173',
  'https://localhost:5174',
  'https://infinity-store-frontend.vercel.app'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Permitir clientes no navegador (curl, servidores)
    const vercelRegex = /^https:\/\/.+\.vercel\.app$/;
    if (allowedOrigins.includes(origin) || vercelRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS bloqueado para origen: ${origin}`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Configuración de encabezados de seguridad
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://accounts.google.com"]
    }
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', cors(corsOptions), express.static('uploads'));

app.get('/', (req, res) => {
    res.send( 'Infinity Store Backend is running!!🚀 ');
});

// --- Uso de las Rutas (Endpoints) ---
// Define los prefijos de las URLs para cada grupo de rutas

// 1. AUTENTICACIÓN (LOGIN, REGISTER, GOOGLE): Prefijo /api/auth
app.use('/api/auth', authRoutes);

// 2. GESTIÓN DE USUARIOS (ADMIN/CRUD): Prefijo /api/users
app.use('/api/users', userRoutes);

// 3. GESTIÓN DE PRODUCTOS: Prefijo /api/products
app.use('/api/products', productRoutes);

// 4. GESTIÓN DE CATEGORÍAS: Prefijo /api/categories
app.use('/api/categories', categoryRoutes);

// 5. GESTIÓN DE PEDIDOS: Prefijo /api/orders
app.use('/api/orders', orderRoutes);

// Chatbot: Prefijo /api/chat
app.use('/api/chat', chatRoutes);

// 6. GESTIÓN DE ARCHIVOS: Prefijo /api/files
app.use('/api/files', fileRoutes);

// 7. CONTACTO: Prefijo /api/contact
app.use('/api/contact', contactRoutes);

// 8. NEWSLETTER: Prefijo /api/newsletter
app.use('/api/newsletter', newsletterRoutes);

// 9. SUPER ADMIN: Prefijo /api/super-admin
app.use('/api/super-admin', superAdminRoutes);

// 10. ADMIN: Prefijo /api/admin
app.use('/api/admin', adminRoutes);

// 11. PUBLIC SETTINGS: Prefijo /api/settings
app.use('/api/settings', settingsRoutes);

// 12. IMAGE MANAGEMENT: Prefijo /api/customization
app.use('/api/customization', imageRoutes);

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Función para inicializar la base de datos y el servidor
const startServer = async () => {
  try {
    // Sincronizar la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: false }); // Desactivar alteraciones automáticas
    console.log('✅ Modelos sincronizados correctamente.');
    
    // Iniciar el servidor
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Error al inicializar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
