import { useState } from 'react';
import { getFullImageUrl } from '../utils/urlUtils';

/**
 * Hook personalizado para manejar la subida y preview de avatar
 * @param {Function} onError - Función callback para manejar errores
 * @returns {Object} Estado y funciones para manejo de avatar
 */
export const useAvatarUpload = (onError) => {
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  /**
   * Valida un archivo de imagen
   * @param {File} file - Archivo a validar
   * @returns {Object} Resultado de la validación
   */
  const validateImageFile = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      return { isValid: false, error: 'No se seleccionó ningún archivo' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'La imagen no puede ser mayor a 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)' };
    }

    return { isValid: true };
  };

  /**
   * Maneja el cambio de archivo de avatar
   * @param {Event} event - Evento de cambio de archivo
   */
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    
    if (!file) {
      clearAvatar();
      return;
    }

    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      if (onError) {
        onError(validation.error);
      }
      // Limpiar el input
      event.target.value = '';
      return;
    }

    setAvatarFile(file);
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.onerror = () => {
      if (onError) {
        onError('Error al leer el archivo de imagen');
      }
    };
    reader.readAsDataURL(file);
  };

  /**
   * Limpia el avatar seleccionado y su preview
   */
  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  /**
   * Obtiene la URL del avatar para mostrar
   * @param {string} userAvatar - URL del avatar actual del usuario
   * @returns {string|null} URL del avatar a mostrar
   */
  const getAvatarUrl = (userAvatar) => {
    if (avatarPreview) {
      return avatarPreview;
    }
    
    return getFullImageUrl(userAvatar);
  };

  /**
   * Verifica si hay un avatar seleccionado para subir
   * @returns {boolean} True si hay un archivo seleccionado
   */
  const hasNewAvatar = () => {
    return avatarFile !== null;
  };

  /**
   * Obtiene el archivo de avatar para enviar al servidor
   * @returns {File|null} Archivo de avatar o null
   */
  const getAvatarFile = () => {
    return avatarFile;
  };

  /**
   * Simula el proceso de subida (para mostrar loading)
   * @param {Function} uploadFunction - Función que realiza la subida
   * @returns {Promise} Promesa de la subida
   */
  const uploadAvatar = async (uploadFunction) => {
    if (!avatarFile) {
      return null;
    }

    setUploading(true);
    try {
      const result = await uploadFunction(avatarFile);
      // Solo limpiar si la subida fue exitosa
      clearAvatar();
      return result;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    avatarFile,
    avatarPreview,
    uploading,
    handleAvatarChange,
    clearAvatar,
    getAvatarUrl,
    hasNewAvatar,
    getAvatarFile,
    uploadAvatar,
    validateImageFile
  };
};