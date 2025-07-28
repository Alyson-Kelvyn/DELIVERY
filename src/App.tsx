import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import CustomerApp from './pages/CustomerApp';
import AdminApp from './pages/AdminApp';

function App() {
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/" element={<CustomerApp />} />
          <Route path="/admin" element={<AdminApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;