// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Navbar = () => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Infinity Store
        </Typography>
        <Box>
          <Button color="inherit" component={Link} to="/">Inicio</Button>
          <Button color="inherit" component={Link} to="/login">Login</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
