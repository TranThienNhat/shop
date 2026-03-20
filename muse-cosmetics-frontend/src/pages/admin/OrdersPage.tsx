import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
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
  order_code: string;
  user_id: number;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  coupon_id?: number;
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  created_at: string;
  items: any[];
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
      const currentOrder = orders.find((order) => order.id === orderId);

      if (
        currentOrder &&
        (currentOrder.status === "cancelled" ||
          currentOrder.status === "completed")
      ) {
        message.error(
          "Không thể thay đổi trạng thái đơn hàng đã hủy hoặc hoàn tất"
        );
        return;
      }

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
      searchText.trim() === "" ||
      order.order_code.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "orange",
      processing: "blue",
      shipped: "cyan",
      completed: "green",
      cancelled: "red",
    };
    return colors[status] || "default";
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      pending: "Chờ xử lý",
      processing: "Đang xử lý",
      shipped: "Đang giao",
      completed: "Hoàn thành",
      cancelled: "Đã hủy",
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: "Mã đơn",
      dataIndex: "order_code",
      key: "order_code",
      render: (order_code: string) => (
        <span className="font-mono text-primary">{order_code}</span>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "final_amount",
      key: "final_amount",
      render: (final_amount: number) => formatCurrency(final_amount),
      sorter: (a: Order, b: Order) => a.final_amount - b.final_amount,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: Order) => {
        const isDisabled = status === "cancelled" || status === "completed";

        if (isDisabled) {
          return (
            <Tag color={getStatusColor(status)}>
              {getStatusText(status)}
            </Tag>
          );
        }

        return (
          <Select
            value={status}
            onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
            size="small"
            bordered={false}
            suffixIcon={null}
            style={{ width: "auto", minWidth: "120px" }}
            className="status-select"
            dropdownStyle={{ minWidth: "140px" }}
            optionLabelProp="label">
            {(["pending", "processing", "shipped", "completed", "cancelled"] as const).map((s) => (
              <Select.Option
                key={s}
                value={s}
                label={<Tag color={getStatusColor(s)} className="m-0 border-0">{getStatusText(s)}</Tag>}>
                <Tag color={getStatusColor(s)} className="m-0">{getStatusText(s)}</Tag>
              </Select.Option>
            ))}
          </Select>
        );
      },
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
    <>
      <style>
        {`
          .status-select .ant-select-selector {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            height: auto !important;
          }
          .status-select .ant-select-selection-item {
            padding: 0 !important;
          }
          .status-select:hover .ant-select-selector {
            border: none !important;
          }
          .status-select.ant-select-focused .ant-select-selector {
            border: none !important;
            box-shadow: none !important;
          }
          .status-select .ant-select-arrow {
            display: none;
          }
        `}
      </style>
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
              <Select.Option value="processing">Đang xử lý</Select.Option>
              <Select.Option value="shipped">Đang giao</Select.Option>
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
            locale={{
              emptyText:
                filteredOrders.length === 0 && orders.length > 0
                  ? `Không tìm thấy đơn hàng phù hợp với "${searchText}" và trạng thái "${
                      statusFilter === "all" ? "tất cả" : statusFilter
                    }"`
                  : "Chưa có đơn hàng nào",
            }}
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
          title={`Chi tiết đơn hàng ${selectedOrder?.order_code}`}
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
                  {selectedOrder.order_code}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền hàng">
                  {formatCurrency(selectedOrder.total_amount)}
                </Descriptions.Item>
                <Descriptions.Item label="Giảm giá">
                  {formatCurrency(selectedOrder.discount_amount)}
                </Descriptions.Item>
                <Descriptions.Item label="Thực trả" span={2}>
                  <strong>{formatCurrency(selectedOrder.final_amount)}</strong>
                </Descriptions.Item>
              </Descriptions>

              {selectedOrder.items?.length > 0 && (
                <Descriptions title="Sản phẩm" bordered column={1}>
                  {selectedOrder.items.map((item: any) => (
                    <Descriptions.Item key={item.id} label={item.name}>
                      {item.variant_name && <span className="text-gray mr-2">({item.variant_name})</span>}
                      {formatCurrency(item.price)} x {item.quantity}
                    </Descriptions.Item>
                  ))}
                </Descriptions>
              )}
            </div>
          )}
        </Modal>
      </div>
    </>
  );
};

export default AdminOrdersPage;
