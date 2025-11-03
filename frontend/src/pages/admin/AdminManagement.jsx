import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, Chip, Alert, Snackbar, TablePagination, InputAdornment, Switch,
  FormControlLabel, Tooltip
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Visibility as ViewIcon, VisibilityOff as HideIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import UserForm from '../../components/forms/UserForm';

function AdminManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: user?.rol === 'super_admin' ? 'admin' : 'cliente',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Usar diferentes endpoints según el rol del usuario
      const endpoint = user?.rol === 'super_admin' 
        ? '/api/super-admin/admins' 
        : '/api/admin/clients';
        
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Mapear los campos del backend a los esperados por el frontend
      const mappedAdmins = (response.data.admins || []).map(admin => ({
        ...admin,
        isActive: admin.is_active, // Mapear is_active a isActive
        createdAt: admin.date_register // Mapear date_register a createdAt
      }));
      
      setAdmins(mappedAdmins);
    } catch (error) {
      console.error('Error loading admins:', error);
      showSnackbar('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.length < 2 || formData.nombre.length > 50) {
      errors.nombre = 'El nombre debe tener entre 2 y 50 caracteres';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    if (!editingAdmin && !formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password && formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar rol según el usuario actual
    if (user?.rol === 'super_admin') {
      if (formData.rol !== 'admin' && formData.rol !== 'cliente') {
        errors.rol = 'Solo se pueden crear administradores o clientes';
      }
    } else {
      if (formData.rol !== 'cliente') {
        errors.rol = 'Solo puedes crear usuarios con rol de cliente';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Usar diferentes endpoints según el rol del usuario
      const baseEndpoint = user?.rol === 'super_admin' 
        ? '/api/super-admin/admins' 
        : '/api/admin/clients';

      if (editingAdmin) {
        // Actualizar usuario existente
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // No enviar password vacío en actualizaciones
        }
        
        await axios.put(`${baseEndpoint}/${editingAdmin.id}`, updateData, { headers });
        showSnackbar('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await axios.post(baseEndpoint, formData, { headers });
        showSnackbar('Usuario creado exitosamente');
      }

      handleCloseDialog();
      loadAdmins();
    } catch (error) {
      console.error('Error saving user:', error);
      const message = error.response?.data?.message || 'Error al guardar usuario';
      showSnackbar(message, 'error');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      nombre: admin.nombre,
      email: admin.email,
      password: '',
      rol: admin.rol,
      isActive: admin.isActive
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleDeactivate = async (adminId) => {
    const userType = user?.rol === 'super_admin' ? 'usuario' : 'cliente';
    if (!window.confirm(`¿Estás seguro de que quieres desactivar este ${userType}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const baseEndpoint = user?.rol === 'super_admin' 
        ? '/api/super-admin/admins' 
        : '/api/admin/clients';
        
      await axios.delete(`${baseEndpoint}/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar(`${userType.charAt(0).toUpperCase() + userType.slice(1)} desactivado exitosamente`);
      loadAdmins();
    } catch (error) {
      console.error('Error deactivating user:', error);
      const message = error.response?.data?.message || `Error al desactivar ${userType}`;
      showSnackbar(message, 'error');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAdmin(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: user?.rol === 'super_admin' ? 'admin' : 'cliente',
      isActive: true
    });
    setFormErrors({});
  };

  const handleOpenCreateDialog = () => {
    setEditingAdmin(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: user?.rol === 'super_admin' ? 'admin' : 'cliente',
      isActive: true
    });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Filtrar admins por término de búsqueda
  const filteredAdmins = admins.filter(admin =>
    admin.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginación
  const paginatedAdmins = filteredAdmins.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography>Cargando administradores...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <TextField
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateDialog}
            >
              Crear Usuario
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha de Creación</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>{admin.nombre}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={admin.rol === 'super_admin' ? 'Super Admin' : admin.rol === 'admin' ? 'Administrador' : 'Cliente'} 
                        color={admin.rol === 'super_admin' ? 'secondary' : admin.rol === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={admin.isActive ? 'Activo' : 'Inactivo'} 
                        color={admin.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton 
                          onClick={() => handleEdit(admin)}
                          disabled={admin.rol === 'super_admin'}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Desactivar">
                        <IconButton 
                          onClick={() => handleDeactivate(admin.id)}
                          disabled={admin.rol === 'super_admin' || !admin.isActive}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredAdmins.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Dialog para crear/editar administrador */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAdmin ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              error={!!formErrors.nombre}
              helperText={formErrors.nombre}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={!!formErrors.email}
              helperText={formErrors.email}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label={editingAdmin ? "Nueva Contraseña (opcional)" : "Contraseña"}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={!!formErrors.password}
              helperText={formErrors.password || (editingAdmin ? "Dejar vacío para mantener la contraseña actual" : "")}
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                value={formData.rol}
                label="Rol"
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                error={!!formErrors.rol}
              >
                <MenuItem value="cliente">Cliente</MenuItem>
                {user?.rol === 'super_admin' && (
                  <MenuItem value="admin">Administrador</MenuItem>
                )}
              </Select>
              {formErrors.rol && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                  {formErrors.rol}
                </Typography>
              )}
            </FormControl>
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', mb: 2 }}>
              {user?.rol === 'super_admin' 
                ? 'Como Super Administrador, puedes crear usuarios Cliente y Administrador.'
                : 'Los administradores solo pueden crear usuarios con rol de Cliente. Para crear Administradores, contacte al Super Administrador.'
              }
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Usuario activo"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingAdmin ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default AdminManagement;