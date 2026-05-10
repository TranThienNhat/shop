import React, { useEffect, useState } from "react";
import { Table, Button, Card, Typography, Space, Tag, Modal, message, Tooltip } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;

const PurchaseListPage: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const res = await api.get("/purchase-receipts/all");
      setData(res.data.data);
    } catch (e) {
      message.error("Không thể tải danh sách phiếu nhập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, []);

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Xác nhận xóa phiếu nhập?",
      content: "Hệ thống sẽ hoàn tác (trừ) tồn kho tương ứng. Thao tác này không thể khôi phục.",
      okText: "Xóa",
      okType: "danger",
      onOk: async () => {
        try {
          await api.delete(`/purchase-receipts/${id}`);
          message.success("Xóa phiếu nhập thành công");
          fetchPurchases();
        } catch (e) {
          message.error("Lỗi khi xóa phiếu");
        }
      },
    });
  };

  const columns = [
    { title: "Mã phiếu", dataIndex: "id", key: "id", render: (id: any) => <b>#{id}</b> },
    { title: "Nhà cung cấp", dataIndex: "supplier_name", key: "supplier_name" },
    { title: "Người lập", dataIndex: "user_name", key: "user_name" },
    { 
      title: "Tổng tiền", 
      dataIndex: "total_amount", 
      render: (val: number) => <Tag color="blue">{val?.toLocaleString()}đ</Tag> 
    },
    { 
      title: "Ngày nhập", 
      dataIndex: "created_at", 
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm") 
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa & Hoàn tác kho">
            <Button 
              icon={<EditOutlined />} 
              onClick={() => navigate(`/admin/purchase/edit/${record.id}`)} 
            />
          </Tooltip>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)} 
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card
        title={<Title level={4}>Quản lý Phiếu Nhập Hàng</Title>}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => navigate("/admin/purchase/create")}
          >
            Tạo phiếu mới
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default PurchaseListPage;