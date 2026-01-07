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
import { Category } from "../../types";
import ImageUpload from "../../components/ImageUpload";

const { Title } = Typography;
const { Search } = Input;
const { TextArea } = Input;

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log("Loading categories...");
      const response = await api.get("/categories");
      console.log("Categories response:", response.data);
      setCategories(response.data.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      message.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      message.success("Xóa danh mục thành công");
      loadCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Không thể xóa danh mục");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log("Submitting category:", values);
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, values);
        message.success("Cập nhật danh mục thành công");
      } else {
        const response = await api.post("/categories", values);
        console.log("Create response:", response.data);
        message.success("Tạo danh mục thành công");
      }
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      loadCategories();
    } catch (error: any) {
      console.error("Error submitting category:", error);
      message.error(
        error.response?.data?.message ||
          `Không thể ${editingCategory ? "cập nhật" : "tạo"} danh mục`
      );
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Hình ảnh",
      dataIndex: "image_url",
      key: "image",
      width: 80,
      render: (imageUrl: string) => (
        <Image
          src={getImageUrl(imageUrl)}
          alt="Category"
          width={50}
          height={50}
          className="object-cover rounded"
          fallback="/placeholder-category.jpg"
        />
      ),
    },
    {
      title: "Tên danh mục",
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
      render: (_: any, record: Category) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa danh mục này?"
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
          Quản lý danh mục
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm danh mục
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <Search
            placeholder="Tìm kiếm danh mục..."
            allowClear
            style={{ width: 300 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Button icon={<SearchOutlined />} onClick={loadCategories}>
            Làm mới
          </Button>
        </div>

        <Table
          dataSource={filteredCategories}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} danh mục`,
          }}
        />
      </Card>

      <Modal
        title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: "Vui lòng nhập tên danh mục" }]}>
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="slug"
            label="Slug (URL)"
            rules={[{ required: true, message: "Vui lòng nhập slug" }]}>
            <Input placeholder="danh-muc-moi" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả về danh mục" />
          </Form.Item>

          <Form.Item name="image_url" label="Hình ảnh">
            <ImageUpload />
          </Form.Item>

          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                setModalVisible(false);
                setEditingCategory(null);
                form.resetFields();
              }}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              {editingCategory ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
