import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DynamicThemeProvider } from './context/ThemeContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { SearchProvider } from './context/SearchContext.jsx';


function App() {
  return (
    <Router>
      <DynamicThemeProvider>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              <AppRoutes />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </DynamicThemeProvider>
    </Router>
  );
}


export default App;