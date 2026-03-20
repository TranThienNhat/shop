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

// Bóc tách Typography chuẩn để tránh lỗi Skeleton
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
    // Nếu không có hàng trong túi, quay lại trang giỏ hàng
    if (!cartLoading && items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate, cartLoading]);

  const handlePlaceOrder = async (values: { address: string; notes?: string }) => {
    if (!user) return message.error("Nàng vui lòng đăng nhập lại nhé!");

    try {
      setLoading(true);
      // Gửi thông tin ship, ghi chú và phương thức thanh toán về BE
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
        message.success("Đặt hàng thành công! Món quà đang được chuẩn bị ✨");
        await clearCart();
        
        // Truyền toàn bộ dữ liệu đơn hàng sang trang Success
        navigate("/checkout/success", { 
          state: { order: response.data.order } 
        });
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra, nàng kiểm tra lại nhé!");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 || !user) return null;

  return (
    <div className="min-h-screen bg-[#fffafb] py-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        
        {/* Header điều hướng */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <Button 
              type="text" 
              icon={<ChevronLeft size={18} />} 
              onClick={() => navigate("/cart")}
              className="text-gray-400 hover:text-rose-400 p-0 flex items-center mb-2"
            >
              Quay lại túi đồ
            </Button>
            <Title level={2} className="!font-serif !text-charcoal !m-0 tracking-tight">Thanh toán</Title>
          </div>
          <div className="w-full md:w-64">
            <Steps current={0} size="small" className="muse-steps">
              <Step title="Thông tin" />
              <Step title="Hoàn tất" />
            </Steps>
          </div>
        </div>

        <Row gutter={[32, 32]}>
          {/* CỘT TRÁI: FORM ĐỊA CHỈ VÀ GHI CHÚ */}
          <Col xs={24} lg={15}>
            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-[32px] bg-white overflow-hidden">
                <div className="bg-rose-50/50 p-5 border-b border-rose-100 flex items-center gap-2">
                  <User size={18} className="text-rose-400" />
                  <Text strong className="text-rose-400 uppercase tracking-[0.15em] text-[11px]">Thông tin nàng Muse</Text>
                </div>
                
                <div className="p-8">
                  {/* Thông tin mặc định từ hệ thống */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-1">
                      <Text className="text-gray-400 text-[10px] uppercase tracking-widest block">Người nhận</Text>
                      <Paragraph className="!mb-0 font-medium text-charcoal text-base font-serif">{user.name}</Paragraph>
                    </div>
                    <div className="space-y-1">
                      <Text className="text-gray-400 text-[10px] uppercase tracking-widest block">Số điện thoại</Text>
                      <Paragraph className="!mb-0 font-medium text-charcoal text-base">
                         {user.phone || <Text type="danger" className="text-xs italic">Chưa cập nhật số điện thoại</Text>}
                      </Paragraph>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <Text className="text-gray-400 text-[10px] uppercase tracking-widest block">Email</Text>
                      <Paragraph className="!mb-0 font-medium text-charcoal text-base">{user.email}</Paragraph>
                    </div>
                  </div>

                  <Divider className="border-rose-50" />

                  {/* Form nhập Địa chỉ & Notes */}
                  <Form form={form} layout="vertical" onFinish={handlePlaceOrder} requiredMark={false} className="mt-8">
                    <Form.Item
                      name="address"
                      label={<Text strong className="text-charcoal flex items-center gap-2"><MapPin size={16} className="text-rose-300" /> Địa chỉ nhận quà</Text>}
                      rules={[{ required: true, message: "Muse cần địa chỉ để gửi quà đến nàng!" }]}
                    >
                      <Input.TextArea 
                        rows={3} 
                        placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." 
                        className="rounded-2xl border-rose-100 focus:border-rose-300 focus:shadow-none p-4"
                      />
                    </Form.Item>

                    <Form.Item
                      name="notes"
                      label={<Text strong className="text-charcoal flex items-center gap-2"><StickyNote size={16} className="text-rose-300" /> Ghi chú thêm (nếu có)</Text>}
                    >
                      <Input.TextArea 
                        rows={2} 
                        placeholder="Nàng có lời nhắn gì cho Muse hoặc Shipper không?" 
                        className="rounded-2xl border-rose-100 focus:border-rose-300 focus:shadow-none p-4"
                      />
                    </Form.Item>

                    {/* Phương thức thanh toán mặc định */}
                    <div className="bg-rose-50/30 p-5 rounded-2xl flex gap-4 items-center border border-rose-100/50 mt-10">
                      <div className="bg-white p-3 rounded-full shadow-sm text-rose-400 flex items-center justify-center">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <Text strong className="text-charcoal block">Thanh toán khi nhận hàng (COD)</Text>
                        <Text type="secondary" className="text-[11px]">Nàng kiểm tra quà xong rồi mới trả tiền nhé ✨</Text>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      loading={loading}
                      className="bg-rose-400 border-none h-14 rounded-full font-bold uppercase tracking-[0.2em] shadow-lg shadow-rose-100 hover:!bg-rose-500 mt-12 transition-all hover:-translate-y-0.5"
                    >
                      Xác nhận đơn hàng
                    </Button>
                  </Form>
                </div>
              </Card>
            </div>
          </Col>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <Col xs={24} lg={9}>
            <Card className="border-none shadow-sm rounded-[32px] sticky top-24 overflow-hidden bg-white">
              <div className="p-6 bg-rose-50/20 border-b border-rose-50 flex items-center gap-2">
                <PackageCheck size={18} className="text-rose-400" />
                <Title level={4} className="!font-serif !text-charcoal !m-0">Túi đồ của nàng</Title>
              </div>
              
              <div className="p-6">
                {/* Danh sách SP rút gọn */}
                <div className="max-h-[350px] overflow-y-auto mb-8 pr-2 space-y-4 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.variant_id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-rose-50/30 border border-rose-50 flex-shrink-0">
                        <img 
                          src={getImageUrl(item.image_url || "")} 
                          alt={item.name} 
                          className="w-full h-full object-cover transition-transform hover:scale-110" 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm text-charcoal truncate font-serif">{item.name}</Text>
                        <Text type="secondary" className="text-[11px] block">{item.variant_name} • Sl: {item.quantity}</Text>
                      </div>
                      <Text className="font-semibold text-charcoal text-sm">{formatCurrency(Number(item.price) * item.quantity)}</Text>
                    </div>
                  ))}
                </div>

                {/* Tính toán tiền */}
                <div className="space-y-3 bg-gray-50/50 p-6 rounded-[28px]">
                  <div className="flex justify-between items-center text-sm">
                    <Text className="text-gray-400">Tiền hàng</Text>
                    <Text className="text-charcoal font-medium">{formatCurrency(subtotal)}</Text>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <Text className="text-rose-400 font-medium">Mã ưu đãi đã dùng</Text>
                      <Text className="text-rose-400 font-bold">-{formatCurrency(discount)}</Text>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm">
                    <Text className="text-gray-400">Phí vận chuyển</Text>
                    <Text className="text-charcoal font-medium">
                      {shippingFee === 0 ? (
                        <Tag color="green" className="border-none rounded-full mr-0 px-3 text-[10px] uppercase font-bold tracking-wider">Miễn phí</Tag>
                      ) : (
                        formatCurrency(shippingFee)
                      )}
                    </Text>
                  </div>

                  <Divider className="my-4 border-rose-100" />

                  <div className="flex justify-between items-center">
                    <Text className="text-charcoal font-serif text-lg">Tổng cộng</Text>
                    <div className="text-right">
                       <Text className="text-2xl font-serif text-rose-500 font-bold block leading-none mb-1">
                        {formatCurrency(finalTotal)}
                      </Text>
                      <Text className="text-[10px] text-gray-300 italic">Nàng không phát sinh thêm phí nào</Text>
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