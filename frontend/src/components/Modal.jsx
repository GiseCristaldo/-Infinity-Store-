import React from 'react';
import { Modal as MuiModal, Box, Typography, IconButton, useTheme, useMediaQuery } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function Modal({ open, onClose, title, children, maxWidth = 'sm', fullWidth = true }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: isMobile ? '95vw' : isTablet ? '85vw' : 
           maxWidth === 'xs' ? 400 : 
           maxWidth === 'sm' ? 600 : 
           maxWidth === 'md' ? 800 : 
           maxWidth === 'lg' ? 1000 : 1200,
    maxWidth: isMobile ? '95vw' : '90vw',
    maxHeight: isMobile ? '90vh' : '85vh',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: theme.shadows[24],
    p: isMobile ? 2 : 3,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    // Mejorar contraste y legibilidad
    '& .MuiTypography-root': {
      color: 'text.primary',
    },
    // Asegurar que el fondo sea sólido y contrastante
    backdropFilter: 'blur(4px)',
    border: `1px solid ${theme.palette.divider}`,
  };

  return (
    <MuiModal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      sx={{
        // Mejorar el backdrop para mejor contraste
        '& .MuiModal-backdrop': {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(2px)',
        }
      }}
    >
      <Box sx={style}>
        {/* Header del modal */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0
        }}>
          <Typography 
            id="modal-title" 
            variant={isMobile ? "h6" : "h5"} 
            component="h2"
            sx={{ 
              fontWeight: 600,
              color: 'text.primary',
              pr: 2
            }}
          >
            {title}
          </Typography>
          <IconButton 
            onClick={onClose}
            sx={{ 
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
                color: 'text.primary'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Contenido del modal */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'action.hover',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'action.selected',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'action.disabled',
            },
          },
        }}>
          {children}
        </Box>
      </Box>
    </MuiModal>
  );
}

export default Modal;