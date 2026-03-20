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
import { MapPin, CreditCard, User, ChevronLeft, StickyNote, PackageCheck } from "lucide-react";
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

  // Phí vận chuyển: Miễn phí từ 500k, còn lại 30k
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  const finalTotal = totalAmount + shippingFee;

  useEffect(() => {
    // Nếu không có hàng trong giỏ, quay lại trang giỏ hàng
    if (!cartLoading && items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate, cartLoading]);

  const handlePlaceOrder = async (values: { address: string; notes?: string }) => {
    if (!user) return message.error("Vui lòng đăng nhập để tiếp tục!");

    try {
      setLoading(true);
      const response = await api.post("/orders/checkout", {
        shipping_info: {
          name: user.name,
          phone: user.phone || "Chưa cập nhật",
          address: values.address,
        },
        notes: values.notes, 
        payment_method: "cod",
      });

      if (response.data && response.data.order) {
        message.success("Đặt hàng thành công! Đơn hàng đang được chuẩn bị ✨");
        await clearCart();
        
        // Truyền toàn bộ dữ liệu đơn hàng sang trang Success
        navigate("/checkout/success", { 
          state: { order: response.data.order } 
        });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 || !user) return null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* Header điều hướng */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <Button 
              type="text" 
              icon={<ChevronLeft size={18} />} 
              onClick={() => navigate("/cart")}
              className="text-gray hover:text-primary p-0 flex items-center mb-2 transition-colors font-medium"
            >
              Quay lại giỏ hàng
            </Button>
            <Title level={2} className="!font-serif !text-charcoal !m-0 tracking-tight">Thanh toán</Title>
          </div>
          <div className="w-full md:w-72">
            <Steps current={0} size="small" className="muse-steps">
              <Step title="Thông tin giao hàng" />
              <Step title="Hoàn tất" />
            </Steps>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          {/* CỘT TRÁI: FORM ĐỊA CHỈ VÀ GHI CHÚ */}
          <Col xs={24} lg={14}>
            <div className="space-y-6">
              <Card className="border border-gray/10 shadow-sm rounded-2xl bg-white overflow-hidden" bodyStyle={{ padding: 0 }}>
                <div className="bg-primary/5 p-5 border-b border-gray/10 flex items-center gap-3">
                  <User size={18} className="text-primary" />
                  <Text strong className="text-primary uppercase tracking-widest text-xs">Thông tin người nhận</Text>
                </div>
                
                <div className="p-6 md:p-8">
                  {/* Thông tin mặc định từ hệ thống */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-1 bg-background p-4 rounded-xl border border-gray/10">
                      <Text className="text-gray text-[10px] uppercase tracking-widest block">Họ và tên</Text>
                      <Paragraph className="!mb-0 font-medium text-charcoal text-base font-serif">{user.name}</Paragraph>
                    </div>
                    <div className="space-y-1 bg-background p-4 rounded-xl border border-gray/10">
                      <Text className="text-gray text-[10px] uppercase tracking-widest block">Số điện thoại</Text>
                      <Paragraph className="!mb-0 font-medium text-charcoal text-base">
                         {user.phone || <Text type="danger" className="text-xs italic">Chưa cập nhật</Text>}
                      </Paragraph>
                    </div>
                    <div className="md:col-span-2 space-y-1 bg-background p-4 rounded-xl border border-gray/10">
                      <Text className="text-gray text-[10px] uppercase tracking-widest block">Email</Text>
                      <Paragraph className="!mb-0 font-medium text-charcoal text-base">{user.email}</Paragraph>
                    </div>
                  </div>

                  <Divider className="border-gray/10" />

                  {/* Form nhập Địa chỉ & Notes */}
                  <Form form={form} layout="vertical" onFinish={handlePlaceOrder} requiredMark={false} className="mt-8">
                    <Form.Item
                      name="address"
                      label={<Text strong className="text-charcoal flex items-center gap-2"><MapPin size={16} className="text-gray" /> Địa chỉ giao hàng</Text>}
                      rules={[{ required: true, message: "Vui lòng nhập địa chỉ nhận hàng!" }]}
                    >
                      <Input.TextArea 
                        rows={3} 
                        placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." 
                        className="rounded-lg border-gray/20 focus:border-primary focus:shadow-none p-4 text-base"
                      />
                    </Form.Item>

                    <Form.Item
                      name="notes"
                      label={<Text strong className="text-charcoal flex items-center gap-2"><StickyNote size={16} className="text-gray" /> Ghi chú cho đơn hàng</Text>}
                    >
                      <Input.TextArea 
                        rows={2} 
                        placeholder="Hướng dẫn giao hàng chi tiết, thời gian nhận hàng lý tưởng..." 
                        className="rounded-lg border-gray/20 focus:border-primary focus:shadow-none p-4 text-base"
                      />
                    </Form.Item>

                    {/* Phương thức thanh toán mặc định */}
                    <div className="bg-primary/5 p-5 rounded-xl flex gap-4 items-center border border-primary/20 mt-8">
                      <div className="bg-white p-3 rounded-lg shadow-sm text-primary flex items-center justify-center border border-gray/5">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <Text strong className="text-charcoal block text-sm">Thanh toán khi nhận hàng (COD)</Text>
                        <Text type="secondary" className="text-xs">Thanh toán bằng tiền mặt khi đơn hàng được giao đến bạn.</Text>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="bg-primary border-primary hover:bg-primary/90 h-14 rounded-lg font-medium text-base mt-10 transition-all"
                    >
                      Xác nhận đặt hàng
                    </Button>
                  </Form>
                </div>
              </Card>
            </div>
          </Col>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <Col xs={24} lg={10}>
            <Card className="border border-gray/10 shadow-sm rounded-2xl sticky top-24 overflow-hidden bg-white" bodyStyle={{ padding: 0 }}>
              <div className="p-6 bg-background border-b border-gray/10 flex items-center gap-3">
                <PackageCheck size={18} className="text-primary" />
                <Title level={4} className="!font-serif !text-charcoal !m-0">Đơn hàng của bạn</Title>
              </div>
              
              <div className="p-6">
                {/* Danh sách SP rút gọn */}
                <div className="max-h-[350px] overflow-y-auto mb-6 pr-2 space-y-4 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.variant_id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray/5 border border-gray/10 flex-shrink-0">
                        <img 
                          src={getImageUrl(item.image_url || "")} 
                          alt={item.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm text-charcoal truncate font-serif mb-1">{item.name}</Text>
                        <Text type="secondary" className="text-xs block bg-background inline-block px-2 py-0.5 rounded-md border border-gray/10">
                          {item.variant_name} • SL: {item.quantity}
                        </Text>
                      </div>
                      <Text className="font-medium text-charcoal text-sm">{formatCurrency(Number(item.price) * item.quantity)}</Text>
                    </div>
                  ))}
                </div>

                {/* Tính toán tiền */}
                <div className="space-y-4 bg-background p-6 rounded-xl border border-gray/10">
                  <div className="flex justify-between items-center text-sm">
                    <Text className="text-gray">Tạm tính</Text>
                    <Text className="text-charcoal font-medium">{formatCurrency(subtotal)}</Text>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <Text className="text-primary font-medium">Giảm giá</Text>
                      <Text className="text-primary font-medium">-{formatCurrency(discount)}</Text>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <Text className="text-gray">Phí vận chuyển</Text>
                    <Text className="text-charcoal font-medium">
                      {shippingFee === 0 ? (
                        <Tag className="bg-primary/10 text-primary border-none rounded-md m-0 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">Miễn phí</Tag>
                      ) : (
                        formatCurrency(shippingFee)
                      )}
                    </Text>
                  </div>

                  <Divider className="my-4 border-gray/10" />

                  <div className="flex justify-between items-end">
                    <Text className="text-charcoal font-serif text-lg font-medium">Tổng cộng</Text>
                    <div className="text-right">
                       <Text className="text-2xl font-serif text-primary font-medium block leading-none mb-1">
                        {formatCurrency(finalTotal)}
                      </Text>
                      <Text className="text-[11px] text-gray italic block mt-2">Đã bao gồm thuế (nếu có)</Text>
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