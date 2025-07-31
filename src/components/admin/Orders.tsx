import React, { useState, useEffect } from "react";
import { CheckCircle, Clock, Truck, Calendar, X } from "lucide-react";
import { Order } from "../../types";
import { supabase } from "../../lib/supabase";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "pendente" | "confirmado" | "entregue" | "cancelado"
  >("todos");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  useEffect(() => {
    fetchTodayOrders();
  }, []);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".filter-dropdown")) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filtrar pedidos baseado no status selecionado
  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "todos") return true;
    return order.status === statusFilter;
  });

  const fetchTodayOrders = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", startOfDay)
        .order("created_at", { ascending: false }); // Ordenar por mais recentes primeiro (mais antigos embaixo)

      if (error) {
        console.error("Error fetching orders:", error);
        // Demo data
        setOrders([
          {
            id: "1",
            customer: {
              name: "João Silva",
              phone: "(85) 99999-9999",
              address: "Rua das Flores, 123 - Centro",
              paymentMethod: "pix",
              deliveryType: "entrega",
            },
            items: [
              {
                product: {
                  id: "1",
                  name: "Marmita de Picanha",
                  description: "",
                  price: 18.9,
                  image_url: "",
                  available: true,
                  created_at: "",
                  category: "marmitas",
                },
                quantity: 2,
              },
            ],
            total: 37.8,
            status: "pendente",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            customer: {
              name: "Maria Santos",
              phone: "(85) 88888-8888",
              address: "Av. Principal, 456 - Bairro Novo",
              paymentMethod: "dinheiro",
              changeFor: 50,
              deliveryType: "entrega",
            },
            items: [
              {
                product: {
                  id: "2",
                  name: "Marmita de Costela",
                  description: "",
                  price: 19.9,
                  image_url: "",
                  available: true,
                  created_at: "",
                  category: "marmitas",
                },
                quantity: 1,
              },
            ],
            total: 19.9,
            status: "confirmado",
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
        ]);
      } else {
        setOrders(
          data?.map((order) => ({
            id: order.id,
            customer: order.customer_data,
            items: order.items,
            total: order.total,
            status: order.status,
            created_at: order.created_at,
          })) || []
        );
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar o endereço
  const formatAddress = (address: string | undefined) => {
    if (!address) return { street: "", number: "", neighborhood: "" };
    const parts = address.split(", ");
    if (parts.length >= 2) {
      const street = parts[0];
      const numberAndNeighborhood = parts[1];

      // Separar número e bairro se possível
      const numberNeighborhoodParts = numberAndNeighborhood.split(" - ");
      const number = numberNeighborhoodParts[0] || "";
      const neighborhood = numberNeighborhoodParts[1] || "";

      return {
        street,
        number,
        neighborhood: neighborhood || numberAndNeighborhood,
      };
    }

    // Fallback se não conseguir separar
    return {
      street: address,
      number: "",
      neighborhood: "",
    };
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: Order["status"]
  ) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
      }

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "confirmado":
        return "bg-blue-100 text-blue-800";
      case "entregue":
        return "bg-green-100 text-green-800";
      case "cancelado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />;
      case "confirmado":
        return <CheckCircle className="h-4 w-4" />;
      case "entregue":
        return <Truck className="h-4 w-4" />;
      case "cancelado":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-40"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-center space-x-3 mb-6">
        <Calendar className="h-6 w-6 text-gray-600" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Pedidos do Dia</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Filtros de Status */}
      <div className="flex justify-center mb-6">
        <div className="relative filter-dropdown w-80">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="w-full px-8 py-4 rounded-lg text-base font-semibold transition-all duration-200 flex items-center justify-center gap-3 bg-white shadow-lg border border-gray-200 hover:bg-gray-50"
          >
            <span className="text-lg">
              {statusFilter === "todos" && "📋"}
              {statusFilter === "pendente" && "⏳"}
              {statusFilter === "confirmado" && "✅"}
              {statusFilter === "entregue" && "🚚"}
              {statusFilter === "cancelado" && "❌"}
            </span>
            {statusFilter === "todos" && `Todos (${orders.length})`}
            {statusFilter === "pendente" &&
              `Pendentes (${
                orders.filter((o) => o.status === "pendente").length
              })`}
            {statusFilter === "confirmado" &&
              `Confirmados (${
                orders.filter((o) => o.status === "confirmado").length
              })`}
            {statusFilter === "entregue" &&
              `Entregues (${
                orders.filter((o) => o.status === "entregue").length
              })`}
            {statusFilter === "cancelado" &&
              `Cancelados (${
                orders.filter((o) => o.status === "cancelado").length
              })`}
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showFilterDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <div className="py-3">
                <button
                  onClick={() => {
                    setStatusFilter("todos");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-base"
                >
                  <span className="text-xl">📋</span>
                  Todos ({orders.length})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("pendente");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-base"
                >
                  <span className="text-xl">⏳</span>
                  Pendentes (
                  {orders.filter((o) => o.status === "pendente").length})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("confirmado");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-base"
                >
                  <span className="text-xl">✅</span>
                  Confirmados (
                  {orders.filter((o) => o.status === "confirmado").length})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("entregue");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-base"
                >
                  <span className="text-xl">🚚</span>
                  Entregues (
                  {orders.filter((o) => o.status === "entregue").length})
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("cancelado");
                    setShowFilterDropdown(false);
                  }}
                  className="w-full px-6 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-base"
                >
                  <span className="text-xl">❌</span>
                  Cancelados (
                  {orders.filter((o) => o.status === "cancelado").length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {statusFilter === "todos"
              ? "Nenhum pedido hoje"
              : `Nenhum pedido ${
                  statusFilter === "pendente"
                    ? "pendente"
                    : statusFilter === "confirmado"
                    ? "confirmado"
                    : statusFilter === "entregue"
                    ? "entregue"
                    : "cancelado"
                } hoje`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Coluna principal */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                        #{orders.length - index}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="capitalize">{order.status}</span>
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                      <Clock className="h-4 w-4" />
                      {new Date(order.created_at).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cliente */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                        <span>👤</span> Cliente
                      </h3>
                      <div className="text-gray-700 text-base font-medium">
                        {order.customer.name}
                      </div>
                      <div className="text-gray-500 text-sm">
                        {order.customer.phone}
                      </div>
                      <div className="text-gray-500 text-sm space-y-1">
                        {(() => {
                          const address = formatAddress(order.customer.address);
                          return (
                            <>
                              <div className="flex items-center gap-1">
                                <span>📍</span>{" "}
                                <span className="font-medium">Rua:</span>{" "}
                                {address.street}
                              </div>
                              {address.number && (
                                <div className="flex items-center gap-1 ml-4">
                                  <span className="font-medium">Nº:</span>{" "}
                                  {address.number}
                                </div>
                              )}
                              {address.neighborhood && (
                                <div className="flex items-center gap-1 ml-4">
                                  <span className="font-medium">Bairro:</span>{" "}
                                  {address.neighborhood}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    {/* Pagamento */}
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                        <span>💳</span> Pagamento
                      </h3>
                      <div className="text-gray-700 capitalize font-medium">
                        {order.customer.paymentMethod === "pix" && (
                          <span className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded mr-1">
                            PIX
                          </span>
                        )}
                        {order.customer.paymentMethod === "dinheiro" && (
                          <span className="inline-block bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded mr-1">
                            Dinheiro
                          </span>
                        )}
                        {order.customer.paymentMethod !== "pix" &&
                          order.customer.paymentMethod !== "dinheiro" && (
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded mr-1">
                              {order.customer.paymentMethod}
                            </span>
                          )}
                      </div>
                      {order.customer.paymentMethod === "dinheiro" &&
                        order.customer.changeFor && (
                          <div className="text-gray-500 text-sm mt-1">
                            Troco para{" "}
                            <span className="font-semibold">
                              R$ {order.customer.changeFor.toFixed(2)}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="my-4 border-t border-dashed border-gray-200" />

                  {/* Itens do pedido */}
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      <span>🍽️</span> Itens
                    </h3>
                    <div className="divide-y divide-gray-100">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between py-1 text-sm"
                        >
                          <span>
                            {item.quantity}x {item.product.name}
                          </span>
                          <span className="text-gray-700">
                            R$ {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-2">
                      <span className="text-base font-bold text-red-600">
                        Total: R$ {order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Coluna de ações/status */}
                <div className="flex flex-row md:flex-col gap-2 md:items-end md:justify-between min-w-[140px]">
                  {order.status === "pendente" && (
                    <>
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "confirmado")
                        }
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "cancelado")}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {order.status === "confirmado" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, "entregue")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-colors"
                      >
                        Entregar
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "cancelado")}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-colors"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  {order.status === "entregue" && (
                    <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                      ✅ Entregue
                    </span>
                  )}
                  {order.status === "cancelado" && (
                    <span className="text-red-600 font-semibold text-sm flex items-center gap-1">
                      ❌ Cancelado
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
