import { Order } from "../types";

export const sendOrderToWhatsApp = (order: Order) => {
  const phoneNumber = "5585994015283";

  // Formatar data e hora
  const orderDate = new Date(order.created_at);
  const formattedDate = orderDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = orderDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Construir endereço formatado
  const addressParts = order.customer.address.split(", ");
  const street = addressParts[0] || "";
  const numberAndNeighborhood = addressParts[1] || "";

  let message = `🔥 *NOVO PEDIDO - CHURRASCARIA* 🔥\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Informações do cliente
  message += `👤 *INFORMAÇÕES DO CLIENTE*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📋 *Nome:* ${order.customer.name}\n`;
  message += `📱 *Telefone:* ${order.customer.phone}\n`;
  message += `📍 *Endereço:*\n`;
  message += `   Rua: ${street}\n`;
  message += `   ${numberAndNeighborhood}\n\n`;

  // Informações de pagamento
  message += `💳 *FORMA DE PAGAMENTO*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  const paymentMethod = order.customer.paymentMethod;
  const paymentEmoji =
    paymentMethod === "pix" ? "💚" : paymentMethod === "dinheiro" ? "💵" : "💳";
  const paymentText =
    paymentMethod === "pix"
      ? "PIX"
      : paymentMethod === "dinheiro"
      ? "DINHEIRO"
      : "CARTÃO";

  message += `${paymentEmoji} *${paymentText}*\n`;

  if (paymentMethod === "dinheiro" && order.customer.changeFor) {
    message += `💰 *Troco para:* R$ ${order.customer.changeFor.toFixed(2)}\n`;
  }
  message += `\n`;

  // Itens do pedido
  message += `🍽️ *ITENS DO PEDIDO*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;

  order.items.forEach((item, index) => {
    const itemTotal = (item.product.price * item.quantity).toFixed(2);
    message += `${index + 1}. ${item.quantity}x ${item.product.name}\n`;
    message += `   💰 R$ ${itemTotal}\n\n`;
  });

  // Total e informações do pedido
  message += `💰 *RESUMO DO PEDIDO*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📦 *Quantidade de itens:* ${order.items.length}\n`;
  message += `💵 *Total:* R$ ${order.total.toFixed(2)}\n`;
  message += `📅 *Data:* ${formattedDate}\n`;
  message += `⏰ *Hora:* ${formattedTime}\n\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `🎯 *ID do Pedido:* ${order.id.slice(0, 8).toUpperCase()}\n`;
  message += `📊 *Status:* ⏳ Pendente\n\n`;

  message += `✅ *Pedido recebido com sucesso!*\n`;
  message += `📞 Entraremos em contato em breve para confirmar a entrega.`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};
