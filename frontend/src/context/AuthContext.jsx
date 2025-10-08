// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.js';

// 1. Crear el Contexto
const AuthContext = createContext(null);

// 2. Crear el Proveedor (Provider) del Contexto
export const AuthProvider = ({ children }) => {
  // Estado para el usuario autenticado (si lo hay) y si está autenticado
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Para manejar el estado de carga inicial al verificar el token

  // Función para cargar la información del usuario desde el backend usando el token
  const loadUserFromToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token) {
      // Intenta obtener los datos del usuario usando el token
      try {
        const response = await axios.get(API_ENDPOINTS.AUTH.ME, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        // La API devuelve { user: { id, nombre, email, rol } }
        const fetchedUser = response.data?.user || null;
        if (fetchedUser) {
          setUser(fetchedUser);
          // Mantener consistencia con localStorage
          try {
            localStorage.setItem('user', JSON.stringify(fetchedUser));
          } catch (_) {
            // Ignorar errores de almacenamiento
          }
        } else {
          setUser(null);
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token inválido o expirado, cerrando sesión automáticamente:', error);
        // Limpiar todos los tokens y datos
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else if (refreshToken) {
      // Si no hay token pero hay refreshToken, intenta renovar la sesión
      try {
        console.log('Intentando renovar token con refreshToken');
        // Implementar lógica para renovar token usando refreshToken si tu API lo soporta
      } catch (error) {
        console.error('Error al renovar token:', error);
        // Limpiar todos los tokens y datos
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
      }
    }
    setLoading(false); // La carga inicial ha terminado
  }, []);

  // Efecto para cargar el usuario cuando el componente se monta
  useEffect(() => {
    loadUserFromToken();
  }, [loadUserFromToken]);

  // Función de Login
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const { token, refreshToken, user: userData } = response.data;

      // Guardar tokens y datos del usuario
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, message: response.data.message, user: userData };
    } catch (error) {
      console.error('Error en login:', error.response?.data?.message || error.message);
      setIsAuthenticated(false);
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión.' };
    }
  }, []);

  // Función de Login con Google
  const googleLogin = useCallback(async (idToken) => {
    try {
      const response = await axios.post(API_ENDPOINTS.AUTH.GOOGLE, { idToken });
      const { token, refreshToken, user: userData } = response.data;

      // Guardar tokens y datos del usuario
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, message: response.data.message, user: userData };
    } catch (error) {
      console.error('Error en Google login:', error.response?.data?.message || error.message);
      setIsAuthenticated(false);
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión con Google.' };
    }
  }, []);

  // Función de Logout
  const logout = async () => {
    try {
      // Eliminar todos los tokens y datos de usuario
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      // Actualizar el estado del contexto
      setUser(null);
      setIsAuthenticated(false);
      console.log('Sesión cerrada correctamente');
      return true;
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      return false;
    }
  };

  // Proporcionar el estado y las funciones a los componentes hijos
  const contextValue = {
    user,
    isAuthenticated,
    loading, // Para saber si ya se verificó el token inicial
    login,
    googleLogin,
    logout,
  };

  // Renderizar los hijos del proveedor, pasando el valor del contexto
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Crear un hook personalizado para un acceso fácil al contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
