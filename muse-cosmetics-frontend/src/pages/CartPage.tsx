import React from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  InputNumber,
  Empty,
  Divider,
  Space,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { getImageUrl, formatCurrency } from "../utils/helpers";
import CouponSection from "../components/CouponSection";

const { Title, Paragraph } = Typography;

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
    isLoading,
  } = useCart();

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 py-16">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <Title level={3} className="!text-charcoal !mb-2">
                  Giỏ hàng trống
                </Title>
                <Paragraph className="text-gray mb-6">
                  Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản
                  phẩm tuyệt vời của chúng tôi!
                </Paragraph>
                <Link to="/products">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingBag size={20} />}
                    className="bg-primary border-primary">
                    Tiếp tục mua sắm
                  </Button>
                </Link>
              </div>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <Title level={1} className="!text-charcoal !mb-8 font-serif">
          Giỏ hàng ({items.length} sản phẩm)
        </Title>

        <Row gutter={[24, 24]}>
          {/* Cart Items */}
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {items.map((item) => (
                <Card
                  key={item.id}
                  className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
                  <Row gutter={[16, 16]} align="middle">
                    {/* Product Image */}
                    <Col xs={24} sm={6}>
                      <div className="aspect-square overflow-hidden rounded-lg bg-gray-50 border-2 border-gray-100 shadow-md">
                        <img
                          src={getImageUrl(item.image_url)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-product.jpg";
                          }}
                        />
                      </div>
                    </Col>

                    {/* Product Info */}
                    <Col xs={24} sm={18}>
                      <div className="space-y-4">
                        <div>
                          <Title level={4} className="!text-charcoal !mb-1">
                            {item.name}
                          </Title>
                          <div className="bg-primary/10 px-3 py-1 rounded-lg inline-block border border-primary/20">
                            <p className="text-primary font-semibold text-lg mb-0">
                              {formatCurrency(
                                parseFloat(item.sale_price || item.price)
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <span className="text-charcoal font-medium">
                              Số lượng:
                            </span>
                            <div className="flex items-center border-2 border-gray-300 rounded-lg shadow-sm bg-white">
                              <Button
                                type="text"
                                size="small"
                                icon={<Minus size={14} />}
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity - 1
                                  )
                                }
                                disabled={item.quantity <= 1 || isLoading}
                                className="border-0 hover:bg-gray-100"
                              />
                              <InputNumber
                                min={1}
                                max={99}
                                value={item.quantity}
                                onChange={(value) =>
                                  handleQuantityChange(item.id, value || 1)
                                }
                                className="border-0 text-center font-semibold"
                                style={{ width: "60px" }}
                                controls={false}
                                disabled={isLoading}
                              />
                              <Button
                                type="text"
                                size="small"
                                icon={<Plus size={14} />}
                                onClick={() =>
                                  handleQuantityChange(
                                    item.id,
                                    item.quantity + 1
                                  )
                                }
                                disabled={isLoading}
                                className="border-0 hover:bg-gray-100"
                              />
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-600">
                            Xóa
                          </Button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-charcoal font-semibold">
                            Tạm tính:{" "}
                            {formatCurrency(
                              parseFloat(item.sale_price || item.price) *
                                item.quantity
                            )}
                          </p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link to="/products">
                <Button
                  size="large"
                  className="border-primary text-primary hover:bg-primary hover:text-white">
                  ← Tiếp tục mua sắm
                </Button>
              </Link>
            </div>
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={8}>
            <Card className="border-0 shadow-sm sticky top-24">
              <Title level={4} className="!text-charcoal !mb-6">
                Tóm tắt đơn hàng
              </Title>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray">Tạm tính:</span>
                  <span className="text-charcoal font-medium">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                {/* Coupon Section */}
                <CouponSection />

                <div className="flex justify-between">
                  <span className="text-gray">Phí vận chuyển:</span>
                  <span className="text-charcoal font-medium">
                    {subtotal >= 500000 ? "Miễn phí" : formatCurrency(30000)}
                  </span>
                </div>

                <Divider className="my-4" />

                <div className="flex justify-between text-lg">
                  <span className="text-charcoal font-semibold">
                    Tổng cộng:
                  </span>
                  <span className="text-primary font-bold">
                    {formatCurrency(
                      totalAmount + (subtotal >= 500000 ? 0 : 30000)
                    )}
                  </span>
                </div>

                {subtotal < 500000 && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-blue-600 text-sm">
                      Mua thêm {formatCurrency(500000 - subtotal)} để được miễn
                      phí vận chuyển!
                    </p>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  className="w-full bg-primary border-primary mt-6"
                  onClick={() => navigate("/checkout")}>
                  Tiến hành thanh toán
                </Button>

                <div className="text-center text-xs text-gray mt-4">
                  <p>Bảo mật thanh toán 100%</p>
                  <p>Hỗ trợ đổi trả trong 7 ngày</p>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CartPage;
