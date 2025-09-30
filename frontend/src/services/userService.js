import axios from 'axios';

const API_URL = 'http://localhost:3001/api/users';

// Función para obtener el token de localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token recuperado para userService:', token?.substring(0, 10) + '...');
  return token;
};

// Obtener todos los usuarios con paginación
export const getUsers = async (page = 1, limit = 10) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  try {
    console.log('Fetching users, page:', page, 'limit:', limit);
    const response = await axios.get(`${API_URL}/admin/users`, {
      params: { page, limit },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Users response:', response.data);
    return response.data; // Devuelve el objeto { users: [...], totalPages, ... }
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Crear un nuevo usuario
export const createUser = async (userData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  // Nota: El endpoint de creación de usuario es 'register', que es público.
  // Si tuvieras un endpoint admin específico para crear usuarios, lo usarías aquí.
  // Por ahora, usamos el de registro.
  const response = await axios.post(`${API_URL}/register`, userData, {
    headers: {
      'Authorization': `Bearer ${token}` // Aunque sea público, es buena práctica enviarlo
    }
  });
  return response.data;
};

// Actualizar un usuario
export const updateUser = async (userId, userData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const response = await axios.put(`${API_URL}/admin/users/${userId}`, userData, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};

// Eliminar un usuario
export const deleteUser = async (userId) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};