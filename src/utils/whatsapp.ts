import { Order } from '../types';

export const sendOrderToWhatsApp = (order: Order) => {
  const phoneNumber = '5585994015283';
  
  let message = `🍖 *NOVO PEDIDO - CHURRASCARIA*\n\n`;
  message += `👤 *Cliente:* ${order.customer.name}\n`;
  message += `📱 *Telefone:* ${order.customer.phone}\n`;
  message += `📍 *Endereço:* ${order.customer.address}\n`;
  message += `💳 *Pagamento:* ${order.customer.paymentMethod.toUpperCase()}`;
  
  if (order.customer.paymentMethod === 'dinheiro' && order.customer.changeFor) {
    message += ` - Troco para R$ ${order.customer.changeFor.toFixed(2)}`;
  }
  
  message += `\n\n🍽️ *ITENS DO PEDIDO:*\n`;
  
  order.items.forEach(item => {
    message += `• ${item.quantity}x ${item.product.name} - R$ ${(item.product.price * item.quantity).toFixed(2)}\n`;
  });
  
  message += `\n💰 *TOTAL: R$ ${order.total.toFixed(2)}*\n`;
  message += `⏰ *Pedido feito em:* ${new Date(order.created_at).toLocaleString('pt-BR')}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};