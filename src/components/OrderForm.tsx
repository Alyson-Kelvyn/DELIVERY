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

interface OrderFormProps {
  onBack: () => void;
  onClose: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ onBack, onClose }) => {
  const { state, dispatch } = useCart();
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    street: "",
    number: "",
    neighborhood: "",
    paymentMethod: "cartao",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

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

    if (
      !customer.name ||
      !customer.phone ||
      !customer.street ||
      !customer.number ||
      !customer.neighborhood
    ) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (customer.paymentMethod === "dinheiro" && !customer.changeFor) {
      alert("Por favor, informe o valor para troco.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Construir endereço completo para compatibilidade
      const fullAddress = `${customer.street}, ${customer.number} - ${customer.neighborhood}`;

      const order: Order = {
        id: crypto.randomUUID(),
        customer: {
          ...customer,
          address: fullAddress, // Manter compatibilidade com o tipo Order
        },
        items: state.items,
        total: state.total,
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
            entraremos em contato para confirmar a entrega!
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

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">
              Resumo do Pedido
            </h3>
            <div className="space-y-2">
              {state.items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span>
                    R$ {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-3">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-red-600">
                  R$ {state.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-4 rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? "Enviando..." : "Finalizar Pedido"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;
