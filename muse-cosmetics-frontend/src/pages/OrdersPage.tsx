import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Spin,
  Empty,
  Tag,
  Collapse,
  Row,
  Col,
  Button,
} from "antd";
import { Link, Navigate } from "react-router-dom";
import { Package, Calendar, MapPin, CreditCard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Order } from "../types";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const OrdersPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/my-orders");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "orange";
      case "confirmed":
        return "blue";
      case "shipping":
        return "cyan";
      case "delivered":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipping":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <Navigate to="/login" state={{ from: { pathname: "/orders" } }} replace />
    );
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8">
        <Title level={1} className="!text-charcoal !mb-8 font-serif">
          Đơn hàng của tôi
        </Title>

        {orders.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="text-center">
                <Title level={3} className="!text-charcoal !mb-2">
                  Chưa có đơn hàng nào
                </Title>
                <Paragraph className="text-gray mb-6">
                  Bạn chưa có đơn hàng nào. Hãy khám phá các sản phẩm tuyệt vời
                  của chúng tôi!
                </Paragraph>
                <Link to="/products">
                  <Button
                    type="primary"
                    size="large"
                    className="bg-primary border-primary">
                    Bắt đầu mua sắm
                  </Button>
                </Link>
              </div>
            }
          />
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="border-0 shadow-sm">
                <div className="space-y-4">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <Title level={4} className="!text-charcoal !mb-1">
                        Đơn hàng #{order.id}
                      </Title>
                      <div className="flex items-center gap-4 text-gray text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(order.created_at).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard size={14} />
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                    </div>
                    <Tag
                      color={getStatusColor(order.status)}
                      className="text-sm">
                      {getStatusText(order.status)}
                    </Tag>
                  </div>

                  {/* Order Items Preview */}
                  <div className="space-y-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
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
                          <p className="text-charcoal font-medium line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-gray text-sm">
                            {formatCurrency(item.price)} x {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-charcoal font-semibold">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {order.items.length > 2 && (
                      <p className="text-gray text-sm text-center">
                        và {order.items.length - 2} sản phẩm khác...
                      </p>
                    )}
                  </div>

                  {/* Order Details Collapse */}
                  <Collapse ghost>
                    <Panel header="Xem chi tiết đơn hàng" key="details">
                      <div className="space-y-6">
                        {/* All Items */}
                        <div>
                          <Title level={5} className="!text-charcoal !mb-4">
                            Sản phẩm đã đặt
                          </Title>
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0">
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
                                  <p className="text-charcoal font-medium text-sm line-clamp-1">
                                    {item.name}
                                  </p>
                                  <p className="text-gray text-xs">
                                    {formatCurrency(item.price)} x{" "}
                                    {item.quantity}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-charcoal font-semibold text-sm">
                                    {formatCurrency(item.price * item.quantity)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping Info */}
                        <div>
                          <Title level={5} className="!text-charcoal !mb-4">
                            <MapPin size={16} className="inline mr-2" />
                            Thông tin giao hàng
                          </Title>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-charcoal">
                              <strong>Địa chỉ:</strong> {order.shipping_address}
                            </p>
                            <p className="text-charcoal mt-1">
                              <strong>Số điện thoại:</strong> {order.phone}
                            </p>
                          </div>
                        </div>

                        {/* Order Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between text-lg">
                            <span className="text-charcoal font-semibold">
                              Tổng cộng:
                            </span>
                            <span className="text-primary font-bold">
                              {formatCurrency(order.total_amount)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Panel>
                  </Collapse>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
