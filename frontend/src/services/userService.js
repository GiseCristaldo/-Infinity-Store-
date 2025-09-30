import { API_ENDPOINTS } from '../config/api.js';

// Función para obtener todos los usuarios (solo admin)
export const getUsers = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.USERS.ADMIN, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener usuarios');
  }

  return response.json();
};

// Función para crear un nuevo usuario (solo admin)
export const createUser = async (userData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.USERS.BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Error al crear usuario');
  }

  return response.json();
};

// Función para actualizar un usuario (solo admin)
export const updateUser = async (id, userData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.USERS.ADMIN_BY_ID(id), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Error al actualizar usuario');
  }

  return response.json();
};

// Función para eliminar un usuario (solo admin)
export const deleteUser = async (id) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.USERS.ADMIN_BY_ID(id), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error al eliminar usuario');
  }

  return response.json();
};