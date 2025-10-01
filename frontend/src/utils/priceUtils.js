/**
 * Utilidades para formateo y cálculos de precios
 */

/**
 * Valida si un precio es válido (número y mayor que 0)
 * @param {any} price - El precio a validar
 * @returns {boolean} - True si el precio es válido
 */
export const isValidPrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && numPrice >= 0;
};

/**
 * Formatea un precio para mostrar con símbolo de moneda
 * @param {number|string} price - El precio a formatear
 * @param {string} currency - Símbolo de moneda (por defecto '$')
 * @returns {string} - Precio formateado
 */
export const formatPrice = (price, currency = '$') => {
  if (!isValidPrice(price)) {
    return `${currency}0.00`;
  }
  
  const numPrice = parseFloat(price);
  return `${currency}${numPrice.toFixed(2)}`;
};

/**
 * Calcula el precio con descuento
 * @param {number|string} originalPrice - Precio original
 * @param {number|string} discountPercentage - Porcentaje de descuento
 * @returns {number} - Precio con descuento aplicado
 */
export const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  if (!isValidPrice(originalPrice) || !isValidPrice(discountPercentage)) {
    return 0;
  }
  
  const price = parseFloat(originalPrice);
  const discount = parseFloat(discountPercentage);
  
  if (discount < 0 || discount > 100) {
    return price;
  }
  
  return price * (1 - discount / 100);
};

/**
 * Calcula el ahorro en dinero por el descuento
 * @param {number|string} originalPrice - Precio original
 * @param {number|string} discountPercentage - Porcentaje de descuento
 * @returns {number} - Cantidad ahorrada
 */
export const calculateSavings = (originalPrice, discountPercentage) => {
  if (!isValidPrice(originalPrice) || !isValidPrice(discountPercentage)) {
    return 0;
  }
  
  const price = parseFloat(originalPrice);
  const discount = parseFloat(discountPercentage);
  
  if (discount < 0 || discount > 100) {
    return 0;
  }
  
  return price * (discount / 100);
};

/**
 * Calcula el total de un carrito de compras
 * @param {Array} items - Array de items del carrito
 * @returns {number} - Total del carrito
 */
export const calculateCartTotal = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 0;
  }
  
  return items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 0;
    const discount = parseFloat(item.discount) || 0;
    
    const itemPrice = discount > 0 ? calculateDiscountedPrice(price, discount) : price;
    return total + (itemPrice * quantity);
  }, 0);
};

/**
 * Formatea un número como porcentaje
 * @param {number|string} value - Valor a formatear
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (value) => {
  if (!isValidPrice(value)) {
    return '0%';
  }
  
  const numValue = parseFloat(value);
  return `${numValue.toFixed(0)}%`;
};