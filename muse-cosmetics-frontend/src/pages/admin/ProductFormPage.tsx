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
  Switch,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import { Product, Category, Brand } from "../../types";
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
  const [product, setProduct] = useState<Product | null>(null);

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
      console.log("Loaded product data:", productData);
      setProduct(productData);
      form.setFieldsValue({
        ...productData,
        has_sale_price: !!productData.sale_price,
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
      const formData = {
        ...values,
        sale_price: values.has_sale_price ? values.sale_price : null,
      };
      delete formData.has_sale_price;

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
        error.response?.data?.message ||
          `Không thể ${isEdit ? "cập nhật" : "tạo"} sản phẩm`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/products")}>
          Quay lại
        </Button>
        <Title level={2} className="!mb-0">
          {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        </Title>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "in_stock",
            stock_qty: 0,
            sold_qty: 0,
            has_sale_price: false,
          }}>
          <Row gutter={[24, 0]}>
            <Col xs={24} lg={16}>
              <Card title="Thông tin cơ bản" className="mb-6">
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên sản phẩm" },
                  ]}>
                  <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Form.Item
                  name="slug"
                  label="Slug (URL)"
                  rules={[{ required: true, message: "Vui lòng nhập slug" }]}>
                  <Input placeholder="san-pham-moi" />
                </Form.Item>

                <Form.Item name="short_description" label="Mô tả ngắn">
                  <TextArea rows={3} placeholder="Mô tả ngắn về sản phẩm" />
                </Form.Item>

                <Form.Item name="content" label="Nội dung chi tiết">
                  <TextArea rows={6} placeholder="Mô tả chi tiết về sản phẩm" />
                </Form.Item>
              </Card>

              <Card title="Thông tin bổ sung">
                <Row gutter={[16, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item name="capacity" label="Dung tích">
                      <Input placeholder="50ml, 100ml..." />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="color" label="Màu sắc">
                      <Input placeholder="Đỏ, Xanh..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="ingredients" label="Thành phần">
                  <TextArea rows={4} placeholder="Danh sách thành phần" />
                </Form.Item>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card title="Phân loại & Giá" className="mb-6">
                <Form.Item
                  name="category_id"
                  label="Danh mục"
                  rules={[
                    { required: true, message: "Vui lòng chọn danh mục" },
                  ]}>
                  <Select placeholder="Chọn danh mục">
                    {categories.map((category) => (
                      <Select.Option key={category.id} value={category.id}>
                        {category.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="brand_id" label="Thương hiệu">
                  <Select placeholder="Chọn thương hiệu">
                    {brands.map((brand) => (
                      <Select.Option key={brand.id} value={brand.id}>
                        {brand.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="price"
                  label="Giá gốc"
                  rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="0"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>

                <Form.Item name="has_sale_price" valuePropName="checked">
                  <Switch /> Có giá khuyến mãi
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.has_sale_price !== currentValues.has_sale_price
                  }>
                  {({ getFieldValue }) =>
                    getFieldValue("has_sale_price") ? (
                      <Form.Item name="sale_price" label="Giá khuyến mãi">
                        <InputNumber
                          style={{ width: "100%" }}
                          placeholder="0"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>

                <Form.Item name="cost" label="Giá vốn">
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="0"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Card>

              <Card title="Kho hàng & Trạng thái" className="mb-6">
                <Form.Item name="stock_qty" label="Số lượng tồn kho">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>

                <Form.Item name="sold_qty" label="Đã bán">
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>

                <Form.Item name="status" label="Trạng thái">
                  <Select>
                    <Select.Option value="in_stock">Còn hàng</Select.Option>
                    <Select.Option value="out_of_stock">Hết hàng</Select.Option>
                    <Select.Option value="hidden">Ẩn</Select.Option>
                  </Select>
                </Form.Item>
              </Card>

              <Card title="Hình ảnh">
                <Form.Item name="image_url" label="Hình ảnh sản phẩm">
                  <ImageUpload />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <div className="flex justify-end gap-4 mt-6">
            <Button onClick={() => navigate("/admin/products")}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ProductFormPage;
