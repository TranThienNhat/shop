import React, { useState, useEffect, useMemo } from "react";
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
import { useNavigate, useLocation } from "react-router-dom"; // Thêm useLocation
import { 
  MapPin, 
  CreditCard, 
  User, 
  ChevronLeft, 
  StickyNote, 
  PackageCheck, 
  Phone, 
  Mail 
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Text } = Typography;
const { Step } = Steps;

const CheckoutPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation(); // Để lấy state truyền từ CartPage
  const { items, discount, clearCart, isLoading: cartLoading } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // 1. LẤY DANH SÁCH ID ĐÃ CHỌN TỪ STATE
  const selectedVariantIds = location.state?.selectedVariantIds as number[] | undefined;

  // 2. LỌC SẢN PHẨM: Nếu có chọn thì lọc, nếu không (đi thẳng vào checkout) thì lấy hết
  const checkoutItems = useMemo(() => {
    if (selectedVariantIds && selectedVariantIds.length > 0) {
      return items.filter(item => selectedVariantIds.includes(item.variant_id));
    }
    return items;
  }, [items, selectedVariantIds]);

  // 3. TÍNH TOÁN LẠI TỔNG TIỀN DỰA TRÊN SẢN PHẨM CHECKOUT
  const checkoutSubtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [checkoutItems]);

  const shippingFee = checkoutSubtotal >= 500000 ? 0 : 30000;
  const finalTotal = checkoutSubtotal - discount + shippingFee;

  useEffect(() => {
    if (!cartLoading && checkoutItems.length === 0) {
      navigate("/cart");
    }
  }, [checkoutItems, navigate, cartLoading]);

  const handlePlaceOrder = async (values: any) => {
    if (!user) return message.error("Vui lòng đăng nhập để tiếp tục!");

    try {
      setLoading(true);
      
      // Gửi kèm danh sách ID sản phẩm được chọn để Backend biết đơn hàng gồm những gì
      const response = await api.post("/orders/checkout", {
        shipping_info: {
          name: values.name,
          phone: values.phone,
          email: values.email,
          address: values.address,
        },
        items: checkoutItems.map(item => ({
          variant_id: item.variant_id,
          quantity: item.quantity
        })),
        notes: values.notes,
        payment_method: "cod",
      });

      if (response.data && response.data.order) {
        message.success("Đặt hàng thành công! Đơn hàng đang được chuẩn bị ✨");
        
        // Chỉ xóa các item đã mua khỏi giỏ hàng (nếu backend chưa tự động xóa)
        await clearCart(selectedVariantIds); 
        
        navigate("/checkout/success", { state: { order: response.data.order } });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const renderLabel = (IconComponent: any, labelText: string, isRequired: boolean = false) => (
    <span className="flex items-center gap-2">
      <IconComponent size={16} className="text-primary" />
      <span className="font-semibold text-charcoal">
        {labelText}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </span>
    </span>
  );

  if (checkoutItems.length === 0 || !user) return null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
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
          <Col xs={24} lg={14}>
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <div className="p-6 md:p-8">
                <Title level={4} className="!mb-6 !font-serif">Thông tin nhận hàng</Title>

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
                        label={renderLabel(User, "Họ và tên", true)}
                        rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                      >
                      <Input className="rounded-lg h-12" placeholder="Nguyễn Văn A" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phone"
                        label={renderLabel(Phone, "Số điện thoại", true)}
                        rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                      >
                      <Input className="rounded-lg h-12" placeholder="0901234567" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="email"
                    label={renderLabel(Mail, "Email", true)}
                    rules={[{ required: true, type: 'email', message: "Vui lòng nhập email hợp lệ" }]}
                  >
                    <Input className="rounded-lg h-12" />
                  </Form.Item>

                  <Form.Item
                    name="address"
                    label={renderLabel(MapPin, "Địa chỉ giao hàng", true)}
                    rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                  >
                    <Input.TextArea rows={3} className="rounded-lg" />
                  </Form.Item>

                  <Form.Item name="notes" label={renderLabel(StickyNote, "Ghi chú")}>
                    <Input.TextArea rows={2} className="rounded-lg" />
                  </Form.Item>

                  <div className="bg-background p-5 rounded-xl border border-gray/10 flex gap-4 items-center mb-8">
                    <CreditCard size={20} className="text-primary" />
                    <div>
                      <Text strong className="block">Thanh toán khi nhận hàng (COD)</Text>
                      <Text className="text-gray text-xs">Hiện tại chúng tôi chỉ hỗ trợ COD</Text>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="w-full bg-primary h-14 rounded-xl font-medium text-lg"
                  >
                    Xác nhận đặt hàng - {formatCurrency(finalTotal)}
                  </Button>
                </Form>
              </div>
            </Card>
          </Col>

          {/* HIỂN THỊ DANH SÁCH SẢN PHẨM ĐÃ LỌC */}
          <Col xs={24} lg={10}>
            <Card className="border-0 shadow-lg rounded-2xl sticky top-8 overflow-hidden bg-white">
              <div className="p-6 border-b border-gray/5">
                <Title level={4} className="!m-0 !font-serif flex items-center gap-2">
                  <PackageCheck size={20} className="text-primary" />
                  Sản phẩm đã chọn ({checkoutItems.length})
                </Title>
              </div>
              
              <div className="p-6">
                <div className="max-h-[350px] overflow-y-auto mb-6 space-y-4">
                  {checkoutItems.map((item) => (
                    <div key={item.variant_id} className="flex gap-4 items-center">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray/10 flex-shrink-0">
                        <img src={getImageUrl(item.image_url || "")} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm truncate font-serif">{item.name}</Text>
                        <Text type="secondary" className="text-[11px] uppercase">
                          {item.variant_name} × {item.quantity}
                        </Text>
                      </div>
                      <Text className="font-medium">{formatCurrency(Number(item.price) * item.quantity)}</Text>
                    </div>
                  ))}
                </div>

                <div className="bg-background p-6 rounded-2xl border border-gray/10 space-y-3">
                  <div className="flex justify-between">
                    <Text className="text-gray">Tạm tính</Text>
                    <Text className="text-charcoal font-medium">{formatCurrency(checkoutSubtotal)}</Text>
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
                      {shippingFee === 0 ? <Tag color="green" className="m-0">Free</Tag> : formatCurrency(shippingFee)}
                    </Text>
                  </div>

                  <Divider className="my-2 border-gray/10" />

                  <div className="flex justify-between items-end pt-2">
                    <Text className="text-charcoal font-serif text-lg">Tổng cộng</Text>
                    <Text className="text-2xl font-serif text-primary font-bold">
                      {formatCurrency(finalTotal)}
                    </Text>
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