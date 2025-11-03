import axios from 'axios';

const API_URL = 'http://localhost:3001/api/categories';

// Obtener token
const getToken = () => localStorage.getItem('token');

// Obtener todas las categorías (público)
export const getAllCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Obtener una categoría por ID (público)
export const getCategoryById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Crear una nueva categoría (admin, multipart)
export const createCategory = async (categoryData) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('name', categoryData.name);
  if (categoryData.imageFile) {
    formData.append('image', categoryData.imageFile);
  }
  const response = await axios.post(API_URL, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Actualizar una categoría (admin, multipart)
export const updateCategory = async (id, categoryData) => {
  const token = getToken();
  const formData = new FormData();
  formData.append('name', categoryData.name);
  if (typeof categoryData.active !== 'undefined') {
    formData.append('active', String(categoryData.active));
  }
  if (categoryData.imageFile) {
    formData.append('image', categoryData.imageFile);
  }
  const response = await axios.put(`${API_URL}/${id}`, formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Eliminar lógicamente una categoría (admin)
export const deleteCategory = async (id) => {
  const token = getToken();
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};