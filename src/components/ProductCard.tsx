import React from "react";
import { Plus, Minus } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { state, dispatch } = useCart();

  const cartItem = state.items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  // Verificar se o produto tem controle de estoque
  const hasStockControl = product.stock !== null && product.stock !== undefined;
  const availableStock = hasStockControl ? product.stock! : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "marmitas":
        return "🥘";
      case "bebidas":
        return "🥤";
      case "sobremesas":
        return "🍰";
      case "acompanhamentos":
        return "🥗";
      default:
        return "🍽️";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "marmitas":
        return "Marmita";
      case "bebidas":
        return "Bebida";
      case "sobremesas":
        return "Sobremesa";
      case "acompanhamentos":
        return "Acompanhamento";
      default:
        return "Produto";
    }
  };

  const getStockColor = (stock: number) => {
    if (stock > 5) return "text-green-600";
    if (stock > 0) return "text-primary-600";
    return "text-red-600";
  };



  const addToCart = () => {
    if (hasStockControl && availableStock <= 0) {
      return; // Não permitir adicionar se não há estoque
    }
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const updateQuantity = (newQuantity: number) => {
    // Verificar se não está tentando adicionar mais do que o estoque disponível
    if (hasStockControl && newQuantity > availableStock) {
      return; // Não permitir adicionar mais do que o estoque
    }

    if (newQuantity === 0) {
      dispatch({ type: "REMOVE_ITEM", payload: product.id });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { id: product.id, quantity: newQuantity },
      });
    }
  };

  return (
    <div className="card-elegant group animate-fade-in btn-hover">
      <div className="relative h-64 overflow-hidden bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
        
        <div className="absolute top-3 left-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center shadow-lg">
          <span className="mr-1.5 text-sm">{getCategoryIcon(product.category)}</span>
          {getCategoryLabel(product.category)}
        </div>

        {/* Badge de Estoque */}
        {hasStockControl && (
          <div className="absolute top-3 right-3 glass-effect px-3 py-1.5 rounded-full text-xs font-semibold flex items-center">
            <span className="mr-1.5">📦</span>
            <span className={getStockColor(availableStock)}>
              {availableStock}
            </span>
          </div>
        )}

        {/* Indicador de produto em destaque */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-full">
            <span className="text-primary-600">✨</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <h3 className="font-display font-bold text-xl text-gray-800 mb-2 leading-tight">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-3xl font-display font-bold gradient-text">
              R$ {product.price.toFixed(2)}
            </span>
            {hasStockControl && availableStock <= 3 && availableStock > 0 && (
              <span className="text-xs text-primary-600 font-medium">
                ⚠️ Últimas unidades!
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <button
              onClick={addToCart}
              disabled={hasStockControl && availableStock <= 0}
              className={`px-6 py-3 rounded-xl flex items-center space-x-2 font-semibold transition-all duration-300 ${
                hasStockControl && availableStock <= 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "btn-primary shadow-lg hover:shadow-xl"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>
                {hasStockControl && availableStock <= 0 ? "Esgotado" : "Adicionar"}
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-3 glass-effect px-4 py-2 rounded-xl">
              <button
                onClick={() => updateQuantity(quantity - 1)}
                className="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 p-2 rounded-lg transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-bold text-xl text-gray-800 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(quantity + 1)}
                disabled={hasStockControl && quantity >= availableStock}
                className={`p-2 rounded-lg transition-colors ${
                  hasStockControl && quantity >= availableStock
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-primary-500 hover:bg-primary-600 text-white shadow-md hover:shadow-lg"
                }`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
