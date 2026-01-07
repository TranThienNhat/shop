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
      const response = await api.get("/products?limit=1000");
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
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image",
      width: 80,
      render: (imageUrl: string) => (
        <Image
          src={getImageUrl(imageUrl)}
          alt="Product"
          width={50}
          height={50}
          className="object-cover rounded"
          fallback="/placeholder-product.jpg"
        />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: Product) => (
        <Link to={`/admin/products/${record.id}`} className="text-primary">
          {name}
        </Link>
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (price: number) => formatCurrency(price),
      sorter: (a: Product, b: Product) => a.price - b.price,
    },
    {
      title: "Giá khuyến mãi",
      dataIndex: "sale_price",
      key: "sale_price",
      render: (salePrice: number) =>
        salePrice ? formatCurrency(salePrice) : "-",
    },
    {
      title: "Tồn kho",
      dataIndex: "stock_qty",
      key: "stock_qty",
      sorter: (a: Product, b: Product) => a.stock_qty - b.stock_qty,
    },
    {
      title: "Đã bán",
      dataIndex: "sold_qty",
      key: "sold_qty",
      sorter: (a: Product, b: Product) => a.sold_qty - b.sold_qty,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const colors = {
          in_stock: "green",
          out_of_stock: "red",
          hidden: "gray",
        };
        const labels = {
          in_stock: "Còn hàng",
          out_of_stock: "Hết hàng",
          hidden: "Ẩn",
        };
        return (
          <Tag color={colors[status as keyof typeof colors]}>
            {labels[status as keyof typeof labels]}
          </Tag>
        );
      },
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
            <Select.Option value="in_stock">Còn hàng</Select.Option>
            <Select.Option value="out_of_stock">Hết hàng</Select.Option>
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
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default ProductsPage;
