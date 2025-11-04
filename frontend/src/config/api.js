// Configuración centralizada de API
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://localhost:3001' // Para producción local
  : ''; // Para desarrollo usa el proxy

export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    GOOGLE: `${API_BASE_URL}/api/auth/google`,
    ME: `${API_BASE_URL}/api/auth/me`
  },
  
  // Usuarios (administración)
  USERS: {
    BASE: `${API_BASE_URL}/api/users`,
    ADMIN: `${API_BASE_URL}/api/users/admin`,
    ADMIN_BY_ID: (id) => `${API_BASE_URL}/api/users/admin/${id}`
  },
  
  // Productos
  PRODUCTS: {
    BASE: `${API_BASE_URL}/api/products`,
    BY_ID: (id) => `${API_BASE_URL}/api/products/${id}`
  },
  
  // Categorías
  CATEGORIES: {
    BASE: `${API_BASE_URL}/api/categories`,
    BY_ID: (id) => `${API_BASE_URL}/api/categories/${id}`
  },
  
  // Órdenes
  ORDERS: {
    BASE: `${API_BASE_URL}/api/orders`,
    BY_ID: (id) => `${API_BASE_URL}/api/orders/${id}`,
    MY_ORDERS: `${API_BASE_URL}/api/orders/my-orders`
  },
  
  // Newsletter
  NEWSLETTER: {
    SUBSCRIBE: `${API_BASE_URL}/api/newsletter/subscribe`
  }
}; 

export { API_BASE_URL }; 
export default API_ENDPOINTS;