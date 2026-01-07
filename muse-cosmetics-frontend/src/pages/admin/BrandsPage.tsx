import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Typography,
  Input,
  Popconfirm,
  message,
  Card,
  Modal,
  Form,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import api from "../../utils/api";
import { getImageUrl } from "../../utils/helpers";
import { Brand } from "../../types";
import ImageUpload from "../../components/ImageUpload";

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await api.get("/brands");
      setBrands(response.data.data || []);
    } catch (error) {
      console.error("Error loading brands:", error);
      message.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/brands/${id}`);
      message.success("Xóa thương hiệu thành công");
      loadBrands();
    } catch (error: any) {
      message.error(
        error.response?.data?.message || "Không thể xóa thương hiệu"
      );
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, values);
        message.success("Cập nhật thương hiệu thành công");
      } else {
        await api.post("/brands", values);
        message.success("Tạo thương hiệu thành công");
      }
      setModalVisible(false);
      setEditingBrand(null);
      form.resetFields();
      loadBrands();
    } catch (error: any) {
      message.error(
        error.response?.data?.message ||
          `Không thể ${editingBrand ? "cập nhật" : "tạo"} thương hiệu`
      );
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    form.setFieldsValue(brand);
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingBrand(null);
    form.resetFields();
    setModalVisible(true);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Logo",
      dataIndex: "image_url",
      key: "image",
      width: 80,
      render: (imageUrl: string) => (
        <Image
          src={getImageUrl(imageUrl)}
          alt="Brand"
          width={50}
          height={50}
          className="object-cover rounded"
          fallback="/placeholder-brand.jpg"
        />
      ),
    },
    {
      title: "Tên thương hiệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description: string) =>
        description ? (
          <div className="max-w-xs truncate">{description}</div>
        ) : (
          "-"
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_: any, record: Brand) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa thương hiệu này?"
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
          Quản lý thương hiệu
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm thương hiệu
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Search
            placeholder="Tìm kiếm thương hiệu..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<SearchOutlined />} onClick={loadBrands}>
            Làm mới
          </Button>
        </div>

        <Table
          dataSource={filteredBrands}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} thương hiệu`,
          }}
        />
      </Card>

      <Modal
        title={editingBrand ? "Sửa thương hiệu" : "Thêm thương hiệu mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingBrand(null);
          form.resetFields();
        }}
        footer={null}
        width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên thương hiệu"
            rules={[
              { required: true, message: "Vui lòng nhập tên thương hiệu" },
            ]}>
            <Input placeholder="Nhập tên thương hiệu" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[{ required: true, message: "Vui lòng nhập slug" }]}>
            <Input placeholder="thuong-hieu-moi" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả về thương hiệu" />
          </Form.Item>

          <Form.Item name="image_url" label="Logo thương hiệu">
            <ImageUpload />
          </Form.Item>

          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                setModalVisible(false);
                setEditingBrand(null);
                form.resetFields();
              }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingBrand ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BrandsPage;
