import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  IconButton, Pagination, Avatar, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// --- Importar todo lo necesario ---
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import Modal from '../../components/Modal';
import ProductForm from '../../components/forms/ProductForm';
import ConfirmDialog from '../../components/ConfirmDialog';

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- Estados para manejar las acciones ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const fetchProducts = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      const data = await getProducts(currentPage);
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  const handlePageChange = (event, value) => setPage(value);
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // --- Manejadores para el formulario (Crear y Editar) ---
  const handleOpenForm = (product = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };
  const handleCloseForm = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };
  const handleSubmitForm = async (formData) => {
    try {
      const dataToSend = {
         name: formData.name,
        description: formData.description,
         price: parseFloat(formData.price), // Convertimos el string a número decimal
        stock: parseInt(formData.stock, 10), // Convertimos el string a entero
        imagenURL: formData.image, // Renombramos 'image' a 'imagenURL'
        categoryId: formData.categoryId,
      };
      let message = '';
      if (currentProduct) {
        await updateProduct(currentProduct.id, dataToSend);
        message = '¡Producto actualizado exitosamente!';
      } else {
        await createProduct(dataToSend);
        message = '¡Producto creado exitosamente!';
      }
      handleCloseForm();
      setSnackbar({ open: true, message, severity: 'success' });
      fetchProducts(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ocurrió un error al procesar la solicitud.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // --- Manejadores para el diálogo de eliminación ---
  const handleOpenConfirm = (product) => {
    setCurrentProduct(product);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setCurrentProduct(null);
  };
  const handleConfirmDelete = async () => {
    if (!currentProduct) return;
    try {
      await deleteProduct(currentProduct.id);
      handleCloseConfirm();
      setSnackbar({ open: true, message: 'Producto eliminado exitosamente.', severity: 'success' });
      fetchProducts(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar el producto.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Gestión de Productos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Añadir Producto
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Imagen</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Avatar src={product.image} alt={product.name} variant="square" />
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.category?.name || 'N/A'}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenForm(product)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleOpenConfirm(product)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" />
      </Box>

      <Modal
        open={isModalOpen}
        onClose={handleCloseForm}
        title={currentProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
      >
        <ProductForm
          onSubmit={handleSubmitForm}
          initialData={currentProduct || {}}
          isEdit={!!currentProduct}
        />
      </Modal>

      <ConfirmDialog
        open={isConfirmOpen}
        onCancel={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        ¿Estás seguro de que quieres eliminar el producto "{currentProduct?.name}"? Esta acción no se puede deshacer.
      </ConfirmDialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AdminProducts;