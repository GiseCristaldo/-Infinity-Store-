import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

function ConfirmDialog({ open, title, children, onConfirm, onCancel }) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-dialog-title"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;