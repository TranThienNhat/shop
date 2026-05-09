import React, { useState, useMemo } from "react";
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
  Checkbox,
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
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    isLoading,
    couponCode,
    discount,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  
  // 1. STATE QUẢN LÝ CÁC SẢN PHẨM ĐƯỢC CHỌN
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);

  // 2. LOGIC TÍNH TOÁN DỰA TRÊN SẢN PHẨM ĐÃ CHỌN
  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedItemIds.includes(item.variant_id));
  }, [items, selectedItemIds]);

  const selectedSubtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [selectedItems]);

  const shippingFee = selectedItems.length > 0 && selectedSubtotal < 500000 ? 30000 : 0;
  const finalTotal = selectedSubtotal - discount + shippingFee;

  // 3. XỬ LÝ CHỌN SẢN PHẨM
  const handleSelectToggle = (variantId: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  };

  // Hàm chọn tất cả / bỏ chọn tất cả
  const handleSelectAll = (e: any) => {
    if (e.target.checked) {
      setSelectedItemIds(items.map((item) => item.variant_id));
    } else {
      setSelectedItemIds([]);
    }
  };

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
    } catch (error) {}
  };

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
        <div className="mb-10 border-b border-gray/10 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <Title level={2} className="!font-serif !text-charcoal !mb-2">Giỏ hàng của bạn</Title>
            <Text className="text-gray uppercase tracking-widest text-xs">Muse Cosmetics / Shopping Cart</Text>
          </div>
          
          {/* NÚT CHỌN TẤT CẢ - Đưa lên khu vực dễ nhìn */}
          <div className="bg-white px-4 py-2 rounded-xl border border-gray/10 shadow-sm flex items-center gap-3">
             <Checkbox 
              onChange={handleSelectAll} 
              checked={selectedItemIds.length === items.length && items.length > 0}
              indeterminate={selectedItemIds.length > 0 && selectedItemIds.length < items.length}
              className="font-medium text-charcoal"
            >
              Chọn tất cả
            </Checkbox>
            {selectedItemIds.length > 0 && (
              <Button 
                type="text" 
                size="small" 
                danger 
                className="text-xs hover:bg-red-50"
                onClick={() => setSelectedItemIds([])}
              >
                Bỏ chọn
              </Button>
            )}
          </div>
        </div>

        <Row gutter={[32, 32]}>
          <Col xs={24} lg={15}>
            <div className="space-y-4">
              {items.map((item) => {
                const isSelected = selectedItemIds.includes(item.variant_id);
                return (
                  <Card
                    key={item.variant_id}
                    className={`border transition-all duration-300 overflow-hidden bg-white rounded-2xl ${
                      isSelected ? "border-primary shadow-md ring-1 ring-primary/10" : "border-gray/10 shadow-sm"
                    }`}
                    bodyStyle={{ padding: "20px" }}
                  >
                    <div className="flex items-center gap-4">
                      {/* CHECKBOX RIÊNG LẺ */}
                      <Checkbox 
                        checked={isSelected}
                        onChange={() => handleSelectToggle(item.variant_id)}
                        className="scale-125"
                      />

                      {/* Ảnh sản phẩm */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray/5 flex-shrink-0 border border-gray/5">
                        <img
                          src={getImageUrl(item.image_url || "")}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/200x200?text=Product"; }}
                        />
                      </div>

                      {/* Thông tin */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/products/${item.product_id}`} className="text-charcoal font-serif text-base hover:text-primary transition-colors block mb-1 truncate">
                          {item.name}
                        </Link>
                        <Tag className="bg-primary/5 text-primary border-none rounded-md px-2 py-0.5 text-[10px] font-medium">
                          {item.variant_name || "Mặc định"}
                        </Tag>
                      </div>

                      {/* Giá & Điều chỉnh số lượng */}
                      <div className="flex flex-col items-end gap-3">
                        <Text className="text-primary font-bold text-base">
                          {formatCurrency(Number(item.price) * item.quantity)}
                        </Text>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-background rounded-lg border border-gray/20 p-0.5">
                            <Button 
                              type="text" size="small" icon={<Minus size={12} />} 
                              onClick={() => handleQuantityChange(item.variant_id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                              className="text-gray hover:text-charcoal"
                            />
                            <InputNumber
                              min={1} value={item.quantity} controls={false} readOnly
                              className="w-8 border-0 bg-transparent text-center font-medium !text-charcoal text-xs"
                            />
                            <Button 
                              type="text" size="small" icon={<Plus size={12} />} 
                              onClick={() => handleQuantityChange(item.variant_id, item.quantity + 1)}
                              disabled={isLoading}
                              className="text-gray hover:text-charcoal"
                            />
                          </div>

                          <Button
                            type="text"
                            icon={<Trash2 size={16} />}
                            onClick={() => removeFromCart(item.variant_id)}
                            disabled={isLoading}
                            className="text-gray/40 hover:text-red-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Col>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <Col xs={24} lg={9}>
            <div className="sticky top-24 space-y-6">
              {/* Voucher Card */}
              <Card className="border border-gray/10 shadow-sm rounded-2xl bg-white" bodyStyle={{ padding: "20px" }}>
                <div className="flex items-center gap-2 mb-4 text-charcoal font-medium">
                  <Ticket size={18} className="text-primary" />
                  <span>Mã ưu đãi</span>
                </div>
                {!couponCode ? (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Nhập mã..." 
                      className="rounded-lg h-10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    />
                    <Button type="primary" className="h-10 px-4" onClick={handleApplyCoupon} loading={isLoading}>
                      Áp dụng
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/20">
                    <div>
                      <Text type="secondary" className="text-[10px] block uppercase">Ưu đãi áp dụng</Text>
                      <Text className="text-primary font-bold">{couponCode}</Text>
                    </div>
                    <Button type="text" icon={<X size={14} />} onClick={removeCoupon} className="text-gray hover:text-red-500" />
                  </div>
                )}
              </Card>

              {/* Summary Card */}
              <Card className="border border-gray/10 shadow-sm rounded-2xl bg-white" bodyStyle={{ padding: "24px" }}>
                <Title level={4} className="!font-serif !text-charcoal !mb-6">Tóm tắt đơn hàng</Title>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Text className="text-gray">Tạm tính ({selectedItems.length} sản phẩm)</Text>
                    <Text className="text-charcoal font-medium">{formatCurrency(selectedSubtotal)}</Text>
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
                      {selectedItems.length === 0 ? "-" : (shippingFee === 0 ? <Tag color="green" className="m-0 border-none">Miễn phí</Tag> : formatCurrency(30000))}
                    </Text>
                  </div>

                  <Divider className="my-4 border-gray/10" />

                  <div className="flex justify-between items-end mb-2">
                    <Text className="text-charcoal font-serif text-lg">Tổng cộng</Text>
                    <Text className="text-2xl font-serif text-primary font-bold">
                      {formatCurrency(finalTotal < 0 ? 0 : finalTotal)}
                    </Text>
                  </div>

                  {selectedItems.length > 0 && selectedSubtotal < 500000 && (
                    <div className="bg-primary/5 p-3 rounded-lg text-center mt-2 border border-primary/10">
                      <Text className="text-primary text-[11px]">
                        Mua thêm <span className="font-bold">{formatCurrency(500000 - selectedSubtotal)}</span> để được **Freeship** ✨
                      </Text>
                    </div>
                  )}

                  <Button
                    type="primary"
                    size="large"
                    block
                    className="h-12 rounded-xl font-medium text-base mt-6 bg-primary"
                    onClick={() => navigate("/checkout", { state: { selectedVariantIds: selectedItemIds } })}
                    loading={isLoading}
                    disabled={selectedItemIds.length === 0}
                  >
                    {selectedItemIds.length === 0 ? "Vui lòng chọn sản phẩm" : `Thanh toán (${selectedItemIds.length})`}
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