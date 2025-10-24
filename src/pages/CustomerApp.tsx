import React, { useState } from 'react';
import Header from '../components/Header';
import Menu from '../components/Menu';
import Cart from '../components/Cart';

const CustomerApp: React.FC = () => {
  const [showCart, setShowCart] = useState(false);

  return (
    <div className="min-h-screen gradient-bg">
      <Header onCartClick={() => setShowCart(true)} />
      
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-50 to-secondary-50 opacity-50"></div>
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-800 mb-4 animate-fade-in">
            Churrasco Artesanal
            <span className="block text-primary-600">Direto na Sua Mesa</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-slide-up">
            Experimente o sabor autêntico do churrasco brasileiro, preparado com carinho e ingredientes selecionados. 
            Entregamos qualidade e tradição em cada marmita.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></span>
              <span>🔥 Preparado na hora</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></span>
              <span>🚚 Entrega rápida</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></span>
              <span>⭐ Qualidade garantida</span>
            </div>
          </div>
        </div>
      </section>

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