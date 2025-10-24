import React, { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Edit3, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import OrderForm from "./OrderForm";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { state, dispatch } = useCart();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [editingObservation, setEditingObservation] = useState<string | null>(
    null
  );
  const [observationText, setObservationText] = useState("");

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      dispatch({ type: "REMOVE_ITEM", payload: id });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
    }
  };

  const updateObservation = (id: string, observation: string) => {
    dispatch({ type: "UPDATE_OBSERVATION", payload: { id, observation } });
    setEditingObservation(null);
    setObservationText("");
  };

  const startEditingObservation = (
    id: string,
    currentObservation: string = ""
  ) => {
    setEditingObservation(id);
    setObservationText(currentObservation);
  };

  const cancelEditingObservation = () => {
    setEditingObservation(null);
    setObservationText("");
  };

  // Taxa de entrega baseada no tipo de entrega
  const deliveryFee = state.deliveryType === "entrega" ? 2 : 0;
  const totalWithDelivery = state.total + deliveryFee;

  if (!isOpen) return null;

  if (showOrderForm) {
    return (
      <OrderForm onBack={() => setShowOrderForm(false)} onClose={onClose} />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto custom-scrollbar animate-in">
        <div className="sticky top-0 glass-effect border-b border-primary-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-gray-800">Seu Carrinho</h2>
            <p className="text-sm text-gray-600">
              {state.items.length} {state.items.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-8 rounded-3xl mb-6">
              <ShoppingBag className="h-20 w-20 text-primary-400 mx-auto" />
            </div>
            <h3 className="text-xl font-display font-semibold text-gray-800 mb-2">
              Carrinho Vazio
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Que tal adicionar alguns produtos deliciosos ao seu pedido?
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 space-y-6">
              {state.items.map((item) => (
                <div
                  key={item.product.id}
                  className="card-elegant p-5"
                >
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl shadow-card overflow-hidden">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-gray-800 mb-1 truncate">
                        {item.product.name}
                      </h3>
                      <p className="gradient-text font-bold text-lg">
                        R$ {item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Observação */}
                  <div className="mt-4">
                    {editingObservation === item.product.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={observationText}
                          onChange={(e) => setObservationText(e.target.value)}
                          placeholder="Adicione uma observação (opcional)"
                          className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={2}
                        />
                        <div className="flex space-x-3">
                          <button
                            onClick={() =>
                              updateObservation(
                                item.product.id,
                                observationText
                              )
                            }
                            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 transition-colors font-medium"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelEditingObservation}
                            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200 transition-colors font-medium"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {item.observation ? (
                            <div className="text-sm text-gray-600 bg-primary-50 p-3 rounded-lg border border-primary-100">
                              <span className="font-semibold text-primary-700">💬 Observação:</span>{" "}
                              <span className="text-gray-700">{item.observation}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              Clique para adicionar observação
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            startEditingObservation(
                              item.product.id,
                              item.observation
                            )
                          }
                          className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
                          title="Editar observação"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-4 glass-effect px-3 py-2 rounded-xl">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 p-2 rounded-lg transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-xl text-gray-800 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-display font-bold gradient-text">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.quantity}x R$ {item.product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Seleção de Tipo de Entrega */}
              <div className="card-elegant p-5">
                <h3 className="font-display font-bold text-gray-800 mb-4 flex items-center">
                  🚚 Tipo de Entrega
                </h3>
                <div className="space-y-3">
                  <label className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                    state.deliveryType === "entrega" 
                      ? "border-primary-500 bg-primary-50" 
                      : "border-gray-200 hover:border-primary-200 hover:bg-primary-25"
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="entrega"
                      checked={state.deliveryType === "entrega"}
                      onChange={() =>
                        dispatch({
                          type: "SET_DELIVERY_TYPE",
                          payload: "entrega",
                        })
                      }
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <Truck className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        Entrega em Domicílio
                      </div>
                      <div className="text-sm text-gray-600">
                        Taxa de entrega: <span className="font-medium text-primary-600">R$ 2,00</span>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                    state.deliveryType === "retirada" 
                      ? "border-primary-500 bg-primary-50" 
                      : "border-gray-200 hover:border-primary-200 hover:bg-primary-25"
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="retirada"
                      checked={state.deliveryType === "retirada"}
                      onChange={() =>
                        dispatch({
                          type: "SET_DELIVERY_TYPE",
                          payload: "retirada",
                        })
                      }
                      className="w-5 h-5 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="bg-secondary-100 p-2 rounded-lg">
                      <span className="text-2xl">🏪</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        Retirada no Local
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        ✅ Grátis - sem taxa de entrega
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 glass-effect border-t border-primary-100 p-6">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-lg">
                    R$ {state.total.toFixed(2)}
                  </span>
                </div>
                {state.deliveryType === "entrega" && (
                  <div className="flex items-center justify-between text-gray-600">
                    <span>Taxa de Entrega:</span>
                    <span className="font-semibold text-primary-600">
                      R$ {deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-xl font-display font-bold text-gray-800">Total:</span>
                  <span className="text-3xl font-display font-bold gradient-text">
                    R$ {totalWithDelivery.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full btn-primary py-4 text-lg font-semibold shadow-elegant hover:shadow-xl"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>🛒</span>
                  <span>Confirmar Pedido</span>
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
