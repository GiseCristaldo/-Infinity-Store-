/**
 * Obtiene la URL base del API según el entorno
 * @returns {string} URL base del API
 */
export const getApiBaseUrl = () => {
  // En desarrollo, usar localhost:3001
  // En producción, usar la URL del entorno o relativa
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // En producción, usar la URL del entorno si está definida
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl;
  }
  
  // Fallback: usar la misma URL del frontend pero puerto 3001
  return `${window.location.protocol}//${window.location.hostname}:3001`;
};

/**
 * Convierte una URL relativa en una URL absoluta
 * @param {string} relativePath - Ruta relativa (ej: /uploads/avatar.jpg)
 * @returns {string|null} URL absoluta o null si no hay path
 */
export const getFullImageUrl = (relativePath) => {
  if (!relativePath) {
    return null;
  }
  
  // Si ya es una URL absoluta, devolverla tal como está
  if (relativePath.startsWith('http')) {
    return relativePath;
  }
  
  // Construir URL absoluta
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${relativePath}`;
};

/**
 * Valida si una URL de imagen es válida
 * @param {string} url - URL a validar
 * @returns {boolean} True si la URL es válida
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Verificar que sea una URL válida
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};