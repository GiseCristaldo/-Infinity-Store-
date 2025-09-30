import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Alert,
  IconButton, Pagination, Snackbar, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/userService';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import UserForm from '../../components/forms/UserForm';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados para manejar modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchUsers = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers(currentPage);
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
  
  // Manejadores para el formulario
  const handleOpenForm = (user = null) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };
  
  const handleSubmitForm = async (formData) => {
    try {
      let message = '';
      if (currentUser) {
        await updateUser(currentUser.id, formData);
        message = '¡Usuario actualizado exitosamente!';
      } else {
        await createUser(formData);
        message = '¡Usuario creado exitosamente!';
      }
      handleCloseForm();
      setSnackbar({ open: true, message, severity: 'success' });
      fetchUsers(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ocurrió un error al procesar la solicitud.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };
  
  // Manejadores para el diálogo de eliminación
  const handleOpenConfirm = (user) => {
    setCurrentUser(user);
    setIsConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setIsConfirmOpen(false);
    setCurrentUser(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!currentUser) return;
    try {
      await deleteUser(currentUser.id);
      handleCloseConfirm();
      setSnackbar({ open: true, message: 'Usuario eliminado exitosamente.', severity: 'success' });
      fetchUsers(page);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al eliminar el usuario.';
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 2, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Gestión de Usuarios</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Añadir Usuario
        </Button>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.nombre}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip 
                    label={user.rol} 
                    color={user.rol === 'admin' ? 'primary' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenForm(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    color="error"
                    onClick={() => handleOpenConfirm(user)}
                    disabled={user.rol === 'admin'} // No permitir borrar admins
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
      
      <Modal
        open={isModalOpen}
        onClose={handleCloseForm}
        title={currentUser ? 'Editar Usuario' : 'Añadir Nuevo Usuario'}
      >
        <UserForm
          onSubmit={handleSubmitForm}
          initialData={currentUser || {}}
          isEdit={!!currentUser}
        />
      </Modal>

      <ConfirmDialog
        open={isConfirmOpen}
        onCancel={handleCloseConfirm}
        onConfirm={handleConfirmDelete}
        title="Confirmar Eliminación"
      >
        ¿Estás seguro de que quieres eliminar el usuario "{currentUser?.nombre}"? Esta acción no se puede deshacer.
      </ConfirmDialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default AdminUsers;