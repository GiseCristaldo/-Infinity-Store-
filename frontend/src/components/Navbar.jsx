// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useTheme } from '../context/ThemeContext.jsx';

const Navbar = () => {
  const { currentSettings } = useTheme();
  
  // Get dynamic site name or fallback to default
  const siteName = currentSettings?.site_name || 'Infinity Store';

  return (
    <AppBar 
      position="static" 
      color="primary"
      sx={{
        backgroundColor: 'var(--color-primary)',
        '& .MuiToolbar-root': {
          backgroundColor: 'var(--color-primary)',
        }
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1,
            fontFamily: 'var(--font-heading)',
            color: '#ffffff'
          }}
        >
          {siteName}
        </Typography>
        <Box>
          <Button 
            color="inherit" 
            component={Link} 
            to="/"
            sx={{ 
              fontFamily: 'var(--font-primary)',
              color: '#ffffff'
            }}
          >
            Inicio
          </Button>
          <Button 
            color="inherit" 
            component={Link} 
            to="/login"
            sx={{ 
              fontFamily: 'var(--font-primary)',
              color: '#ffffff'
            }}
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
