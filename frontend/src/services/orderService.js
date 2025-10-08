// src/services/orderService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// Obtener todas las órdenes (paginadas) - Solo para administradores
export const getOrders = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  try {
    console.log('Fetching orders with token:', token?.substring(0, 10) + '...');
    // Usamos la ruta correcta para administradores según el backend
    const response = await axios.get(`${API_URL}/orders/admin?page=${page}&limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Orders response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error.response?.data || error);
    throw error.response?.data || error;
  }
};

// Obtener detalles de una orden específica
export const getOrderById = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.get(`${API_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Actualizar el estado de una orden
export const updateOrderStatus = async (id, status) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.put(`${API_URL}/orders/${id}/status`, 
      { state: status },
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Eliminar una orden (solo para propósitos administrativos)
export const deleteOrder = async (id) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete(`${API_URL}/orders/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Crear una nueva orden (esto normalmente lo haría el cliente)
export const createOrder = async (orderData) => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
