import React, { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Form,
  Input,
  Divider,
  Steps,
  message,
} from "antd";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin, User, Phone } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { CheckoutData } from "../types";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Paragraph } = Typography;
const { Step } = Steps;

const CheckoutPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<CheckoutData | null>(null);

  const shippingFee = totalAmount >= 500000 ? 0 : 30000;
  const finalTotal = totalAmount + shippingFee;

  useEffect(() => {
    if (items.length === 0) {
      message.warning("Giỏ hàng trống");
      navigate("/cart");
    }
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);

  const handleShippingSubmit = (values: CheckoutData) => {
    setOrderData(values);
    setCurrentStep(1);
  };

  const handlePlaceOrder = async () => {
    if (!orderData) return;

    try {
      setLoading(true);

      const response = await api.post("/orders/checkout", {
        shipping_info: {
          name: orderData.name,
          phone: orderData.phone,
          address: orderData.address,
        },
        payment_method: "cod", // Cash on delivery
      });

      if (response.data) {
        message.success("Đặt hàng thành công!");
        await clearCart();
        navigate("/checkout/success", {
          state: { orderId: response.data.id },
        });
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi đặt hàng";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: "Thông tin giao hàng",
      icon: <MapPin size={20} />,
    },
    {
      title: "Xác nhận đơn hàng",
      icon: <CreditCard size={20} />,
    },
  ];

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
        <Title level={1} className="!text-charcoal !mb-8 font-serif">
          Thanh toán
        </Title>

        {/* Progress Steps */}
        <Card className="border-0 shadow-sm mb-8">
          <Steps current={currentStep} className="mb-0">
            {steps.map((step, index) => (
              <Step key={index} title={step.title} icon={step.icon} />
            ))}
          </Steps>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {currentStep === 0 && (
              <Card className="border-0 shadow-sm">
                <Title level={3} className="!text-charcoal !mb-6">
                  <MapPin size={24} className="inline mr-2" />
                  Thông tin giao hàng
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleShippingSubmit}
                  size="large"
                  requiredMark={false}>
                  <Row gutter={[16, 0]}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="name"
                        label="Họ và tên"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                        ]}>
                        <Input
                          prefix={<User size={16} className="text-gray" />}
                          placeholder="Nguyễn Văn A"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                          {
                            pattern: /^[0-9]{10,11}$/,
                            message: "Số điện thoại không hợp lệ",
                          },
                        ]}>
                        <Input
                          prefix={<Phone size={16} className="text-gray" />}
                          placeholder="0901234567"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="address"
                    label="Địa chỉ giao hàng"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập địa chỉ giao hàng",
                      },
                    ]}>
                    <Input.TextArea
                      rows={3}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    />
                  </Form.Item>

                  <div className="flex justify-end">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="bg-primary border-primary">
                      Tiếp tục
                    </Button>
                  </div>
                </Form>
              </Card>
            )}

            {currentStep === 1 && orderData && (
              <Card className="border-0 shadow-sm">
                <Title level={3} className="!text-charcoal !mb-6">
                  <CreditCard size={24} className="inline mr-2" />
                  Xác nhận đơn hàng
                </Title>

                {/* Shipping Info */}
                <div className="mb-6">
                  <Title level={4} className="!text-charcoal !mb-4">
                    Thông tin giao hàng
                  </Title>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p>
                      <strong>Họ tên:</strong> {orderData.name}
                    </p>
                    <p>
                      <strong>Số điện thoại:</strong> {orderData.phone}
                    </p>
                    <p>
                      <strong>Địa chỉ:</strong> {orderData.address}
                    </p>
                  </div>
                  <Button
                    type="link"
                    onClick={() => setCurrentStep(0)}
                    className="text-primary p-0 mt-2">
                    Chỉnh sửa thông tin
                  </Button>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                  <Title level={4} className="!text-charcoal !mb-4">
                    Phương thức thanh toán
                  </Title>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">
                      Thanh toán khi nhận hàng (COD)
                    </p>
                    <p className="text-gray text-sm mt-1">
                      Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button size="large" onClick={() => setCurrentStep(0)}>
                    Quay lại
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    loading={loading}
                    onClick={handlePlaceOrder}
                    className="bg-primary border-primary">
                    Đặt hàng
                  </Button>
                </div>
              </Card>
            )}
          </Col>

          {/* Order Summary */}
          <Col xs={24} lg={8}>
            <Card className="border-0 shadow-sm sticky top-24">
              <Title level={4} className="!text-charcoal !mb-6">
                Đơn hàng của bạn
              </Title>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
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
                    <div className="flex-1 min-w-0">
                      <p className="text-charcoal font-medium text-sm line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-gray text-sm">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                      <p className="text-primary font-semibold text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Divider />

              {/* Order Total */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray">Tạm tính:</span>
                  <span className="text-charcoal">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray">Phí vận chuyển:</span>
                  <span className="text-charcoal">
                    {shippingFee === 0
                      ? "Miễn phí"
                      : formatCurrency(shippingFee)}
                  </span>
                </div>

                <Divider className="my-3" />

                <div className="flex justify-between text-lg">
                  <span className="text-charcoal font-semibold">
                    Tổng cộng:
                  </span>
                  <span className="text-primary font-bold">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-green-50 p-3 rounded-lg mt-6">
                <p className="text-green-700 text-sm font-medium mb-1">
                  Đặt hàng an toàn & bảo mật
                </p>
                <ul className="text-green-600 text-xs space-y-1">
                  <li>✓ Thông tin được mã hóa SSL</li>
                  <li>✓ Thanh toán khi nhận hàng</li>
                  <li>✓ Đổi trả miễn phí trong 7 ngày</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;
