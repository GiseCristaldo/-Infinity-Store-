import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { SearchProvider } from './context/SearchContext.jsx';


function App() {
  return (
  
    <Router>
      <AuthProvider>
        <CartProvider>
          <SearchProvider>
            <AppRoutes />
          </SearchProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;