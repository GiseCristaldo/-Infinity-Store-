import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
  useMediaQuery,
  Box
} from '@mui/material';

function ConfirmDialog({ 
  open, 
  title, 
  children, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "error",
  severity = "warning" 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[24],
          // Mejorar contraste del fondo
          backgroundColor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          // Responsive
          margin: isMobile ? 1 : 3,
          width: isMobile ? 'calc(100% - 16px)' : 'auto',
        }
      }}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(2px)',
        }
      }}
    >
      <DialogTitle 
        id="confirm-dialog-title"
        sx={{
          fontSize: isMobile ? '1.1rem' : '1.25rem',
          fontWeight: 600,
          color: 'text.primary',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {title}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 2, pb: 1 }}>
        <DialogContentText
          sx={{
            color: 'text.primary',
            fontSize: isMobile ? '0.9rem' : '1rem',
            lineHeight: 1.5,
          }}
        >
          {children}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          p: 2, 
          pt: 1,
          gap: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexDirection: isMobile ? 'column-reverse' : 'row',
        }}
      >
        <Button 
          onClick={onCancel}
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? 'auto' : 100,
            color: 'text.secondary',
            borderColor: 'divider',
            '&:hover': {
              borderColor: 'text.secondary',
              backgroundColor: 'action.hover',
            }
          }}
        >
          {cancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          color={confirmColor} 
          variant="contained"
          autoFocus
          fullWidth={isMobile}
          sx={{
            minWidth: isMobile ? 'auto' : 100,
            fontWeight: 600,
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;