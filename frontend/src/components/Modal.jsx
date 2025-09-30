import React from 'react';
import { Modal as MuiModal, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function Modal({ open, onClose, title, children }) {
  return (
    <MuiModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
    >
      <Box sx={style}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography id="modal-title" variant="h6" component="h2">
            {title}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        {children}
      </Box>
    </MuiModal>
  );
}

export default Modal;