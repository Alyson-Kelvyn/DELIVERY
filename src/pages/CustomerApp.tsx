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
      
      {/* Footer */}
      <footer className="bg-secondary-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-display font-bold mb-2">ChurrascoDelivery</h3>
              <p className="text-secondary-200">Tradição e sabor em cada entrega</p>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-secondary-200">📱 (11) 99999-9999</span>
              <span className="text-secondary-200">⏰ Seg-Dom: 11h às 23h</span>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-6 pt-4 text-secondary-300 text-sm">
            © 2024 ChurrascoDelivery. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerApp;