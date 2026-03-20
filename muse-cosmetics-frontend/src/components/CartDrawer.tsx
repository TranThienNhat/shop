import React from "react";
import { Drawer, Button, Typography, Space, Empty } from "antd"; // Đã bỏ Divider, InputNumber không dùng
import { ShoppingBag, X, ArrowRight } from "lucide-react"; // Đã bỏ Trash2 không dùng
import { useCart } from "../contexts/CartContext";
import { getImageUrl, formatCurrency } from "../utils/helpers";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

interface CartDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ visible, onClose }) => {
  const navigate = useNavigate();
  // Bỏ isLoading vì không dùng tới ở đây để tránh cảnh báo 6133
  const { items, subtotal, updateQuantity, removeFromCart } = useCart();

  return (
    <Drawer
      title={
        <div className="flex justify-between items-center">
          <Space>
            <ShoppingBag size={20} className="text-primary" />
            <span className="font-serif text-lg text-charcoal">Giỏ hàng nhanh</span>
          </Space>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={400}
      extra={
        <X 
          size={20} 
          className="cursor-pointer text-gray-400 hover:text-charcoal transition-colors" 
          onClick={onClose} 
        />
      }
      closable={false}
      // style={{ padding: 0 }} // Antd v5 dùng styles={{ body: { padding: 0 } }}
      styles={{ body: { padding: "10px 16px" } }}
      footer={
        items.length > 0 && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex justify-between mb-4">
              <Text className="text-gray-500 text-base">Tạm tính:</Text>
              <Text className="text-primary text-xl font-bold">{formatCurrency(subtotal)}</Text>
            </div>
            <Space direction="vertical" className="w-full" size="middle">
              <Button 
                type="primary" 
                block 
                size="large" 
                className="bg-primary h-12 rounded-lg flex items-center justify-center gap-2 font-bold"
                onClick={() => { onClose(); navigate("/checkout"); }}
              >
                THANH TOÁN NGAY <ArrowRight size={18} />
              </Button>
              <Button 
                block 
                size="large" 
                className="h-12 border-gray-300 rounded-lg hover:text-primary hover:border-primary"
                onClick={() => { onClose(); navigate("/cart"); }}
              >
                XEM CHI TIẾT GIỎ HÀNG
              </Button>
            </Space>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
          <Empty description="Giỏ hàng đang trống" />
          <Button type="link" onClick={onClose} className="mt-4 text-primary">
            Tiếp tục khám phá sản phẩm
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {items.map((item: any) => (
            <div key={item.id} className="py-5">
              <div className="flex gap-4">
                {/* Ảnh sản phẩm */}
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                  <img
                    // FIX LỖI 1: Thêm || "" để đảm bảo luôn truyền string vào getImageUrl
                    src={getImageUrl(item.image_url || "")}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Product"; }}
                  />
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Title level={5} className="!m-0 line-clamp-1 flex-1 !text-sm !text-charcoal">
                        {item.name}
                      </Title>
                      <X 
                        size={14} 
                        className="text-gray-400 cursor-pointer ml-2 hover:text-red-500 transition-colors" 
                        onClick={() => removeFromCart(item.id)}
                      />
                    </div>
                    {/* FIX LỖI 2 & 3: Bỏ sale_price vì trong CartItem interface không có field này */}
                    <Text type="secondary" className="text-xs">
                       Đơn giá: {formatCurrency(Number(item.price || 0))}
                    </Text>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3">
                    {/* Bộ tăng giảm số lượng mini */}
                    <div className="flex items-center border border-gray-200 rounded bg-white">
                      <button 
                        className="px-2 py-1 hover:bg-gray-50 disabled:opacity-30"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      > - </button>
                      <span className="px-3 text-xs font-bold border-x border-gray-200">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 hover:bg-gray-50"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      > + </button>
                    </div>
                    <Text strong className="text-charcoal text-xs">
                      {formatCurrency(Number(item.price || 0) * item.quantity)}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
};

export default CartDrawer;