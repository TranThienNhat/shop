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
  subtotal: number;
  discount: number;
  couponCode: string | null;
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
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = subtotal - discount;

  // Load cart on component mount
  const refreshCart = useCallback(async () => {
    // Only load cart if user is authenticated
    if (!isAuthenticated) {
      setItems([]);
      setSubtotal(0);
      setDiscount(0);
      setCouponCode(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get("/cart");
      console.log("Cart API response:", response.data); // Debug log

      const cartData = response.data;
      setItems(cartData.items || []);
      setSubtotal(cartData.subtotal || 0);
      setDiscount(cartData.discount || 0);
      setCouponCode(cartData.couponCode || null);
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

      // Validate input
      if (!productId || productId <= 0) {
        message.error("Sản phẩm không hợp lệ");
        return;
      }

      if (!quantity || quantity <= 0) {
        message.error("Số lượng phải lớn hơn 0");
        return;
      }

      try {
        setIsLoading(true);
        await api.post("/cart/add", {
          productId: productId,
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

      // Find the item to get product_id
      const item = items.find((item) => item.id === itemId);
      if (!item) {
        message.error("Không tìm thấy sản phẩm");
        return;
      }

      try {
        setIsLoading(true);
        // Use product_id instead of item id
        await api.delete(`/cart/${item.product_id}`);

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
    [refreshCart, isAuthenticated, items]
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

      // Find the item to get product_id
      const item = items.find((item) => item.id === itemId);
      if (!item) {
        message.error("Không tìm thấy sản phẩm");
        return;
      }

      try {
        setIsLoading(true);
        // Use product_id instead of item id
        await api.put(`/cart/${item.product_id}`, {
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
    [refreshCart, removeFromCart, isAuthenticated, items]
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
      setSubtotal(0);
      setDiscount(0);
      setCouponCode(null);
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
    subtotal,
    discount,
    couponCode,
    isLoading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
