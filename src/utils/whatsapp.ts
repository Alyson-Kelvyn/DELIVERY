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

  // Construir endereço formatado (apenas para entrega)
  const addressParts = order.customer.address?.split(", ") || [];
  const street = addressParts[0] || "";
  const numberAndNeighborhood = addressParts[1] || "";

  let message = `🔥 *NOVO PEDIDO - CHURRASCARIA* 🔥\n`;

  // Informações do cliente
  message += `👤 *INFORMAÇÕES DO CLIENTE*\n`;
  message += `📋 *Nome:* ${order.customer.name}\n`;
  message += `📱 *Telefone:* ${order.customer.phone}\n`;

  // Informações de endereço (apenas para entrega)
  if (order.customer.deliveryType === "entrega") {
    message += `📍 *Endereço:*\n`;
    message += `   🏠 *Rua:* ${street}\n`;
    message += `   🏢 *Número:* ${
      numberAndNeighborhood.split(" - ")[0] || ""
    }\n`;
    message += `   🏘️ *Bairro:* ${
      numberAndNeighborhood.split(" - ")[1] || numberAndNeighborhood
    }\n`;
  } else {
    message += `🏪 *Tipo:* Retirada no Local\n`;
  }
  message += `\n`;

  // Informações de pagamento e entrega
  message += `💳 *FORMA DE PAGAMENTO*\n`;
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

  // Informações de entrega
  message += `🚚 *TIPO DE ENTREGA*\n`;
  if (order.customer.deliveryType === "entrega") {
    message += `🏠 *Entrega em Domicílio*\n`;
    message += `💰 *Taxa de entrega:* R$ ${
      order.deliveryFee?.toFixed(2) || "2.00"
    }\n`;
    message += `⏰ *Prazo:* Até 30 minutos\n`;
  } else {
    message += `🏪 *Retirada no Local*\n`;
  }
  message += `\n`;

  // Itens do pedido
  message += `🍽️ *ITENS DO PEDIDO*\n`;
  order.items.forEach((item, index) => {
    const itemTotal = (item.product.price * item.quantity).toFixed(2);
    message += `${index + 1}. ${item.quantity}x ${item.product.name}\n`;
    message += `   💰 R$ ${itemTotal}\n`;
    if (item.observation) {
      message += `   📝 *Observação:* ${item.observation}\n`;
    }
    message += `\n`;
  });

  message += `✅ *Pedido recebido com sucesso!*`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  window.open(whatsappUrl, "_blank");
};
