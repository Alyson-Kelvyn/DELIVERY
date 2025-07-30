import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  CreditCard,
  Banknote,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { Customer, Order } from "../types";
import { sendOrderToWhatsApp } from "../utils/whatsapp";
import { supabase } from "../lib/supabase";
import { CartItem, Product } from "../types";

interface OrderFormProps {
  onBack: () => void;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onBack, onClose }) => {
  const { state, dispatch } = useCart();
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    deliveryType: state.deliveryType,
    street: "",
    number: "",
    neighborhood: "",
    paymentMethod: "cartao",
    deliveryFee: state.deliveryType === "entrega" ? 2 : 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // Função para validar se todos os campos obrigatórios estão preenchidos
  const isFormValid = () => {
    const baseValidation =
      customer.name.trim() !== "" &&
      customer.phone.trim() !== "" &&
      (customer.paymentMethod !== "dinheiro" || customer.changeFor);

    if (customer.deliveryType === "entrega") {
      return (
        baseValidation &&
        customer.street?.trim() !== "" &&
        customer.number?.trim() !== "" &&
        customer.neighborhood?.trim() !== ""
      );
    }

    return baseValidation;
  };

  const handleFinalizeClick = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setShowOrderSummary(true);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);

    // Aplica máscara: (XX) XXXXX-XXXX
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(
        2,
        7
      )}-${limitedNumbers.slice(7)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCustomer({ ...customer, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (customer.paymentMethod === "dinheiro" && !customer.changeFor) {
      alert("Por favor, informe o valor para troco.");
      return;
    }

    // Verificar disponibilidade de estoque
    const stockCheck = checkStockAvailability(state.items);
    if (!stockCheck.available) {
      alert(stockCheck.message);
      return;
    }

    setIsSubmitting(true);

    try {
      // Construir endereço completo para compatibilidade (apenas para entrega)
      const fullAddress =
        customer.deliveryType === "entrega"
          ? `${customer.street}, ${customer.number} - ${customer.neighborhood}`
          : "";

      const totalWithDelivery = state.total + (customer.deliveryFee || 0);

      const order: Order = {
        id: crypto.randomUUID(),
        customer: {
          ...customer,
          address: fullAddress, // Manter compatibilidade com o tipo Order
        },
        items: state.items,
        total: totalWithDelivery,
        deliveryFee: customer.deliveryFee || 0,
        status: "pendente",
        created_at: new Date().toISOString(),
      };

      // Save order to Supabase
      const { error } = await supabase.from("orders").insert([
        {
          id: order.id,
          customer_data: order.customer,
          items: order.items,
          total: order.total,
          status: order.status,
          created_at: order.created_at,
        },
      ]);

      if (error) {
        console.error("Error saving order:", error);
      }

      // Send to WhatsApp
      sendOrderToWhatsApp(order);

      // Reduce stock
      await reduceStock(state.items);

      // Clear cart
      dispatch({ type: "CLEAR_CART" });

      setOrderSuccess(true);
    } catch (error) {
      console.error("Error processing order:", error);
      alert("Erro ao processar pedido. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const reduceStock = async (items: CartItem[]) => {
    try {
      console.log("🔄 Reduzindo estoque dos produtos...");

      // Agrupar itens por produto para calcular quantidade total
      const stockUpdates = items.reduce((acc, item) => {
        const productId = item.product.id;
        if (acc[productId]) {
          acc[productId].quantity += item.quantity;
        } else {
          acc[productId] = {
            product: item.product,
            quantity: item.quantity,
          };
        }
        return acc;
      }, {} as Record<string, { product: Product; quantity: number }>);

      // Atualizar estoque para cada produto
      for (const productId in stockUpdates) {
        const { product, quantity } = stockUpdates[productId];

        // Só reduzir estoque se o produto tem controle de estoque
        if (product.stock !== null && product.stock !== undefined) {
          const newStock = Math.max(0, product.stock - quantity);

          console.log(
            `📦 ${product.name}: ${product.stock} → ${newStock} (${quantity} vendidos)`
          );

          const { error } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", productId);

          if (error) {
            console.error(
              `❌ Erro ao atualizar estoque de "${product.name}":`,
              error
            );
          } else {
            console.log(
              `✅ Estoque de "${product.name}" atualizado com sucesso`
            );
          }
        } else {
          console.log(`ℹ️ "${product.name}" não tem controle de estoque`);
        }
      }

      console.log("✅ Redução de estoque concluída!");
    } catch (error) {
      console.error("❌ Erro ao reduzir estoque:", error);
    }
  };

  const checkStockAvailability = (
    items: CartItem[]
  ): { available: boolean; message?: string } => {
    for (const item of items) {
      const product = item.product;

      // Verificar se o produto tem controle de estoque
      if (product.stock !== null && product.stock !== undefined) {
        // Verificar se há estoque suficiente
        if (product.stock < item.quantity) {
          return {
            available: false,
            message: `Produto "${product.name}" não tem estoque suficiente. Disponível: ${product.stock}, Solicitado: ${item.quantity}`,
          };
        }
      }
    }

    return { available: true };
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-sm w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Pedido Realizado!
          </h2>
          <p className="text-gray-600 mb-6">
            Seu pedido foi enviado para o WhatsApp da churrascaria. Em breve
            entraremos em contato para confirmar a{" "}
            {customer.deliveryType === "entrega" ? "entrega" : "retirada"}!
          </p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white w-full h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-3"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Finalizar Pedido</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4" />
                <span>Nome Completo *</span>
              </label>
              <input
                type="text"
                required
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Seu nome completo"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                <Phone className="h-4 w-4" />
                <span>Telefone *</span>
              </label>
              <input
                type="tel"
                required
                value={customer.phone}
                onChange={handlePhoneChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="(85) 99999-9999"
                maxLength={15}
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite apenas números (DDD + 9 dígitos)
              </p>
            </div>

            {/* Informação do Tipo de Entrega Selecionado */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {customer.deliveryType === "entrega" ? (
                  <>
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <Truck className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">
                        Entrega em Domicílio
                      </span>
                      <p className="text-sm text-gray-600">
                        Taxa de entrega: R$ 2,00 - Entrega em até 30 minutos
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-lg">🏪</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">
                        Retirada no Local
                      </span>
                      <p className="text-sm text-gray-600">
                        Sem taxa de entrega - Retire em 15 minutos
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {customer.deliveryType === "entrega" && (
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>Endereço de Entrega *</span>
                </label>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.street}
                      onChange={(e) =>
                        setCustomer({ ...customer, street: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Nome da rua"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.number}
                        onChange={(e) =>
                          setCustomer({ ...customer, number: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.neighborhood}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            neighborhood: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Centro"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Forma de Pagamento *
              </label>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cartao"
                    checked={customer.paymentMethod === "cartao"}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="text-red-600"
                  />
                  <CreditCard className="h-5 w-5 text-gray-600" />
                  <span>Cartão (Débito/Crédito)</span>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    checked={customer.paymentMethod === "pix"}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="text-red-600"
                  />
                  <Banknote className="h-5 w-5 text-gray-600" />
                  <span>PIX</span>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="dinheiro"
                    checked={customer.paymentMethod === "dinheiro"}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        paymentMethod: e.target.value as any,
                      })
                    }
                    className="text-red-600"
                  />
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <span>Dinheiro</span>
                </label>
              </div>
            </div>

            {customer.paymentMethod === "dinheiro" && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Troco para quanto? *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={state.total}
                  required
                  value={customer.changeFor || ""}
                  onChange={(e) =>
                    setCustomer({
                      ...customer,
                      changeFor: parseFloat(e.target.value),
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleFinalizeClick}
            disabled={!isFormValid()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-lg font-semibold transition-colors"
          >
            Finalizar Pedido
          </button>

          {showOrderSummary && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                      Confirmar Pedido
                    </h2>
                    <button
                      onClick={() => setShowOrderSummary(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
                      📋 Resumo do Pedido
                    </h3>

                    {/* Informações do Cliente */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        👤 Dados do Cliente
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nome:</span>
                          <span className="font-medium">
                            {customer.name || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Telefone:</span>
                          <span className="font-medium">
                            {customer.phone || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Tipo de Entrega:
                          </span>
                          <span className="font-medium">
                            {customer.deliveryType === "entrega"
                              ? "🚚 Entrega"
                              : "🏪 Retirada"}
                          </span>
                        </div>
                        {customer.deliveryType === "entrega" && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Endereço:</span>
                            <span className="font-medium text-right">
                              {customer.street &&
                              customer.number &&
                              customer.neighborhood
                                ? `${customer.street}, ${customer.number} - ${customer.neighborhood}`
                                : "—"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Forma de Pagamento */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        💳 Forma de Pagamento
                      </h4>
                      <div className="flex items-center gap-2">
                        {customer.paymentMethod === "pix" && (
                          <span className="text-green-600">💚</span>
                        )}
                        {customer.paymentMethod === "dinheiro" && (
                          <span className="text-yellow-600">💵</span>
                        )}
                        {customer.paymentMethod === "cartao" && (
                          <span className="text-blue-600">💳</span>
                        )}
                        <span className="font-medium capitalize">
                          {customer.paymentMethod === "pix"
                            ? "PIX"
                            : customer.paymentMethod === "dinheiro"
                            ? "Dinheiro"
                            : customer.paymentMethod === "cartao"
                            ? "Cartão"
                            : "—"}
                        </span>
                        {customer.paymentMethod === "dinheiro" &&
                          customer.changeFor && (
                            <span className="text-sm text-gray-600 ml-2">
                              (Troco para R$ {customer.changeFor.toFixed(2)})
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Itens do Pedido */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        🍽️ Itens do Pedido
                      </h4>
                      <div className="space-y-3">
                        {state.items.map((item) => (
                          <div
                            key={item.product.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-red-600 text-lg">🍖</span>
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800">
                                  {item.product.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {item.quantity}x R${" "}
                                  {item.product.price.toFixed(2)}
                                </div>
                                {item.observation && (
                                  <div className="text-sm text-gray-500 mt-1 bg-white p-2 rounded border">
                                    <span className="font-medium">
                                      Observação:
                                    </span>{" "}
                                    {item.observation}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-gray-800">
                                R${" "}
                                {(item.product.price * item.quantity).toFixed(
                                  2
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold">
                            R$ {state.total.toFixed(2)}
                          </span>
                        </div>
                        {customer.deliveryType === "entrega" && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Taxa de Entrega:
                            </span>
                            <span className="font-semibold text-red-600">
                              R$ {customer.deliveryFee.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="text-lg font-semibold text-gray-800">
                            Total do Pedido:
                          </span>
                          <span className="text-2xl font-bold text-red-600">
                            R${" "}
                            {(
                              state.total + (customer.deliveryFee || 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Pedido será enviado para o WhatsApp da churrascaria
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowOrderSummary(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                      {isSubmitting ? "Enviando..." : "Confirmar Pedido"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
