import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, Empty, Tag, Button, Modal, Divider, Row, Col, Rate, Input, message } from "antd";
import { Link, Navigate } from "react-router-dom";
import { ShoppingBag, ChevronRight, Clock, MapPin, Phone, User, Package, CreditCard, Star, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Text, Paragraph } = Typography;

const OrdersPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State cho Modal chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State cho Modal Đánh giá sản phẩm
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({
    variant_id: 0,
    order_id: 0,
    name: "",
    image_url: "",
    rating: 5,
    comment: ""
  });

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

  const handleOpenReview = (item: any, orderId: number) => {
    setReviewData({
      variant_id: item.variant_id,
      order_id: orderId,
      name: item.name,
      image_url: item.image_url,
      rating: 5,
      comment: ""
    });
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      await api.post("/reviews", {
        variant_id: reviewData.variant_id,
        order_id: reviewData.order_id,
        rating: reviewData.rating,
        comment: reviewData.comment || "Sản phẩm tuyệt vời, mình rất ưng ý!"
      });
      
      message.success("Cảm ơn nàng đã chia sẻ cảm nhận ✨");
      setIsReviewModalOpen(false);

      // CẬP NHẬT STATE TẠI CHỖ: Đánh dấu món này đã reviewed để nút biến mất ngay
      const updateReviewStatus = (items: any[]) => 
        items.map(item => item.variant_id === reviewData.variant_id ? { ...item, is_reviewed: true } : item);

      setOrders(prev => prev.map(o => o.id === reviewData.order_id ? { ...o, items: updateReviewStatus(o.items) } : o));
      if (selectedOrder) {
        setSelectedOrder({ ...selectedOrder, items: updateReviewStatus(selectedOrder.items) });
      }

    } catch (error: any) {
      message.error(error.response?.data?.message || "Nàng đã đánh giá món này rồi ạ!");
    } finally {
      setSubmitting(false);
    }
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
  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#fffafb]"><Spin size="large" /></div>;

  return (
    <div className="min-h-screen bg-[#fffafb] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <Title level={2} className="!font-serif !text-charcoal !mb-2 uppercase tracking-widest">Đơn hàng của nàng</Title>
          <div className="w-12 h-1 bg-rose-200 mx-auto mb-4 rounded-full"></div>
          <Text className="text-gray-400 italic">Nơi lưu giữ những món quà xinh đẹp nàng đã chọn cho bản thân ✨</Text>
        </div>

        {orders.length === 0 ? (
          <Empty description="Nàng chưa có đơn hàng nào" className="bg-white p-16 rounded-[40px] shadow-sm border border-rose-50">
            <Link to="/products">
              <Button type="primary" className="bg-rose-400 border-none rounded-full px-10 h-12 font-bold tracking-widest hover:!bg-rose-500 transition-all">MUA SẮM NGAY</Button>
            </Link>
          </Empty>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="border-none shadow-sm rounded-[32px] overflow-hidden hover:shadow-md transition-all cursor-pointer group"
                onClick={() => openDetail(order)}
              >
                <div className="flex justify-between items-center mb-6 border-b border-rose-50 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-300 group-hover:bg-rose-100 transition-colors">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <Text strong className="block text-charcoal">{order.order_code}</Text>
                      <Text className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                        <Clock size={12} /> {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </Text>
                    </div>
                  </div>
                  {getStatusTag(order.status)}
                </div>

                <div className="space-y-4">
                  {order.items.slice(0, 1).map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0 border border-rose-50 p-1">
                        <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Text strong className="block text-sm text-charcoal truncate">{item.name}</Text>
                        <Text type="secondary" className="text-[11px] uppercase tracking-widest">{item.variant_name}</Text>
                        <div className="mt-1"><Text className="text-xs text-gray-400">Số lượng: {item.quantity}</Text></div>
                      </div>
                      <div className="text-right">
                         <Text className="block font-serif text-lg text-rose-500 font-bold">{formatCurrency(Number(item.price) * item.quantity)}</Text>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 1 && (
                    <Text type="secondary" className="text-[11px] italic pl-24 text-rose-300">+ và {order.items.length - 1} món quà khác...</Text>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-rose-50 flex justify-between items-end">
                  <Text className="text-rose-300 flex items-center text-xs font-medium hover:gap-2 transition-all">
                    Xem chi tiết <ChevronRight size={14} />
                  </Text>
                  <div className="text-right">
                    <Text className="text-gray-400 text-[10px] uppercase tracking-widest block mb-1">Tổng thanh toán</Text>
                    <Text className="text-2xl font-serif text-rose-500 font-bold leading-none">{formatCurrency(Number(order.final_amount))}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={750}
        centered
        closeIcon={null}
        styles={{ content: { borderRadius: "40px", padding: "0", overflow: "hidden" } }}
      >
        {selectedOrder && (
          <div>
            {/* Header Modal */}
            <div className="bg-rose-50/50 p-10 border-b border-rose-100 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Package size={24} className="text-rose-400" />
                        <Title level={3} className="!m-0 !font-serif">Thông tin đơn hàng</Title>
                    </div>
                    <Text type="secondary" className="text-[11px] uppercase tracking-[0.3em] font-bold">{selectedOrder.order_code}</Text>
                </div>
                {getStatusTag(selectedOrder.status)}
            </div>

            <div className="p-10">
              <Row gutter={[48, 32]} className="mb-10">
                <Col span={12}>
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin size={16} className="text-rose-400" />
                        <Text strong className="text-[11px] text-rose-400 uppercase tracking-widest">Địa chỉ nhận quà</Text>
                    </div>
                    <div className="bg-gray-50/50 p-6 rounded-[24px] border border-gray-100 space-y-2">
                        <Text strong className="block text-charcoal text-base">{selectedOrder.shipping_name}</Text>
                        <Text className="block text-gray-500 flex items-center gap-2"><Phone size={14}/> {selectedOrder.shipping_phone}</Text>
                        <Text className="block text-gray-400 text-xs italic leading-relaxed">{selectedOrder.shipping_address}</Text>
                    </div>
                </Col>
                <Col span={12}>
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard size={16} className="text-rose-400" />
                        <Text strong className="text-[11px] text-rose-400 uppercase tracking-widest">Hình thức thanh toán</Text>
                    </div>
                    <div className="bg-rose-50/20 p-6 rounded-[24px] border border-rose-50">
                        <Text strong className="block text-charcoal mb-1">
                          {selectedOrder.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản Muse'}
                        </Text>
                        <Text type="secondary" className="block text-[11px] italic">
                          {selectedOrder.status === 'completed' ? 'Giao dịch đã thành công ✨' : 'Nàng chuẩn bị sẵn tiền mặt khi shipper tới nhé!'}
                        </Text>
                    </div>
                </Col>
              </Row>

              <Divider className="border-rose-50" />

              {/* Danh sách sản phẩm trong Modal */}
              <div className="my-10 space-y-6">
                <Title level={5} className="!font-serif !mb-6 text-charcoal flex items-center gap-2">
                    <Star size={18} fill="#fb7185" className="text-rose-400" /> Các món nàng đã chọn
                </Title>
                {selectedOrder.items.map((item: any) => (
                  <div key={item.id} className="flex gap-5 items-center bg-white p-4 rounded-3xl border border-rose-50 hover:border-rose-200 transition-all">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-rose-50/30 flex-shrink-0">
                      <img src={getImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Text strong className="block text-sm truncate">{item.name}</Text>
                      <Tag className="border-none bg-rose-50 text-rose-400 text-[10px] rounded-full uppercase font-bold">
                        {item.variant_name}
                      </Tag>
                      <Text type="secondary" className="text-[11px] ml-2">x{item.quantity}</Text>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-2">
                        <Text className="font-bold text-charcoal">{formatCurrency(Number(item.price) * item.quantity)}</Text>
                        
                        {/* LOGIC NÚT ĐÁNH GIÁ: Nếu completed và chưa reviewed thì mới hiện nút */}
                        {selectedOrder.status === 'completed' && (
                            item.is_reviewed ? (
                                <div className="flex items-center gap-1 text-[10px] text-green-400 font-bold uppercase tracking-tighter bg-green-50 px-3 py-1 rounded-full">
                                    <CheckCircle size={12} /> Đã đánh giá
                                </div>
                            ) : (
                                <Button 
                                    size="small" 
                                    className="bg-rose-400 border-none text-white text-[10px] rounded-full px-4 font-bold uppercase tracking-widest hover:!bg-rose-500 h-8 shadow-sm"
                                    onClick={() => handleOpenReview(item, selectedOrder.id)}
                                >
                                    Viết đánh giá
                                </Button>
                            )
                        )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tổng kết tiền */}
              <div className="bg-gray-50/80 p-8 rounded-[32px] border border-gray-100">
                  <div className="space-y-3">
                      <div className="flex justify-between text-xs text-gray-400">
                        <Text>Giá trị giỏ quà</Text>
                        <Text>{formatCurrency(Number(selectedOrder.total_amount))}</Text>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <Text>Phí vận chuyển</Text>
                        <Text>{formatCurrency(Number(selectedOrder.shipping_fee))}</Text>
                      </div>
                      {Number(selectedOrder.discount_amount) > 0 && (
                        <div className="flex justify-between text-xs text-rose-400 font-medium">
                            <Text>Ưu đãi từ Muse</Text>
                            <Text>-{formatCurrency(Number(selectedOrder.discount_amount))}</Text>
                        </div>
                      )}
                      <Divider className="my-4 border-gray-200" />
                      <div className="flex justify-between items-end">
                        <Text strong className="text-lg font-serif text-charcoal">Tổng thanh toán</Text>
                        <Text className="text-3xl font-serif text-rose-500 font-bold">{formatCurrency(Number(selectedOrder.final_amount))}</Text>
                      </div>
                  </div>
              </div>
              
              <div className="text-center mt-8">
                  <Button type="text" onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-rose-400 uppercase text-[10px] tracking-[0.3em] font-bold">
                    Đóng cửa sổ
                  </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL VIẾT ĐÁNH GIÁ (MUSE STYLE) */}
      <Modal
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        footer={null}
        centered
        width={420}
        styles={{ content: { borderRadius: "48px", padding: "40px" } }}
      >
        <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-[32px] overflow-hidden mb-6 bg-rose-50 p-2 shadow-inner shadow-rose-100/50">
                <img src={getImageUrl(reviewData.image_url)} className="w-full h-full object-cover rounded-[24px]" alt="p" />
            </div>
            <Title level={3} className="!font-serif !mb-2">Nàng thấy sao?</Title>
            <Text type="secondary" className="text-[11px] uppercase tracking-[0.2em] block mb-8 font-bold text-rose-300">{reviewData.name}</Text>
            
            <div className="mb-10">
                <Rate 
                    value={reviewData.rating} 
                    onChange={(val) => setReviewData({...reviewData, rating: val})}
                    className="text-rose-400 text-3xl mb-2" 
                />
                <div className="text-[10px] text-gray-300 uppercase tracking-widest">Chạm để chấm điểm nàng nhé</div>
            </div>

            <Input.TextArea 
                rows={4} 
                placeholder="Chia sẻ cho Muse biết cảm nhận của nàng về món quà này nhé..." 
                className="rounded-[24px] border-rose-100 p-6 mb-8 focus:border-rose-300 focus:shadow-none bg-rose-50/10 text-gray-600 italic"
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
            />

            <Button 
                type="primary" 
                block 
                size="large"
                loading={submitting}
                className="bg-rose-400 border-none h-16 rounded-full font-bold uppercase tracking-[0.2em] shadow-xl shadow-rose-100 hover:!bg-rose-500 transition-all hover:-translate-y-1"
                onClick={handleSubmitReview}
            >
                Gửi lời yêu thương
            </Button>
        </div>
      </Modal>
    </div>
  );
};

export default OrdersPage;