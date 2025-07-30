import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { CartItem, Product } from "../types";

interface CartState {
  items: CartItem[];
  total: number;
  deliveryType: "entrega" | "retirada";
}

type CartAction =
  | { type: "ADD_ITEM"; payload: Product }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "UPDATE_OBSERVATION"; payload: { id: string; observation: string } }
  | { type: "SET_DELIVERY_TYPE"; payload: "entrega" | "retirada" }
  | { type: "CLEAR_CART" };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          ),
        };
      }

      const newItems = [
        ...state.items,
        { product: action.payload, quantity: 1 },
      ];
      return {
        ...state,
        items: newItems,
        total: newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    }

    case "REMOVE_ITEM": {
      const newItems = state.items.filter(
        (item) => item.product.id !== action.payload
      );
      return {
        ...state,
        items: newItems,
        total: newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.product.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        )
        .filter((item) => item.quantity > 0);

      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    }

    case "UPDATE_OBSERVATION": {
      const updatedItems = state.items.map((item) =>
        item.product.id === action.payload.id
          ? { ...item, observation: action.payload.observation }
          : item
      );
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    }

    case "SET_DELIVERY_TYPE":
      return {
        ...state,
        deliveryType: action.payload,
      };

    case "CLEAR_CART":
      return { items: [], total: 0, deliveryType: "entrega" };

    default:
      return state;
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    deliveryType: "entrega",
  });

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
