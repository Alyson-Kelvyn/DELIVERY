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
  const availableStock = hasStockControl ? product.stock : null;
  const canAddMore =
    !hasStockControl || (availableStock !== null && quantity < availableStock);

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
    if (stock > 0) return "text-orange-600";
    return "text-red-600";
  };

  const getStockText = (stock: number) => {
    return `${stock} unidades`;
  };

  const addToCart = () => {
    if (hasStockControl && availableStock !== null && availableStock <= 0) {
      return; // Não permitir adicionar se não há estoque
    }
    dispatch({ type: "ADD_ITEM", payload: product });
  };

  const updateQuantity = (newQuantity: number) => {
    // Verificar se não está tentando adicionar mais do que o estoque disponível
    if (
      hasStockControl &&
      availableStock !== null &&
      newQuantity > availableStock
    ) {
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
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-contain"
        />
        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
          <span className="mr-1">{getCategoryIcon(product.category)}</span>
          {getCategoryLabel(product.category)}
        </div>

        {/* Badge de Estoque */}
        {hasStockControl && (
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <span className="mr-1">📦</span>
            <span className={getStockColor(availableStock || 0)}>
              {availableStock} un
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-red-600">
            R$ {product.price.toFixed(2)}
          </span>

          {quantity === 0 ? (
            <button
              onClick={addToCart}
              disabled={
                hasStockControl &&
                availableStock !== null &&
                availableStock <= 0
              }
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                hasStockControl &&
                availableStock !== null &&
                availableStock <= 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }`}
            >
              <Plus className="h-4 w-4" />
              <span>
                {hasStockControl &&
                availableStock !== null &&
                availableStock <= 0
                  ? "Sem estoque"
                  : "Adicionar"}
              </span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => updateQuantity(quantity - 1)}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => updateQuantity(quantity + 1)}
                disabled={
                  hasStockControl &&
                  availableStock !== null &&
                  quantity >= availableStock
                }
                className={`p-2 rounded-full transition-colors ${
                  hasStockControl &&
                  availableStock !== null &&
                  quantity >= availableStock
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
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
