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

  // Taxa de entrega fixa de R$ 2,00
  const deliveryFee = 2;
  const totalWithDelivery = state.total + deliveryFee;

  if (!isOpen) return null;

  if (showOrderForm) {
    return (
      <OrderForm onBack={() => setShowOrderForm(false)} onClose={onClose} />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Seu Carrinho</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">Seu carrinho está vazio</p>
            <p className="text-gray-400 text-sm text-center mt-2">
              Adicione alguns produtos deliciosos!
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 space-y-4">
              {state.items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-gray-50 rounded-lg p-4"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-24 object-contain rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">
                        {item.product.name}
                      </h3>
                      <p className="text-red-600 font-bold">
                        R$ {item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Observação */}
                  <div className="mt-3">
                    {editingObservation === item.product.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={observationText}
                          onChange={(e) => setObservationText(e.target.value)}
                          placeholder="Adicione uma observação (opcional)"
                          className="w-full p-2 border border-gray-300 rounded-md text-sm resize-none"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              updateObservation(
                                item.product.id,
                                observationText
                              )
                            }
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={cancelEditingObservation}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {item.observation ? (
                            <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                              <span className="font-medium">Observação:</span>{" "}
                              {item.observation}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">
                              Nenhuma observação
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
                          className="ml-2 p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Editar observação"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="bg-gray-200 hover:bg-gray-300 p-1 rounded-full transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-full transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-800">
                      R$ {(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Taxa de Entrega Fixa */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-gray-600" />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Taxa de Entrega
                      </h3>
                    </div>
                  </div>
                  <span className="text-red-600 font-bold">R$ 2,00</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">
                    R$ {state.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Taxa de Entrega:</span>
                  <span className="font-semibold text-red-600">
                    R$ {deliveryFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-red-600">
                    R$ {totalWithDelivery.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
              >
                Confirmar Pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
