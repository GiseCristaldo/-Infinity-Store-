import { useState } from 'react';

/**
 * Hook personalizado para manejar la validación y visibilidad de contraseñas
 * @returns {Object} Estado y funciones para manejo de contraseñas
 */
export const usePasswordValidation = () => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  /**
   * Alterna la visibilidad de un campo de contraseña
   * @param {string} field - Campo de contraseña (current, new, confirm)
   */
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  /**
   * Valida la fortaleza de una contraseña
   * @param {string} password - Contraseña a validar
   * @returns {Object} Resultado de la validación
   */
  const validatePasswordStrength = (password) => {
    const result = {
      isValid: true,
      errors: [],
      strength: 'weak'
    };

    if (!password) {
      result.isValid = false;
      result.errors.push('La contraseña es requerida');
      return result;
    }

    if (password.length < 6) {
      result.isValid = false;
      result.errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (password.length > 128) {
      result.isValid = false;
      result.errors.push('La contraseña no puede exceder los 128 caracteres');
    }

    // Calcular fortaleza de la contraseña
    let strengthScore = 0;
    
    if (password.length >= 8) strengthScore++;
    if (/[a-z]/.test(password)) strengthScore++;
    if (/[A-Z]/.test(password)) strengthScore++;
    if (/\d/.test(password)) strengthScore++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strengthScore++;

    if (strengthScore <= 2) {
      result.strength = 'weak';
    } else if (strengthScore <= 3) {
      result.strength = 'medium';
    } else {
      result.strength = 'strong';
    }

    return result;
  };

  /**
   * Valida que dos contraseñas coincidan
   * @param {string} password - Primera contraseña
   * @param {string} confirmPassword - Contraseña de confirmación
   * @returns {Object} Resultado de la validación
   */
  const validatePasswordMatch = (password, confirmPassword) => {
    if (!password && !confirmPassword) {
      return { isValid: true, error: null };
    }

    if (password !== confirmPassword) {
      return { 
        isValid: false, 
        error: 'Las contraseñas no coinciden' 
      };
    }

    return { isValid: true, error: null };
  };

  /**
   * Valida un conjunto completo de contraseñas (actual, nueva, confirmar)
   * @param {Object} passwords - Objeto con las contraseñas
   * @param {string} passwords.current - Contraseña actual
   * @param {string} passwords.new - Nueva contraseña
   * @param {string} passwords.confirm - Confirmación de nueva contraseña
   * @param {boolean} isRequired - Si el cambio de contraseña es requerido
   * @returns {Object} Resultado de la validación completa
   */
  const validatePasswordSet = (passwords, isRequired = false) => {
    const { current, new: newPassword, confirm } = passwords;
    const errors = {};
    let isValid = true;

    // Si hay algún campo de contraseña lleno, validar todo el conjunto
    const hasAnyPasswordField = current || newPassword || confirm;
    
    if (hasAnyPasswordField || isRequired) {
      // Validar contraseña actual
      if (!current) {
        errors.current = 'Contraseña actual requerida para cambiar contraseña';
        isValid = false;
      }

      // Validar nueva contraseña
      const newPasswordValidation = validatePasswordStrength(newPassword);
      if (!newPasswordValidation.isValid) {
        errors.new = newPasswordValidation.errors[0];
        isValid = false;
      }

      // Validar coincidencia
      const matchValidation = validatePasswordMatch(newPassword, confirm);
      if (!matchValidation.isValid) {
        errors.confirm = matchValidation.error;
        isValid = false;
      }
    }

    return {
      isValid,
      errors,
      hasPasswordChange: hasAnyPasswordField
    };
  };

  /**
   * Obtiene el color para mostrar la fortaleza de la contraseña
   * @param {string} strength - Nivel de fortaleza (weak, medium, strong)
   * @returns {string} Color para la UI
   */
  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'weak':
        return 'error';
      case 'medium':
        return 'warning';
      case 'strong':
        return 'success';
      default:
        return 'default';
    }
  };

  /**
   * Obtiene el texto descriptivo para la fortaleza de la contraseña
   * @param {string} strength - Nivel de fortaleza
   * @returns {string} Texto descriptivo
   */
  const getStrengthText = (strength) => {
    switch (strength) {
      case 'weak':
        return 'Débil';
      case 'medium':
        return 'Media';
      case 'strong':
        return 'Fuerte';
      default:
        return '';
    }
  };

  return {
    showPasswords,
    togglePasswordVisibility,
    validatePasswordStrength,
    validatePasswordMatch,
    validatePasswordSet,
    getStrengthColor,
    getStrengthText
  };
};