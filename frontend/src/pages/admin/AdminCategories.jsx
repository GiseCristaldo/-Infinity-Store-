import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  IconButton, Snackbar, Avatar
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

  const handleOpenModal = (category = null) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  const handleSubmit = async (formData) => {
    try {
      if (currentCategory && currentCategory.id) {
        await updateCategory(currentCategory.id, formData);
        setSnackbar({ open: true, message: 'Categoría actualizada correctamente', severity: 'success' });
      } else {
        await createCategory(formData);
        setSnackbar({ open: true, message: 'Categoría creada correctamente', severity: 'success' });
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Error al guardar la categoría', severity: 'error' });
    }
  };

  const handleDelete = async (category) => {
    setIsConfirmOpen(true);
    setCurrentCategory(category);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(currentCategory.id);
      setSnackbar({ open: true, message: 'Categoría eliminada correctamente', severity: 'success' });
      setIsConfirmOpen(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (err) {
      setSnackbar({ open: true, message: err.message || 'Error al eliminar la categoría', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Administrar Categorías</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()}>
          Nueva Categoría
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Imagen</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>
                    {cat.imagenURL ? (
                      <Avatar variant="rounded" src={cat.imagenURL} alt={cat.name} sx={{ width: 56, height: 56 }} />
                    ) : (
                      <Avatar variant="rounded" sx={{ width: 56, height: 56 }}>?</Avatar>
                    )}
                  </TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenModal(cat)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(cat)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal para crear/editar */}
      <Modal open={isModalOpen} onClose={handleCloseModal} title={currentCategory ? 'Editar Categoría' : 'Nueva Categoría'}>
        <CategoryForm initialData={currentCategory || {}} onSubmit={handleSubmit} />
      </Modal>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={isConfirmOpen}
        title="Eliminar categoría"
        content={`¿Seguro que deseas eliminar la categoría "${currentCategory?.name}"?`}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />
    </Box>
  );
}

export default AdminCategories;