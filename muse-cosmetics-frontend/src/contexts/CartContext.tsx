import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartItem } from "../types";
import api from "../utils/api";
import { message } from "antd";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Load cart on component mount
  const refreshCart = useCallback(async () => {
    // Only load cart if user is authenticated
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get("/cart");
      setItems(response.data.data || []);
    } catch (error: any) {
      console.error("Error loading cart:", error);
      // Don't show error message for cart loading as it might be empty
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only refresh cart when auth loading is complete
    if (!authLoading) {
      refreshCart();
    }
  }, [refreshCart, authLoading]);

  const addToCart = useCallback(
    async (productId: number, quantity: number = 1) => {
      if (!isAuthenticated) {
        message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        return;
      }

      try {
        setIsLoading(true);
        await api.post("/cart/add", {
          product_id: productId,
          quantity,
        });

        await refreshCart();
        message.success("Đã thêm sản phẩm vào giỏ hàng!");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng";
        message.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart, isAuthenticated]
  );

  const removeFromCart = useCallback(
    async (itemId: number) => {
      if (!isAuthenticated) {
        message.warning("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      try {
        setIsLoading(true);
        await api.delete(`/cart/remove/${itemId}`);

        await refreshCart();
        message.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể xóa sản phẩm";
        message.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart, isAuthenticated]
  );

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (!isAuthenticated) {
        message.warning("Vui lòng đăng nhập để thực hiện thao tác này");
        return;
      }

      if (quantity <= 0) {
        await removeFromCart(itemId);
        return;
      }

      try {
        setIsLoading(true);
        await api.put(`/cart/update/${itemId}`, {
          quantity,
        });

        await refreshCart();
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Không thể cập nhật số lượng";
        message.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [refreshCart, removeFromCart, isAuthenticated]
  );

  const clearCart = useCallback(async () => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để thực hiện thao tác này");
      return;
    }

    try {
      setIsLoading(true);
      await api.delete("/cart/clear");

      setItems([]);
      message.success("Đã xóa tất cả sản phẩm trong giỏ hàng!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể xóa giỏ hàng";
      message.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const value: CartContextType = {
    items,
    totalItems,
    totalAmount,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
