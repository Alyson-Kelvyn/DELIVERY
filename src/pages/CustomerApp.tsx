import React, { useState } from 'react';
import Header from '../components/Header';
import Menu from '../components/Menu';
import Cart from '../components/Cart';

const CustomerApp: React.FC = () => {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onCartClick={() => setShowCart(true)} />
      <Menu />
      <Cart isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};

export default CustomerApp;