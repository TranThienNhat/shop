import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Typography,
  message,
  Row,
  Col,
  Space,
  Divider,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { Category, Brand } from "../../types";
import ImageUpload from "../../components/ImageUpload";

const { Title } = Typography;
const { TextArea } = Input;

const ProductFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    loadFormData();
    if (isEdit) {
      loadProduct();
    }
  }, [id]);

  const loadFormData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/brands"),
      ]);
      setCategories(categoriesRes.data.data || []);
      setBrands(brandsRes.data.data || []);
    } catch (error) {
      console.error("Error loading form data:", error);
    }
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data;
      form.setFieldsValue({
        ...productData,
        variants: productData.variants || [{ variant_name: "Mặc định", price: 0, stock_qty: 0 }],
      });
    } catch (error) {
      console.error("Error loading product:", error);
      message.error("Không thể tải thông tin sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const formData = { ...values };

      if (isEdit) {
        await api.put(`/products/${id}`, formData);
        message.success("Cập nhật sản phẩm thành công");
      } else {
        await api.post("/products", formData);
        message.success("Tạo sản phẩm thành công");
      }
      navigate("/admin/products");
    } catch (error: any) {
      message.error(
        error.response?.data?.message || `Không thể ${isEdit ? "cập nhật" : "tạo"} sản phẩm`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/products")}
            className="hover:bg-gray-100"
          />
          <Title level={3} className="!mb-0">
            {isEdit ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </Title>
        </div>
        <Space>
          <Button onClick={() => navigate("/admin/products")}>Hủy</Button>
          <Button type="primary" onClick={() => form.submit()} loading={loading}>
            {isEdit ? "Cập nhật" : "Lưu sản phẩm"}
          </Button>
        </Space>
      </div>

      {/* Main Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          status: "active",
          variants: [{ variant_name: "Mặc định", price: 0, stock_qty: 0 }],
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Cột chính (Bên trái) */}
          <Col xs={24} lg={16} className="space-y-6">
            
            {/* 1. Thông tin cơ bản */}
            <Card title="Thông tin chung" bordered={false} className="shadow-sm">
              <Form.Item
                name="name"
                label="Tên sản phẩm"
                rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
              >
                <Input placeholder="Nhập tên sản phẩm (VD: Sữa rửa mặt Cetaphil...)" size="large" />
              </Form.Item>

              <Form.Item name="description" label="Mô tả chi tiết" className="!mb-0">
                <TextArea rows={8} placeholder="Nhập mô tả chi tiết về thành phần, công dụng..." />
              </Form.Item>
            </Card>

            {/* 2. Hình ảnh sản phẩm */}
            <Card title="Hình ảnh sản phẩm" bordered={false} className="shadow-sm">
              <Form.Item name="gallery" className="!mb-0">
                <ImageUpload />
              </Form.Item>
            </Card>

            {/* 3. Biến thể sản phẩm */}
            <Card title="Biến thể sản phẩm (SKU, Giá, Tồn kho)" bordered={false} className="shadow-sm">
              <Form.List name="variants">
                {(fields, { add, remove }) => (
                  <div className="space-y-4">
                    {fields.map(({ key, name, ...restField }, index) => (
                      <div key={key} className="p-4 bg-gray-50 border border-gray-200 rounded-lg relative">
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                            className="absolute top-2 right-2 z-10"
                          />
                        )}
                        
                        <Row gutter={16}>
                          <Col xs={24} sm={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "variant_name"]}
                              label="Tên phân loại"
                              rules={[{ required: true, message: "Nhập tên phân loại" }]}
                            >
                              <Input placeholder="VD: Tuýp 30g, Màu 01..." />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={12}>
                            <Form.Item {...restField} name={[name, "sku"]} label="Mã SKU">
                              <Input placeholder="VD: SP001-30G" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Row gutter={16}>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "price"]}
                              label="Giá bán"
                              rules={[{ required: true, message: "Nhập giá bán" }]}
                            >
                              <InputNumber
                                style={{ width: "100%" }}
                                min={0}
                                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                parser={(v) => v!.replace(/,*/g, "")}
                                addonAfter="VNĐ"
                              />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item
                              {...restField}
                              name={[name, "stock_qty"]}
                              label="Tồn kho"
                              rules={[{ required: true, message: "Nhập số lượng" }]}
                            >
                              <InputNumber style={{ width: "100%" }} min={0} />
                            </Form.Item>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Form.Item {...restField} name={[name, "variant_image"]} label="Ảnh biến thể (URL)">
                              <Input placeholder="https://..." />
                            </Form.Item>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    
                    <Button
                      type="dashed"
                      onClick={() => add({ variant_name: "", price: 0, stock_qty: 0 })}
                      block
                      icon={<PlusOutlined />}
                      size="large"
                      className="mt-2"
                    >
                      Thêm phân loại mới
                    </Button>
                  </div>
                )}
              </Form.List>
            </Card>

          </Col>

          {/* Cột phụ (Bên phải) */}
          <Col xs={24} lg={8} className="space-y-6">
            
            {/* Trạng thái */}
            <Card title="Trạng thái" bordered={false} className="shadow-sm">
              <Form.Item name="status" className="!mb-0">
                <Select size="large">
                  <Select.Option value="active">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Hiển thị
                    </span>
                  </Select.Option>
                  <Select.Option value="hidden">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                      Ẩn sản phẩm
                    </span>
                  </Select.Option>
                </Select>
              </Form.Item>
            </Card>

            {/* Phân loại */}
            <Card title="Tổ chức sản phẩm" bordered={false} className="shadow-sm">
              <Form.Item
                name="category_id"
                label="Danh mục"
                rules={[{ required: true, message: "Vui lòng chọn danh mục" }]}
              >
                <Select placeholder="Chọn danh mục" size="large" showSearch optionFilterProp="children">
                  {categories.map((category) => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="brand_id" label="Thương hiệu" className="!mb-0">
                <Select placeholder="Chọn thương hiệu" size="large" showSearch optionFilterProp="children">
                  {brands.map((brand) => (
                    <Select.Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>

          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductFormPage;