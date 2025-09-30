import axios from 'axios';

const API_URL = 'http://localhost:3001/api/products';

// Función para obtener el token de localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token recuperado para productService:', token?.substring(0, 10) + '...');
  return token;
};

// Obtener todos los productos con paginación
export const getProducts = async (page = 1, limit = 10) => {
  // Esta ruta es pública, pero la usamos también en el admin
  const response = await axios.get(API_URL, {
    params: { page, limit },
  });
  return response.data;
};

// Obtener un solo producto por ID
export const getProductById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Crear un nuevo producto (ruta protegida)
export const createProduct = async (productData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const response = await axios.post(API_URL, productData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

// Actualizar un producto (ruta protegida)
export const updateProduct = async (id, productData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const response = await axios.put(`${API_URL}/${id}`, productData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

// Eliminar un producto (ruta protegida)
export const deleteProduct = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};