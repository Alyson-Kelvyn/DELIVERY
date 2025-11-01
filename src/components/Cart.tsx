import React, { useEffect, useRef, useState } from "react";
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

  // Bloquear scroll da página principal enquanto o carrinho estiver aberto
  const scrollYRef = useRef(0);
  useEffect(() => {
    if (!isOpen) return;

    scrollYRef.current = window.scrollY || window.pageYOffset || 0;

    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollYRef.current}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollYRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  if (showOrderForm) {
    return (
      <OrderForm onBack={() => setShowOrderForm(false)} onClose={onClose} />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-stretch justify-center md:justify-end animate-fade-in">
      {/* Painel do carrinho: em mobile ocupa a tela toda; em desktop sidebar à direita */}
      <div className="bg-white w-full md:max-w-md md:h-full h-[100dvh] rounded-none shadow-elegant overflow-y-auto custom-scrollbar animate-in">
  <div className="sticky top-0 z-20 glass-effect bg-white border-b border-primary-100 px-4 py-3 md:p-6 flex items-center justify-between rounded-t-2xl md:rounded-none safe-top">
          <div className="min-w-0">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-800 truncate">Seu Carrinho</h2>
            <p className="text-xs md:text-sm text-gray-600">
              {state.items.length} {state.items.length === 1 ? 'item' : 'itens'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar carrinho"
            className="h-10 w-10 md:h-auto md:w-auto p-2 md:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
          >
            <X className="h-5 w-5 md:h-6 md:w-6" />
          </button>
        </div>

        {state.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 md:py-20 px-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-6 md:p-8 rounded-3xl mb-6">
              <ShoppingBag className="h-16 w-16 md:h-20 md:w-20 text-primary-400 mx-auto" />
            </div>
            <h3 className="text-lg md:text-xl font-display font-semibold text-gray-800 mb-2 text-center">
              Carrinho Vazio
            </h3>
            <p className="text-gray-600 text-center mb-6 text-sm md:text-base">
              Que tal adicionar alguns produtos deliciosos ao seu pedido?
            </p>
            <button
              onClick={onClose}
              className="btn-primary w-full md:w-auto"
            >
              Continuar Comprando
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {state.items.map((item) => (
                <div
                  key={item.product.id}
                  className="card-elegant p-4 md:p-5"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-xl shadow-card overflow-hidden">
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-primary-500 text-white text-[10px] md:text-xs font-bold rounded-full h-5 w-5 md:h-6 md:w-6 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-gray-800 mb-1 truncate text-sm md:text-base">
                        {item.product.name}
                      </h3>
                      <p className="gradient-text font-bold text-base md:text-lg">
                        R$ {item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Observação */}
                  <div className="mt-3 md:mt-4">
                    {editingObservation === item.product.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={observationText}
                          onChange={(e) => setObservationText(e.target.value)}
                          placeholder="Adicione uma observação (opcional)"
                          className="w-full p-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={2}
                        />
                        <div className="flex gap-2 md:space-x-3">
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
                      <div className="flex items-start justify-between gap-2 md:gap-3">
                        <div className="flex-1 min-w-0">
                          {item.observation ? (
                            <div className="text-xs md:text-sm text-gray-600 bg-primary-50 p-3 rounded-lg border border-primary-100">
                              <span className="font-semibold text-primary-700">💬 Observação:</span>{" "}
                              <span className="text-gray-700">{item.observation}</span>
                            </div>
                          ) : (
                            <span className="text-xs md:text-sm text-gray-400 italic">
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
                    <div className="flex items-center gap-3 md:space-x-4 glass-effect px-2 md:px-3 py-2 rounded-xl">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="bg-secondary-100 hover:bg-secondary-200 text-secondary-800 h-10 w-10 md:h-auto md:w-auto p-2 rounded-lg transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-lg md:text-xl text-gray-800 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="bg-primary-500 hover:bg-primary-600 text-white h-10 w-10 md:h-auto md:w-auto p-2 rounded-lg transition-colors shadow-md hover:shadow-lg"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="text-xl md:text-2xl font-display font-bold gradient-text">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500">
                        {item.quantity}x R$ {item.product.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Seleção de Tipo de Entrega */}
              <div className="card-elegant p-4 md:p-5">
                <h3 className="font-display font-bold text-gray-800 mb-3 md:mb-4 flex items-center">
                  🚚 Tipo de Entrega
                </h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 md:space-x-4 p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
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
                    <div className="bg-primary-100 p-2 rounded-lg shrink-0">
                      <Truck className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm md:text-base">
                        Entrega em Domicílio
                      </div>
                      <div className="text-xs md:text-sm text-gray-600">
                        Taxa de entrega: <span className="font-medium text-primary-600">R$ 2,00</span>
                      </div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-3 md:space-x-4 p-3 md:p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
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
                    <div className="bg-secondary-100 p-2 rounded-lg shrink-0">
                      <span className="text-xl md:text-2xl">🏪</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 text-sm md:text-base">
                        Retirada no Local
                      </div>
                      <div className="text-xs md:text-sm text-green-600 font-medium">
                        ✅ Grátis - sem taxa de entrega
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 z-20 glass-effect bg-white border-t border-primary-100 px-4 py-3 md:p-6 safe-bottom">
              <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                <div className="flex items-center justify-between text-gray-600 text-sm md:text-base">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-base md:text-lg">
                    R$ {state.total.toFixed(2)}
                  </span>
                </div>
                {state.deliveryType === "entrega" && (
                  <div className="flex items-center justify-between text-gray-600 text-sm md:text-base">
                    <span>Taxa de Entrega:</span>
                    <span className="font-semibold text-primary-600">
                      R$ {deliveryFee.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-lg md:text-xl font-display font-bold text-gray-800">Total:</span>
                  <span className="text-2xl md:text-3xl font-display font-bold gradient-text">
                    R$ {totalWithDelivery.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowOrderForm(true)}
                className="w-full btn-primary py-3 md:py-4 text-base md:text-lg font-semibold shadow-elegant hover:shadow-xl"
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
