import axios from 'axios';

const API_URL = 'http://localhost:3001/api/categories';

// Función para obtener el token de localStorage
const getToken = () => localStorage.getItem('token');

// Obtener todas las categorías (público)
export const getAllCategories = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    return [];
  }
};

// Crear una nueva categoría (protegido)
export const createCategory = async (categoryData) => {
  const token = getToken();
  const response = await axios.post(API_URL, categoryData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

// Actualizar una categoría (protegido)
export const updateCategory = async (id, categoryData) => {
  const token = getToken();
  const response = await axios.put(`${API_URL}/${id}`, categoryData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.data;
};

// Eliminar una categoría (protegido)
export const deleteCategory = async (id) => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};