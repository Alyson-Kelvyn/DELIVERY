import React from 'react';
import { ShoppingCart, ChefHat, Phone, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { state } = useCart();
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = state.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-primary-100">
      {/* Top bar com informações */}
      <div className="bg-primary-600 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Seg-Dom: 11h às 23h</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span className="font-medium">🚚 Entrega GRÁTIS acima de R$ 30,00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header principal */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-2xl shadow-card">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold gradient-text">
                ChurrascoDelivery
              </h1>
              <p className="text-secondary-600 text-sm font-medium">
                ✨ Sabor autêntico que aquece o coração
              </p>
            </div>
          </div>
          
          <button
            onClick={onCartClick}
            className="relative group bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 p-4 rounded-2xl transition-all duration-300 shadow-card hover:shadow-card-hover transform hover:-translate-y-1"
          >
            <ShoppingCart className="h-6 w-6 text-gray" />
            {itemCount > 0 && (
              <>
                <span className="absolute -top-2 -right-2 bg-accent-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce-subtle">
                  {itemCount}
                </span>
                <div className="absolute -bottom-12 right-0 bg-gray-900 text-gray text-xs font-medium px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  R$ {totalValue.toFixed(2)}
                </div>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;