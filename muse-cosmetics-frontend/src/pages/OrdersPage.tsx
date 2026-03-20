import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Empty, Tag, Button, Modal, Divider, Row, Col } from "antd";
import { Link, Navigate } from "react-router-dom";
import { ShoppingBag, ChevronRight, Clock, MapPin, Phone, User, Package, CreditCard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Text, Paragraph } = Typography;

const OrdersPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal chi tiết
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) loadOrders();
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/my-orders");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const getStatusTag = (status: string) => {
    const config: Record<string, { color: string; text: string }> = {
      pending: { color: "warning", text: "Chờ xác nhận" },
      processing: { color: "processing", text: "Đang chuẩn bị" },
      shipped: { color: "cyan", text: "Đang giao hàng" },
      completed: { color: "success", text: "Đã hoàn tất" },
      cancelled: { color: "error", text: "Đã hủy" },
    };
    const s = config[status] || config.pending;
    return <Tag color={s.color} className="rounded-full px-3 border-none uppercase text-[10px] font-bold">{s.text}</Tag>;
  };

  if (!authLoading && !isAuthenticated) return <Navigate to="/login" replace />;
  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-[#fffafb] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <Title level={2} className="!font-serif !text-charcoal !mb-2">Đơn hàng của nàng</Title>
          <Text className="text-gray-400 italic">Nơi lưu giữ những món quà xinh đẹp nàng đã chọn ✨</Text>
        </div>

        {orders.length === 0 ? (
          <Empty description="Nàng chưa có đơn hàng nào" className="bg-white p-12 rounded-[32px] shadow-sm">
            <Link to="/products">
              <Button type="primary" className="bg-rose-400 border-none rounded-full px-8 h-11">MUA SẮM NGAY</Button>
            </Link>
          </Empty>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="border-none shadow-sm rounded-[24px] overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => openDetail(order)} // Bấm vào cả card để xem chi tiết
              >
                <div className="flex justify-between items-center mb-6 border-b border-rose-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center">
                      <ShoppingBag size={18} className="text-rose-300" />
                    </div>
                    <div>
                      <Text strong className="block text-charcoal">{order.order_code}</Text>
                      <Text className="text-[11px] text-gray-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                  </div>
                  {getStatusTag(order.status)}
                </div>

                <div className="space-y-4">
                  {order.items.slice(0, 1).map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm text-charcoal truncate">{item.name}</Text>
                        <Text type="secondary" className="text-xs">Số lượng: {item.quantity}</Text>
                      </div>
                      <div className="text-right">
                         <Text className="block font-bold text-rose-400">{formatCurrency(item.price * item.quantity)}</Text>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 1 && (
                    <Text type="secondary" className="text-[11px] italic pl-20">+ và {order.items.length - 1} sản phẩm khác...</Text>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-rose-50 flex justify-between items-center">
                  <Text className="text-rose-300 flex items-center text-xs">
                    Xem chi tiết <ChevronRight size={14} />
                  </Text>
                  <div className="text-right">
                    <Text className="text-gray-400 text-[10px] uppercase block">Tổng thanh toán</Text>
                    <Text className="text-xl font-serif text-rose-500 font-bold">{formatCurrency(order.final_amount)}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* POPUP CHI TIẾT ĐƠN HÀNG */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        centered
        className="muse-modal"
        closeIcon={<div className="bg-rose-50 p-1 rounded-full text-rose-300 hover:text-rose-500 transition-colors">×</div>}
        styles={{ content: { borderRadius: "32px", padding: "0" } }}
      >
        {selectedOrder && (
          <div className="overflow-hidden">
            {/* Header Modal */}
            <div className="bg-rose-50/50 p-8">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={20} className="text-rose-400" />
                    <Title level={4} className="!m-0 !font-serif">Chi tiết đơn hàng</Title>
                  </div>
                  <Text type="secondary" className="text-xs uppercase tracking-widest">{selectedOrder.order_code}</Text>
                </div>
                {getStatusTag(selectedOrder.status)}
              </div>
            </div>

            <div className="p-8">
              <Row gutter={[32, 32]}>
                {/* Thông tin giao hàng */}
                <Col xs={24} md={12}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-400 mb-2">
                      <MapPin size={16} />
                      <Text strong className="uppercase text-[11px] tracking-wider">Thông tin nhận hàng</Text>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                      <div className="flex gap-2">
                        <User size={14} className="text-gray-400 mt-1" />
                        <Text className="text-sm">{selectedOrder.shipping_name}</Text>
                      </div>
                      <div className="flex gap-2">
                        <Phone size={14} className="text-gray-400 mt-1" />
                        <Text className="text-sm">{selectedOrder.shipping_phone}</Text>
                      </div>
                      <div className="flex gap-2">
                        <MapPin size={14} className="text-gray-400 mt-1" />
                        <Text className="text-sm leading-relaxed">{selectedOrder.shipping_address}</Text>
                      </div>
                    </div>
                  </div>
                </Col>

                {/* Phương thức thanh toán */}
                <Col xs={24} md={12}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-400 mb-2">
                      <CreditCard size={16} />
                      <Text strong className="uppercase text-[11px] tracking-wider">Thanh toán</Text>
                    </div>
                    <div className="bg-rose-50/20 p-4 rounded-2xl border border-rose-50">
                      <Text strong className="text-charcoal block mb-1">
                        {selectedOrder.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng'}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {selectedOrder.status === 'completed' ? 'Giao dịch đã hoàn tất' : 'Vui lòng chuẩn bị sẵn tiền mặt khi shipper gọi nhé!'}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider className="my-8 border-rose-50" />

              {/* Danh sách sản phẩm */}
              <Title level={5} className="!font-serif !mb-4">Sản phẩm đã chọn</Title>
              <div className="space-y-4 mb-8">
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-rose-50/30 flex-shrink-0">
                      <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text strong className="block text-sm truncate">{item.name}</Text>
                      <Text type="secondary" className="text-[11px]">x{item.quantity}</Text>
                    </div>
                    <Text className="font-medium text-charcoal">{formatCurrency(item.price * item.quantity)}</Text>
                  </div>
                ))}
              </div>

              {/* Tính toán tiền */}
              <div className="bg-gray-50 p-6 rounded-[24px]">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text className="text-gray-400 text-sm">Tạm tính</Text>
                    <Text className="text-charcoal">{formatCurrency(selectedOrder.total_amount)}</Text>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <Text className="text-rose-400 text-sm">Ưu đãi Muse</Text>
                      <Text className="text-rose-400">-{formatCurrency(selectedOrder.discount_amount)}</Text>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <Text className="text-gray-400 text-sm">Phí vận chuyển</Text>
                    <Text className="text-charcoal">{formatCurrency(selectedOrder.shipping_fee || 0)}</Text>
                  </div>
                  <Divider className="my-3" />
                  <div className="flex justify-between items-end">
                    <Text strong className="text-lg font-serif">Tổng tiền</Text>
                    <Text className="text-2xl font-serif text-rose-500 font-bold">{formatCurrency(selectedOrder.final_amount)}</Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrdersPage;