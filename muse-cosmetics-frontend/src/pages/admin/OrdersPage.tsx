import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Select,
  Tag,
  message,
  Card,
  Modal,
  Descriptions,
} from "antd";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import api from "../../utils/api";
import { formatCurrency } from "../../utils/helpers";

const { Title } = Typography;
const { Search } = Input;

interface Order {
  id: number;
  code: string;
  user_id: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_email: string;
  note: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      message.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.put(`/orders/${orderId}`, { status: newStatus });
      message.success("Cập nhật trạng thái đơn hàng thành công");
      loadOrders();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái"
      );
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.code.toLowerCase().includes(searchText.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "orange",
      confirmed: "blue",
      shipping: "purple",
      completed: "green",
      cancelled: "red",
      refunded: "gray",
    };
    return colors[status as keyof typeof colors] || "default";
  };

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return texts[status as keyof typeof texts] || status;
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "code",
      key: "code",
      render: (code: string) => (
        <span className="font-mono text-primary">{code}</span>
      ),
    },
    {
      title: "Khách hàng",
      dataIndex: "shipping_name",
      key: "customer",
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total: number) => formatCurrency(total),
      sorter: (a: Order, b: Order) => a.total - b.total,
    },
    {
      title: "Thanh toán",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status: string) => {
        const colors = {
          Unpaid: "red",
          Paid: "green",
          Refunded: "gray",
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Order) => (
        <Select
          value={status}
          style={{ width: 120 }}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          size="small">
          <Select.Option value="pending">Chờ xử lý</Select.Option>
          <Select.Option value="confirmed">Đã xác nhận</Select.Option>
          <Select.Option value="shipping">Đang giao</Select.Option>
          <Select.Option value="completed">Hoàn thành</Select.Option>
          <Select.Option value="cancelled">Đã hủy</Select.Option>
          <Select.Option value="refunded">Đã hoàn tiền</Select.Option>
        </Select>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a: Order, b: Order) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_: any, record: Order) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewOrder(record)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2} className="!mb-0">
          Quản lý đơn hàng
        </Title>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Search
            placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
            allowClear
            style={{ width: 400 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}>
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="confirmed">Đã xác nhận</Select.Option>
            <Select.Option value="shipping">Đang giao</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>
          <Button icon={<SearchOutlined />} onClick={loadOrders}>
            Làm mới
          </Button>
        </div>

        <Table
          dataSource={filteredOrders}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={`Chi tiết đơn hàng ${selectedOrder?.code}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={800}>
        {selectedOrder && (
          <div className="space-y-6">
            <Descriptions title="Thông tin đơn hàng" bordered column={2}>
              <Descriptions.Item label="Mã đơn">
                {selectedOrder.code}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Tạm tính">
                {formatCurrency(selectedOrder.subtotal)}
              </Descriptions.Item>
              <Descriptions.Item label="Phí vận chuyển">
                {formatCurrency(selectedOrder.shipping_fee)}
              </Descriptions.Item>
              <Descriptions.Item label="Giảm giá">
                {formatCurrency(selectedOrder.discount_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng cộng">
                <strong>{formatCurrency(selectedOrder.total)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức thanh toán">
                {selectedOrder.payment_method}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                <Tag
                  color={
                    selectedOrder.payment_status === "Paid" ? "green" : "red"
                  }>
                  {selectedOrder.payment_status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="Thông tin giao hàng" bordered column={1}>
              <Descriptions.Item label="Tên người nhận">
                {selectedOrder.shipping_name}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedOrder.shipping_phone}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedOrder.shipping_email}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {selectedOrder.shipping_address}
              </Descriptions.Item>
              {selectedOrder.note && (
                <Descriptions.Item label="Ghi chú">
                  {selectedOrder.note}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
