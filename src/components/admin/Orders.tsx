import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Truck, Calendar } from 'lucide-react';
import { Order } from '../../types';
import { supabase } from '../../lib/supabase';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayOrders();
  }, []);

  const fetchTodayOrders = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startOfDay)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        // Demo data
        setOrders([
          {
            id: '1',
            customer: {
              name: 'João Silva',
              phone: '(85) 99999-9999',
              address: 'Rua das Flores, 123 - Centro',
              paymentMethod: 'pix'
            },
            items: [
              {
                product: {
                  id: '1',
                  name: 'Marmita de Picanha',
                  description: '',
                  price: 18.90,
                  image_url: '',
                  available: true,
                  created_at: ''
                },
                quantity: 2
              }
            ],
            total: 37.80,
            status: 'pendente',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            customer: {
              name: 'Maria Santos',
              phone: '(85) 88888-8888',
              address: 'Av. Principal, 456 - Bairro Novo',
              paymentMethod: 'dinheiro',
              changeFor: 50
            },
            items: [
              {
                product: {
                  id: '2',
                  name: 'Marmita de Costela',
                  description: '',
                  price: 19.90,
                  image_url: '',
                  available: true,
                  created_at: ''
                },
                quantity: 1
              }
            ],
            total: 19.90,
            status: 'confirmado',
            created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
          }
        ]);
      } else {
        setOrders(data?.map(order => ({
          id: order.id,
          customer: order.customer_data,
          items: order.items,
          total: order.total,
          status: order.status,
          created_at: order.created_at
        })) || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'confirmado': return 'bg-blue-100 text-blue-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pendente': return <Clock className="h-4 w-4" />;
      case 'confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'entregue': return <Truck className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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
      <div className="flex items-center space-x-3 mb-6">
        <Calendar className="h-6 w-6 text-gray-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Pedidos do Dia</h1>
          <p className="text-gray-600">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum pedido hoje</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </span>
                    <span className="text-gray-500 text-sm">
                      {new Date(order.created_at).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Cliente</h3>
                      <p className="text-gray-600">{order.customer.name}</p>
                      <p className="text-gray-600">{order.customer.phone}</p>
                      <p className="text-gray-600 text-sm">{order.customer.address}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Pagamento</h3>
                      <p className="text-gray-600 capitalize">{order.customer.paymentMethod}</p>
                      {order.customer.paymentMethod === 'dinheiro' && order.customer.changeFor && (
                        <p className="text-gray-600 text-sm">
                          Troco para R$ {order.customer.changeFor.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 mb-2">Itens</h3>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.product.name}</span>
                          <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span className="text-red-600">R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col gap-2">
                  {order.status === 'pendente' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'confirmado')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Confirmar
                    </button>
                  )}
                  {order.status === 'confirmado' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'entregue')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Entregar
                    </button>
                  )}
                  {order.status === 'entregue' && (
                    <span className="text-green-600 font-medium text-sm">✅ Entregue</span>
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