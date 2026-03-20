import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Select,
  Tag,
  Image,
  Popconfirm,
  message,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { getImageUrl, formatCurrency } from "../../utils/helpers";
import { Product } from "../../types";

const { Title } = Typography;
const { Search } = Input;

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products?limit=1000&status=all");
      setProducts(response.data.data || []);
    } catch (error) {
      console.error("Error loading products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      message.success("Xóa sản phẩm thành công");
      loadProducts();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa sản phẩm");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Hình ảnh",
      key: "image",
      width: 80,
      render: (_: any, record: Product) => {
        const mainImg = record.galleries?.find((g) => g.is_main === 1) || record.galleries?.[0];
        return (
          <Image
            src={getImageUrl(mainImg?.image_url || "")}
            alt="Product"
            width={50}
            height={50}
            className="object-cover rounded"
            fallback="/placeholder-product.jpg"
          />
        );
      },
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Product) => (
        <Link to={`/admin/products/${record.id}/edit`} className="text-primary">
          {name}
        </Link>
      ),
    },
    {
      title: "Giá (thấp nhất)",
      dataIndex: "min_price",
      key: "min_price",
      render: (price: number) => (price != null ? formatCurrency(price) : "-"),
      sorter: (a: Product, b: Product) => (a.min_price ?? 0) - (b.min_price ?? 0),
    },
    {
      title: "Tồn kho",
      dataIndex: "total_stock",
      key: "total_stock",
      render: (stock: number) => stock ?? 0,
      sorter: (a: Product, b: Product) => (a.total_stock ?? 0) - (b.total_stock ?? 0),
    },
    {
      title: "Biến thể",
      key: "variants",
      render: (_: any, record: Product) => record.variants?.length ?? 0,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "default"}>
          {status === "active" ? "Hiển thị" : "Ẩn"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_: any, record: Product) => (
        <Space>
          <Link to={`/admin/products/${record.id}/edit`}>
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Link>
          <Popconfirm
            title="Bạn có chắc muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy">
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2} className="!mb-0">
          Quản lý sản phẩm
        </Title>
        <Link to="/admin/products/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Search
            placeholder="Tìm kiếm sản phẩm..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            value={statusFilter}
            onChange={setStatusFilter}>
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="active">Hiển thị</Select.Option>
            <Select.Option value="hidden">Ẩn</Select.Option>
          </Select>
          <Button icon={<SearchOutlined />} onClick={loadProducts}>
            Làm mới
          </Button>
        </div>

        <Table
          dataSource={filteredProducts}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} sản phẩm`,
          }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default ProductsPage;