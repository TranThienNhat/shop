import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  InputNumber,
  Divider,
  Input,
  message,
  Tag,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, Ticket, X } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { getImageUrl, formatCurrency } from "../utils/helpers";

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
    if (!couponInput.trim()) return message.warning("Vui lòng nhập mã giảm giá!");
    try {
      await applyCoupon(couponInput);
      setCouponInput("");
    } catch (error) {
      // Lỗi đã được xử lý trong Context
    }
  };

  // 1. TRẠNG THÁI GIỎ HÀNG TRỐNG
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center bg-white p-10 md:p-14 rounded-2xl shadow-sm border border-gray/10 max-w-md w-full">
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-primary" />
          </div>
          <Title level={3} className="!font-serif !text-charcoal mb-3">Giỏ hàng trống</Title>
          <Paragraph className="text-gray mb-8">Bạn chưa chọn được sản phẩm nào sao?</Paragraph>
          <Link to="/products">
            <Button type="primary" size="large" className="bg-primary border-primary hover:bg-primary/90 rounded-lg h-12 px-10 font-medium w-full">
              Mua sắm ngay
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* HEADER */}
        <div className="mb-10 border-b border-gray/10 pb-6">
          <Title level={2} className="!font-serif !text-charcoal !mb-2">Giỏ hàng của bạn</Title>
          <Text className="text-gray uppercase tracking-widest text-xs">Muse Cosmetics / Shopping Cart</Text>
        </div>

        <Row gutter={[32, 32]}>
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <Col xs={24} lg={15}>
            <div className="space-y-4">
              {items.map((item) => (
                <Card
                  key={item.variant_id}
                  className="border border-gray/10 shadow-sm rounded-2xl hover:shadow-md transition-all overflow-hidden bg-white"
                  bodyStyle={{ padding: "20px" }}
                >
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Ảnh sản phẩm */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray/5 flex-shrink-0 border border-gray/5">
                      <img
                        src={getImageUrl(item.image_url || "")}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Muse"; }}
                      />
                    </div>

                    {/* Thông tin */}
                    <div className="flex-1 text-center sm:text-left">
                      <Link to={`/products/${item.product_id}`} className="text-charcoal font-serif text-lg hover:text-primary transition-colors block mb-2 line-clamp-2">
                        {item.name}
                      </Link>
                      <Tag className="bg-primary/5 text-primary border-none rounded-md px-2 py-1 text-xs font-medium">
                        {item.variant_name || "Mặc định"}
                      </Tag>
                    </div>

                    {/* Giá & Số lượng */}
                    <div className="flex flex-col items-center sm:items-end gap-4 mt-4 sm:mt-0">
                      <Text className="text-primary font-medium text-lg">
                        {formatCurrency(Number(item.price) * item.quantity)}
                      </Text>
                      
                      <div className="flex items-center gap-4">
                        {/* Control số lượng */}
                        <div className="flex items-center bg-background rounded-lg border border-gray/20 p-0.5">
                          <Button 
                            type="text" size="small" icon={<Minus size={14} />} 
                            onClick={() => handleQuantityChange(item.variant_id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || isLoading}
                            className="text-gray hover:text-charcoal"
                          />
                          <InputNumber
                            min={1} value={item.quantity} controls={false} readOnly
                            className="w-10 border-0 bg-transparent text-center font-medium !text-charcoal text-sm"
                          />
                          <Button 
                            type="text" size="small" icon={<Plus size={14} />} 
                            onClick={() => handleQuantityChange(item.variant_id, item.quantity + 1)}
                            disabled={isLoading}
                            className="text-gray hover:text-charcoal"
                          />
                        </div>

                        {/* Nút xóa */}
                        <Button
                          type="text"
                          icon={<Trash2 size={18} strokeWidth={1.5} />}
                          onClick={() => removeFromCart(item.variant_id)}
                          disabled={isLoading}
                          className="text-gray hover:text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Col>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG & MÃ GIẢM GIÁ */}
          <Col xs={24} lg={9}>
            <div className="sticky top-24 space-y-6">
              
              {/* Box Mã giảm giá */}
              <Card className="border border-gray/10 shadow-sm rounded-2xl bg-white" bodyStyle={{ padding: "24px" }}>
                <div className="flex items-center gap-2 mb-4 text-charcoal font-medium">
                  <Ticket size={18} className="text-primary" />
                  <span>Mã ưu đãi</span>
                </div>
                {!couponCode ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nhập mã giảm giá..." 
                      className="rounded-lg border-gray/20 h-11"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    />
                    <Button 
                      type="primary" 
                      className="bg-primary border-primary hover:bg-primary/90 rounded-lg h-11 font-medium px-6"
                      onClick={handleApplyCoupon}
                      loading={isLoading}
                    >
                      Áp dụng
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-primary/5 p-3.5 rounded-lg border border-primary/20">
                    <div>
                      <Text type="secondary" className="text-[10px] block uppercase font-medium">Đang áp dụng</Text>
                      <Text className="text-primary font-bold tracking-widest">{couponCode}</Text>
                    </div>
                    <Button type="text" icon={<X size={16} />} onClick={removeCoupon} className="text-gray hover:text-red-500 hover:bg-red-50" />
                  </div>
                )}
              </Card>

              {/* Box Tổng tiền */}
              <Card className="border border-gray/10 shadow-sm rounded-2xl bg-white" bodyStyle={{ padding: "24px" }}>
                <Title level={4} className="!font-serif !text-charcoal !mb-6">Tóm tắt đơn hàng</Title>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Text className="text-gray">Tạm tính</Text>
                    <Text className="text-charcoal font-medium">{formatCurrency(subtotal)}</Text>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <Text className="text-primary">Giảm giá</Text>
                      <Text className="text-primary font-medium">-{formatCurrency(discount)}</Text>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Text className="text-gray">Phí vận chuyển</Text>
                    <Text className="text-charcoal font-medium">
                      {subtotal >= 500000 ? "Miễn phí" : formatCurrency(30000)}
                    </Text>
                  </div>

                  <Divider className="my-4 border-gray/10" />

                  <div className="flex justify-between items-end mb-2">
                    <Text className="text-charcoal font-serif text-lg">Tổng cộng</Text>
                    <Text className="text-2xl font-serif text-primary font-medium">
                      {formatCurrency(totalAmount + (subtotal >= 500000 ? 0 : 30000))}
                    </Text>
                  </div>

                  {subtotal < 500000 && (
                    <div className="bg-primary/5 p-3 rounded-lg text-center mt-2">
                      <Text className="text-primary text-xs">
                        Mua thêm <span className="font-bold">{formatCurrency(500000 - subtotal)}</span> để được miễn phí giao hàng!
                      </Text>
                    </div>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    block
                    className="bg-primary border-primary hover:bg-primary/90 h-12 rounded-lg font-medium text-base mt-6 transition-all"
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