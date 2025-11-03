import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook personalizado para manejar el estado y validación del formulario de perfil
 * @param {Object} initialData - Datos iniciales del formulario
 * @returns {Object} Estado y funciones del formulario
 */
export const useProfileForm = (initialData = {}) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Inicializar formulario con datos del usuario
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  }, [user]);

  /**
   * Maneja el cambio de valores en los campos del formulario
   * @param {string} field - Nombre del campo
   * @returns {Function} Función para manejar el evento de cambio
   */
  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  /**
   * Actualiza un campo específico del formulario
   * @param {string} field - Nombre del campo
   * @param {any} value - Nuevo valor
   */
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Valida todos los campos del formulario
   * @returns {boolean} True si el formulario es válido
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validar nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = 'El nombre no puede exceder los 50 caracteres';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validar contraseñas si se quiere cambiar
    const hasPasswordFields = formData.newPassword || formData.confirmPassword || formData.currentPassword;
    if (hasPasswordFields) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Contraseña actual requerida para cambiar contraseña';
      }
      
      if (!formData.newPassword) {
        newErrors.newPassword = 'Nueva contraseña requerida';
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      } else if (formData.newPassword.length > 128) {
        newErrors.newPassword = 'La contraseña no puede exceder los 128 caracteres';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Resetea el formulario a los valores iniciales del usuario
   */
  const resetForm = () => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
    setErrors({});
  };

  /**
   * Limpia solo los campos de contraseña
   */
  const clearPasswordFields = () => {
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    // Limpiar errores de contraseña
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.currentPassword;
      delete newErrors.newPassword;
      delete newErrors.confirmPassword;
      return newErrors;
    });
  };

  /**
   * Establece un error específico para un campo
   * @param {string} field - Nombre del campo
   * @param {string} message - Mensaje de error
   */
  const setFieldError = (field, message) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  };

  return {
    formData,
    errors,
    loading,
    setLoading,
    handleInputChange,
    updateField,
    validateForm,
    resetForm,
    clearPasswordFields,
    setFieldError,
    hasPasswordChange: !!(formData.newPassword || formData.confirmPassword || formData.currentPassword)
  };
};