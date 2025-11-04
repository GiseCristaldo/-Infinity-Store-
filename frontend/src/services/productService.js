import axios from 'axios';

const API_URL = 'http://localhost:3001/api/products';

// Función para obtener el token de localStorage
const getToken = () => {
  const token = localStorage.getItem('token');
  console.log('Token recuperado para productService:', token?.substring(0, 10) + '...');
  return token;
};

// Obtener todos los productos con paginación
export const getProducts = async (page = 1, limit = 10) => {
  // Esta ruta es pública, pero la usamos también en el admin
  const response = await axios.get(API_URL, {
    params: { page, limit },
  });
  return response.data;
};

// Obtener un solo producto por ID
export const getProductById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Crear un nuevo producto (ruta protegida)
export const createProduct = async (productData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  // Si hay imágenes nuevas, usar FormData para enviar archivos
  if (productData.newImages && productData.newImages.length > 0) {
    const formData = new FormData();
    
    // Agregar datos del producto
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('categoryId', productData.categoryId);
    
    // Agregar archivos de imagen
    productData.newImages.forEach((file, index) => {
      formData.append('images', file);
      // Marcar cuál es la imagen principal
      if (productData.images[index]?.isPrimary) {
        formData.append('primaryImageIndex', index);
      }
    });

    const response = await axios.post(`${API_URL}/with-files`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
        // No fijar 'Content-Type': el navegador define el boundary automáticamente
      }
    });
    return response.data;
  } else {
    // Fallback para productos sin imágenes (aunque no debería pasar)
    const response = await axios.post(API_URL, {
      name: productData.name,
      description: productData.description,
      price: productData.price,
      stock: productData.stock,
      categoryId: productData.categoryId
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    return response.data;
  }
};

// Actualizar un producto (ruta protegida)
export const updateProduct = async (id, productData) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  // Si hay imágenes nuevas, usar FormData para enviar archivos
  if (productData.newImages && productData.newImages.length > 0) {
    const formData = new FormData();
    
    // Agregar datos del producto
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('categoryId', productData.categoryId);
    
    // Agregar información de imágenes existentes
    if (productData.images) {
      formData.append('existingImages', JSON.stringify(productData.images.filter(img => img.isExisting)));
    }
    
    // Agregar archivos de imagen nuevos
    productData.newImages.forEach((file) => {
      formData.append('images', file);
    });

    // Encontrar cuál imagen debe ser principal (índice relativo a previews)
    const primaryImageIndex = productData.images.findIndex(img => img.isPrimary);
    if (primaryImageIndex !== -1) {
      formData.append('primaryImageIndex', primaryImageIndex);
    }

    const response = await axios.put(`${API_URL}/${id}/with-files`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
        // No fijar 'Content-Type': el navegador define el boundary automáticamente
      }
    });
    return response.data;
  } else {
    // SIN nuevas imágenes: aún necesitamos actualizar qué imagen es principal.
    // Enviar a la ruta with-files con FormData, sólo con imágenes existentes y primaryImageIndex.
    const formData = new FormData();

    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price);
    formData.append('stock', productData.stock);
    formData.append('categoryId', productData.categoryId);

    if (productData.images) {
      formData.append('existingImages', JSON.stringify(productData.images.filter(img => img.isExisting)));
      const primaryImageIndex = productData.images.findIndex(img => img.isPrimary);
      if (primaryImageIndex !== -1) {
        formData.append('primaryImageIndex', primaryImageIndex);
      }
    }

    const response = await axios.put(`${API_URL}/${id}/with-files`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
        // No fijar 'Content-Type': el navegador define el boundary automáticamente
      }
    });
    return response.data;
  }
};

// Eliminar un producto (ruta protegida)
export const deleteProduct = async (id) => {
  const token = getToken();
  if (!token) throw new Error('No token found');

  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
};