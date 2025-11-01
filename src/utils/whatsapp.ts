import { Order } from "../types";

// Envia o pedido completo para o WhatsApp da churrascaria (canal interno)
export const sendOrderToWhatsApp = (order: Order) => {
  const phoneNumber = "5585994015283";

  // Dados básicos (se precisar usar no futuro, como data/hora)

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

// Utilitário: normaliza um telefone brasileiro para o formato E.164 com DDI 55
const normalizeBrazilPhone = (phone: string) => {
  // Remove tudo que não é dígito
  let digits = (phone || "").replace(/\D/g, "");

  // Se já começa com 55, mantém. Caso contrário, adiciona 55
  if (!digits.startsWith("55")) {
    digits = `55${digits}`;
  }
  return digits;
};

// Envia uma mensagem simples de texto para o WhatsApp do cliente
export const sendMessageToCustomerWhatsApp = (
  customerPhone: string,
  message: string
) => {
  const phone = normalizeBrazilPhone(customerPhone);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
  window.open(whatsappUrl, "_blank");
};

// Mensagens automáticas para o cliente durante o fluxo do pedido
export const sendOrderConfirmedToCustomer = (order: Order) => {
  const name = order.customer.name?.split(" ")[0] || "cliente";
  const message = `Olá, ${name}! 👋\n\nSeu pedido na Churrascaria foi *confirmado* e já está *em preparo*. 🔥\n\nQualquer novidade avisamos por aqui. Obrigado pela preferência!`;
  sendMessageToCustomerWhatsApp(order.customer.phone, message);
};

export const sendOrderReadyToCustomer = (order: Order) => {
  const name = order.customer.name?.split(" ")[0] || "cliente";
  const isEntrega = order.customer.deliveryType === "entrega";
  const message = isEntrega
    ? `Olá, ${name}! 🚚\n\nSeu pedido *saiu para a entrega*. Está a caminho!\n\nQualquer dúvida, pode falar com a gente por aqui.`
    : `Olá, ${name}! 🎉\n\nSeu pedido está *pronto para retirada*.\n\nEstamos te aguardando. Qualquer dúvida, fale com a gente aqui pelo WhatsApp.`;
  sendMessageToCustomerWhatsApp(order.customer.phone, message);
};
