// src/context/CartContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

// Función auxiliar para obtener el carrito del localStorage (NO EXPORTADA FUERA DEL MODULO)
const getCartFromLocalStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error al leer el carrito de localStorage:', error);
    return [];
  }
};

// Función auxiliar para guardar el carrito en el localStorage (NO EXPORTADA FUERA DEL MODULO)
const saveCartToLocalStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error al guardar el carrito en localStorage:', error);
  }
};

// 1. Crear el Contexto (se define internamente y se exporta al final para compatibilidad con HMR)
const CartContext = createContext();

// 2. Crear el Proveedor del Contexto (Provider)
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getCartFromLocalStorage());

  // Efecto para sincronizar el estado del carrito con localStorage cada vez que cambia
  useEffect(() => {
    saveCartToLocalStorage(cartItems);
  }, [cartItems]);

  // Función para añadir un producto al carrito
  const addToCart = useCallback((product, quantityToAdd = 1) => {
    const existingItemIndex = cartItems.findIndex(item => item.id === product.id);

    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = cartItems.map((item, index) =>
        index === existingItemIndex
          ? { ...item, quantity: item.quantity + quantityToAdd }
          : item
      );
    } else {
      updatedCart = [...cartItems, { ...product, quantity: quantityToAdd }];
    }
    setCartItems(updatedCart);
  }, [cartItems]);

  // Función para remover un producto o decrementar su cantidad
  const removeFromCart = useCallback((productId, quantityToRemove = 1) => {
    const existingItemIndex = cartItems.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
      const existingItem = cartItems[existingItemIndex];
      if (existingItem.quantity - quantityToRemove <= 0) {
        const updatedCartItems = cartItems.filter(item => item.id !== productId);
        setCartItems(updatedCartItems);
      } else {
        const updatedCartItems = cartItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity - quantityToRemove }
            : item
        );
        setCartItems(updatedCartItems);
      }
    }
  }, [cartItems]);

  // Función para eliminar completamente un producto del carrito
  const deleteItemFromCart = useCallback((productId) => {
    const updatedCartItems = cartItems.filter(item => item.id !== productId);
    setCartItems(updatedCartItems);
  }, [cartItems]);

  // Función para vaciar completamente el carrito
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Calcular el total de ítems en el carrito (para el badge del AppBar)
  const getTotalItemsInCart = useCallback(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Calcular el total monetario del carrito
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((acc, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
      const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity || 0);
      return acc + (price * quantity);
    }, 0);
  }, [cartItems]);

  // 3. Proveer el estado y las funciones a los componentes hijos
  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    deleteItemFromCart,
    clearCart,
    getTotalItemsInCart,
    getCartTotal,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el carrito (opcional, pero útil)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Exporta CartContext al final de forma explícita para evitar problemas de HMR
export { CartContext } ;
