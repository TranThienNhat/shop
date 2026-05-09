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
  Tag,
} from "antd";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, User, ChevronLeft, StickyNote, PackageCheck, Phone, Mail } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const CheckoutPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { items, subtotal, discount, totalAmount, clearCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const finalTotal = totalAmount + shippingFee;

  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate, cartLoading]);

  const handlePlaceOrder = async (values: any) => {
    if (!user) return message.error("Vui lòng đăng nhập để tiếp tục!");

    try {
      setLoading(true);
      const response = await api.post("/orders/checkout", {
        shipping_info: {
          name: values.name,
          phone: values.phone,
          email: values.email,
          address: values.address,
        },
        notes: values.notes,
        payment_method: "cod",
      });

      if (response.data && response.data.order) {
        message.success("Đặt hàng thành công! Đơn hàng đang được chuẩn bị ✨");
        await clearCart();
        navigate("/checkout/success", { state: { order: response.data.order } });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 || !user) return null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Navigation Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <Button 
              type="text" 
              icon={<ChevronLeft size={18} />} 
              onClick={() => navigate("/cart")}
              className="text-gray hover:text-primary p-0 flex items-center mb-2 transition-colors"
            >
              Quay lại giỏ hàng
            </Button>
            <Title level={2} className="!font-serif !text-charcoal !m-0">Thanh toán</Title>
          </div>
          <div className="w-full md:w-80">
            <Steps current={0} size="small" className="custom-steps">
              <Step title="Thông tin" />
              <Step title="Hoàn tất" />
            </Steps>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          {/* LEFT: SHIPPING FORM */}
          <Col xs={24} lg={14}>
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <User size={20} />
                  </div>
                  <div>
                    <Title level={4} className="!m-0 !font-serif">Thông tin nhận hàng</Title>
                    <Text className="text-gray text-xs">Vui lòng kiểm tra kỹ thông tin liên lạc</Text>
                  </div>
                </div>

                <Form 
                  form={form} 
                  layout="vertical" 
                  onFinish={handlePlaceOrder} 
                  requiredMark={false}
                  initialValues={{
                    name: user.name,
                    phone: user.phone,
                    email: user.email,
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label={<Text strong className="text-charcoal">Họ và tên</Text>}
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                      >
                        <Input prefix={<User size={16} className="text-gray/50" />} className="rounded-lg h-12" placeholder="Nguyễn Văn A" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label={<Text strong className="text-charcoal">Số điện thoại</Text>}
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                      >
                        <Input prefix={<Phone size={16} className="text-gray/50" />} className="rounded-lg h-12" placeholder="0901234567" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        name="email"
                        label={<Text strong className="text-charcoal">Email</Text>}
                        rules={[
                          { required: true, message: "Vui lòng nhập email" },
                          { type: 'email', message: "Email không hợp lệ" }
                        ]}
                      >
                        <Input prefix={<Mail size={16} className="text-gray/50" />} className="rounded-lg h-12" placeholder="your@email.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider className="my-6" />

                  <Form.Item
                    name="address"
                    label={<Text strong className="text-charcoal">Địa chỉ giao hàng</Text>}
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ nhận hàng" }]}
                  >
                    <Input.TextArea 
                      rows={3} 
                      placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." 
                      className="rounded-lg p-4 text-base"
                    />
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label={<Text strong className="text-charcoal">Ghi chú (tùy chọn)</Text>}
                  >
                    <Input.TextArea 
                      rows={2} 
                      placeholder="Ví dụ: Giao giờ hành chính..." 
                      className="rounded-lg p-4 text-base"
                    />
                  </Form.Item>

                  <div className="bg-background p-5 rounded-xl border border-gray/10 flex gap-4 items-center mb-8">
                    <div className="bg-white p-3 rounded-lg shadow-sm text-primary border border-gray/5">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <Text strong className="text-charcoal block">Thanh toán khi nhận hàng (COD)</Text>
                      <Text className="text-gray text-xs">Đơn giản và an toàn nhất cho bạn.</Text>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-primary border-primary hover:bg-primary/90 h-14 rounded-xl font-medium text-lg shadow-md shadow-primary/20 transition-all"
                  >
                    Xác nhận đặt hàng
                  </Button>
                </Form>
              </div>
            </Card>
          </Col>

          {/* RIGHT: ORDER SUMMARY */}
          <Col xs={24} lg={10}>
            <Card className="border-0 shadow-lg rounded-2xl sticky top-8 overflow-hidden bg-white">
              <div className="p-6 border-b border-gray/5">
                <div className="flex items-center gap-2">
                  <PackageCheck size={20} className="text-primary" />
                  <Title level={4} className="!m-0 !font-serif">Đơn hàng</Title>
                </div>
              </div>
              
              <div className="p-6">
                <div className="max-h-[300px] overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-4">
                  {items.map((item) => (
                    <div key={item.variant_id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray/5 border border-gray/10 flex-shrink-0">
                        <img src={getImageUrl(item.image_url || "")} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm text-charcoal truncate font-serif">{item.name}</Text>
                        <Text type="secondary" className="text-[11px] uppercase tracking-wider">
                          {item.variant_name} × {item.quantity}
                        </Text>
                      </div>
                      <Text className="font-medium text-charcoal">{formatCurrency(Number(item.price) * item.quantity)}</Text>
                    </div>
                  ))}
                </div>

                <div className="bg-background p-6 rounded-2xl border border-gray/10 space-y-3">
                  <div className="flex justify-between">
                    <Text className="text-gray">Tạm tính</Text>
                    <Text className="text-charcoal font-medium">{formatCurrency(subtotal)}</Text>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <Text className="text-primary">Ưu đãi</Text>
                      <Text className="text-primary font-medium">-{formatCurrency(discount)}</Text>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Text className="text-gray">Vận chuyển</Text>
                    <Text className="text-charcoal font-medium">
                      {shippingFee === 0 ? <Tag color="green" className="m-0 border-0 rounded-md">Free</Tag> : formatCurrency(shippingFee)}
                    </Text>
                  </div>

                  <Divider className="my-2 border-gray/10" />

                  <div className="flex justify-between items-end pt-2">
                    <Text className="text-charcoal font-serif text-lg">Tổng thanh toán</Text>
                    <div className="text-right">
                       <Text className="text-2xl font-serif text-primary font-bold block leading-none">
                        {formatCurrency(finalTotal)}
                      </Text>
                      <Text className="text-[10px] text-gray italic">Đã bao gồm VAT</Text>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutPage;