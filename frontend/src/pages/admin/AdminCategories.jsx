import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  IconButton, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// --- Servicios y Componentes que necesitaremos ---
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import CategoryForm from '../../components/forms/CategoryForm';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- Estados para modales ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las categorías.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // --- Manejadores para el formulario ---
  const handleOpenForm = (category = null) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };
  const handleCloseForm = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };
  const handleSubmitForm = async (formData) => {
    try {
      let message = '';
      if (currentCategory) {
        await updateCategory(currentCategory.id, formData);
        message = '¡Categoría actualizada exitosamente!';
      } else {
        await createCategory(formData);
        message = '¡Categoría creada exitosamente!';
      }
      handleCloseForm();
      setSnackbar({ open: true, message, severity: 'success' });
      fetchCategories();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ocurrió un error.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // --- Manejadores para eliminación ---
  const handleOpenConfirm = (category) => {
    setCurrentCategory(category);
    setIsConfirmOpen(true);
  };
  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setCurrentCategory(null);
  };
  const handleConfirmDelete = async () => {
    if (!currentCategory) return;
    try {
      await deleteCategory(currentCategory.id);
      handleCloseConfirm();
      setSnackbar({ open: true, message: 'Categoría eliminada exitosamente.', severity: 'success' });
      fetchCategories();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar la categoría.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Gestión de Categorías</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Añadir Categoría
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpenForm(category)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleOpenConfirm(category)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={isModalOpen}
        onClose={handleCloseForm}
        title={currentCategory ? 'Editar Categoría' : 'Añadir Nueva Categoría'}
      >
        <CategoryForm
          onSubmit={handleSubmitForm}
          initialData={currentCategory || {}}
        />
      </Modal>

      <ConfirmDialog
        open={isConfirmOpen}
        onCancel={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        ¿Estás seguro de que quieres eliminar la categoría "{currentCategory?.name}"?
      </ConfirmDialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AdminCategories;