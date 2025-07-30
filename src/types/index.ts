export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  available: boolean;
  stock?: number; // Quantidade em estoque (opcional)
  category: "marmitas" | "bebidas" | "sobremesas" | "acompanhamentos";
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  observation?: string; // Observação opcional para o produto
}

export interface Customer {
  name: string;
  phone: string;
  street: string;
  number: string;
  neighborhood: string;
  paymentMethod: "cartao" | "pix" | "dinheiro";
  changeFor?: number;
  deliveryFee?: number; // Taxa de entrega (frete)
}

export interface Order {
  id: string;
  customer: Customer & { address: string };
  items: CartItem[];
  total: number;
  deliveryFee?: number; // Taxa de entrega
  status: "pendente" | "confirmado" | "entregue";
  created_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
