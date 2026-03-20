import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  InputNumber,
  Empty,
  Divider,
  Input,
  message,
  Tag,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Ticket, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { getImageUrl, formatCurrency } from "../utils/helpers";

// Sửa lỗi TypeScript bằng cách bóc tách từ Typography chuẩn
const { Title, Text, Paragraph } = Typography;

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    totalAmount,
    subtotal,
    discount,
    couponCode,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    isLoading,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");

  const handleQuantityChange = (variantId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(variantId, newQuantity);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return message.warning("Nàng nhập mã giảm giá đã nhé!");
    try {
      await applyCoupon(couponInput);
      setCouponInput("");
    } catch (error) {
      // Lỗi đã được xử lý trong Context
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fffafb] flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[40px] shadow-sm border border-rose-50 max-w-md">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-rose-300" />
          </div>
          <Title level={3} className="!font-serif !text-charcoal">Túi đồ trống</Title>
          <Paragraph className="text-gray-400 mb-8">Nàng chưa chọn được sản phẩm nào ưng ý sao?</Paragraph>
          <Link to="/products">
            <Button type="primary" size="large" className="bg-rose-400 border-none rounded-full h-12 px-10 font-medium shadow-lg shadow-rose-100">
              MUA SẮM NGAY
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffafb] py-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <div className="mb-10">
          <Title level={2} className="!font-serif !text-charcoal !mb-2">Giỏ hàng của nàng</Title>
          <Text className="text-gray-400 uppercase tracking-widest text-xs">Muse Cosmetics / Shopping Cart</Text>
        </div>

        <Row gutter={[32, 32]}>
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <Col xs={24} lg={16}>
            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.variant_id}
                  className="border-none shadow-sm rounded-[24px] hover:shadow-md transition-all overflow-hidden"
                  bodyStyle={{ padding: "20px" }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Ảnh sản phẩm */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-rose-50/30 flex-shrink-0">
                      <img
                        src={getImageUrl(item.image_url || "")}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Muse"; }}
                      />
                    </div>

                    {/* Thông tin */}
                    <div className="flex-1 text-center sm:text-left">
                      <Link to={`/products/${item.product_id}`} className="text-charcoal font-serif text-lg hover:text-rose-400 block mb-1">
                        {item.name}
                      </Link>
                      <Tag className="bg-rose-50 text-rose-400 border-none rounded-full px-3 py-0.5 text-[10px] uppercase font-bold">
                        {item.variant_name || "Mặc định"}
                      </Tag>
                    </div>

                    {/* Giá & Số lượng */}
                    <div className="flex flex-col items-center sm:items-end gap-3">
                      <Text className="text-rose-400 font-bold text-base">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </Text>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                          <Button 
                            type="text" shape="circle" size="small" icon={<Minus size={12} />} 
                            onClick={() => handleQuantityChange(item.variant_id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                          />
                          <InputNumber
                            min={1} value={item.quantity} controls={false} readOnly
                            className="w-8 border-0 bg-transparent text-center font-bold !text-charcoal text-xs"
                          />
                          <Button 
                            type="text" shape="circle" size="small" icon={<Plus size={12} />} 
                            onClick={() => handleQuantityChange(item.variant_id, item.quantity + 1)}
                            disabled={isLoading}
                          />
                        </div>
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 size={18} strokeWidth={1.5} />}
                          onClick={() => removeFromCart(item.variant_id)}
                          disabled={isLoading}
                          className="hover:bg-rose-50 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & MÃ GIẢM GIÁ */}
          <Col xs={24} lg={8}>
            <div className="sticky top-24 space-y-6">
              {/* Box Mã giảm giá */}
              <Card className="border-none shadow-sm rounded-[24px] p-2">
                <div className="flex items-center gap-2 mb-4 text-rose-400 font-medium">
                  <Ticket size={18} />
                  <span>Mã ưu đãi của nàng</span>
                </div>
                {!couponCode ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nhập mã..." 
                      className="rounded-full border-rose-100 h-10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    />
                    <Button 
                      type="primary" 
                      className="bg-rose-400 border-none rounded-full h-10 font-medium"
                      onClick={handleApplyCoupon}
                      loading={isLoading}
                    >
                      Áp dụng
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-rose-50 p-3 rounded-2xl border border-dashed border-rose-200">
                    <div>
                      <Text type="secondary" className="text-[10px] block uppercase">Đang áp dụng</Text>
                      <Text className="text-rose-500 font-bold tracking-widest">{couponCode}</Text>
                    </div>
                    <Button type="text" icon={<X size={16} />} onClick={removeCoupon} className="text-rose-400" />
                  </div>
                )}
              </Card>

              {/* Box Tổng tiền */}
              <Card className="border-none shadow-sm rounded-[24px] p-4 bg-white">
                <Title level={4} className="!font-serif !text-charcoal !mb-6 text-center">Tóm tắt túi đồ</Title>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Text className="text-gray-400">Tạm tính</Text>
                    <Text className="text-charcoal font-medium">{formatCurrency(subtotal)}</Text>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <Text className="text-rose-400">Giảm giá</Text>
                      <Text className="text-rose-400 font-medium">-{formatCurrency(discount)}</Text>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Text className="text-gray-400">Phí vận chuyển</Text>
                    <Text className="text-charcoal font-medium">
                      {subtotal >= 500000 ? "Miễn phí" : formatCurrency(30000)}
                    </Text>
                  </div>

                  <Divider className="my-4 border-rose-50" />

                  <div className="flex justify-between items-end">
                    <Text className="text-charcoal font-serif text-lg">Tổng cộng</Text>
                    <Text className="text-2xl font-serif text-rose-500 font-bold">
                      {formatCurrency(totalAmount + (subtotal >= 500000 ? 0 : 30000))}
                    </Text>
                  </div>

                  {subtotal < 500000 && (
                    <div className="bg-blue-50/50 p-3 rounded-2xl text-center">
                      <Text className="text-blue-500 text-[11px] italic">
                        Mua thêm {formatCurrency(500000 - subtotal)} để được Freeship nàng nhé!
                      </Text>
                    </div>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    block
                    className="bg-rose-400 border-none h-14 rounded-full font-bold uppercase tracking-widest shadow-lg shadow-rose-100 hover:!bg-rose-500 mt-4"
                    onClick={() => navigate("/checkout")}
                    loading={isLoading}
                  >
                    Thanh toán ngay
                  </Button>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CartPage;