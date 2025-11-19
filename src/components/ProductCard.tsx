import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Product } from "../types";
import { useCart } from "../context/CartContext";
import ComplementModal from "./ComplementModal";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { state, dispatch } = useCart();
  const [openComplement, setOpenComplement] = useState(false);

  const cartItem = state.items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  // Verificar se o produto tem controle de estoque
  const hasStockControl = product.stock !== null && product.stock !== undefined;
  const availableStock = hasStockControl ? product.stock! : 0;


  const getStockColor = (stock: number) => {
    if (stock > 5) return "text-green-600";
    if (stock > 0) return "text-primary-600";
    return "text-red-600";
  };



  const addToCart = () => {
    if (hasStockControl && availableStock <= 0) {
      return; // Não permitir adicionar se não há estoque
    }
    // Em vez de adicionar direto, abre modal de complementos
    setOpenComplement(true);
  };

  const handleConfirmComplement = (data: { selectedComplements: Product[]; observation?: string }) => {
    // Converte complementos para o formato correto com quantidade
    const complementsWithQuantity = data.selectedComplements.map(comp => ({
      product: comp,
      quantity: 1
    }));

    // Adiciona o produto com complementos e observação
    dispatch({ 
      type: "ADD_ITEM_WITH_COMPLEMENTS", 
      payload: { 
        product, 
        complements: complementsWithQuantity,
        observation: data.observation?.trim()
      } 
    });

    setOpenComplement(false);
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="flex">
        {/* Imagem do produto */}
        <div className="w-32 h-32 flex-shrink-0 bg-gray-50 relative overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />

        </div>

        {/* Informações do produto */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-800 mb-1 leading-tight">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-gray-800">
                R$ {product.price.toFixed(2)}
              </span>
              
              {/* Controles de quantidade ou botão adicionar */}
              {quantity === 0 ? (
                <button
                  onClick={addToCart}
                  disabled={hasStockControl && availableStock <= 0}
                  className={`px-6 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    hasStockControl && availableStock <= 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {hasStockControl && availableStock <= 0 ? "Esgotado" : "Pedir"}
                </button>
              ) : (
                <div className="flex items-center space-x-3 bg-gray-50 px-3 py-2 rounded-lg">
                  <button
                    onClick={() => updateQuantity(quantity - 1)}
                    className="bg-white hover:bg-gray-100 text-gray-700 p-1 rounded-md border transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-lg text-gray-800 min-w-[1.5rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(quantity + 1)}
                    disabled={hasStockControl && quantity >= availableStock}
                    className={`p-1 rounded-md border transition-colors ${
                      hasStockControl && quantity >= availableStock
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800 border-black"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status de estoque */}
          {hasStockControl && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className={`font-medium ${getStockColor(availableStock)}`}>
                {availableStock > 0 ? `${availableStock} disponível` : "Esgotado"}
              </span>
              {availableStock <= 3 && availableStock > 0 && (
                <span className="text-orange-600 font-medium">
                  Últimas unidades!
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <ComplementModal
        open={openComplement}
        product={product}
        onClose={() => setOpenComplement(false)}
        onConfirm={handleConfirmComplement}
      />
    </div>
  );
};

export default ProductCard;
