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
  Tooltip,
  Modal,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
  PlusSquareOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PurchaseReceiptFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const [quickProductForm] = Form.useForm();
  const [quickVariantForm] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);
  const [products, setProducts] = useState([]); // Danh sách SP để thêm biến thể

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const cardStyle = {
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    border: "1px solid #f0f0f0",
  };

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [sRes, vRes, pRes] = await Promise.all([
        api.get("/suppliers?status=active"),
        api.get("/products/purchase/all-variants"),
        api.get("/products"), // Lấy danh sách sản phẩm (không phải biến thể)
      ]);

      setSuppliers(sRes.data.data || []);
      setVariants(vRes.data.data || []);
      setProducts(pRes.data.data || []);

      if (isEdit) {
        const res = await api.get(`/purchase-receipts/${id}`);
        const data = res.data.data;
        form.setFieldsValue({
          supplier_id: data.supplier_id,
          note: data.note,
          items: data.details.map((d: any) => ({
            product_variant_id: d.product_variant_id,
            quantity: d.quantity,
            unit_price: d.cost_price,
          })),
        });
      }
    } catch (e: any) {
      message.error("Không thể tải dữ liệu trang");
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo nhanh Sản phẩm mới (kèm 1 biến thể mặc định)
  const handleQuickProduct = async (values: any) => {
    try {
      const payload = {
        name: values.name,
        category_id: values.category_id, // Nên có mặc định hoặc chọn
        status: "active",
        variants: [
          {
            variant_name: values.variant_name || "Mặc định",
            price: values.price || 0,
            stock_qty: 0,
          },
        ],
      };
      await api.post("/products", payload);
      message.success("Tạo sản phẩm mới thành công");
      setIsProductModalOpen(false);
      quickProductForm.resetFields();
      loadInitialData(); // Refresh danh sách để chọn
    } catch (e) {
      message.error("Lỗi khi tạo sản phẩm");
    }
  };

  // Hàm tạo nhanh Biến thể mới cho sản phẩm có sẵn
  const handleQuickVariant = async (values: any) => {
    try {
      // Giả sử API update sản phẩm hỗ trợ thêm biến thể hoặc có API riêng
      await api.post(`/products/${values.product_id}/variants`, {
        variant_name: values.variant_name,
        price: values.price || 0,
        stock_qty: 0,
      });
      message.success("Thêm biến thể mới thành công");
      setIsVariantModalOpen(false);
      quickVariantForm.resetFields();
      loadInitialData();
    } catch (e) {
      message.error("Lỗi khi thêm biến thể");
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        supplier_id: values.supplier_id,
        note: values.note,
        items: values.items.map((item: any) => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          cost_price: item.unit_price,
        })),
      };

      if (isEdit) {
        await api.put(`/purchase-receipts/${id}`, payload);
        message.success("Cập nhật thành công");
      } else {
        await api.post("/purchase-receipts", payload);
        message.success("Nhập hàng thành công");
      }
      navigate("/admin/products");
    } catch (e: any) {
      message.error("Lỗi khi lưu phiếu");
    } finally {
      setLoading(false);
    }
  };

  const itemsWatch = Form.useWatch("items", form);
  const totalAmount =
    itemsWatch?.reduce(
      (acc: number, cur: any) =>
        acc + Number(cur?.quantity || 0) * Number(cur?.unit_price || 0),
      0,
    ) || 0;

  return (
    <div className="p-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ items: [{ quantity: 1, unit_price: 0 }] }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8 sticky top-0 z-10 bg-gray-50/90 backdrop-blur-md py-4">
          <Space size="middle">
            <Button
              shape="circle"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <Title level={3} style={{ margin: 0 }}>
              {isEdit ? "Chỉnh sửa" : "Nhập hàng"}
            </Title>
          </Space>
          <Space>
            <Button
              icon={<PlusSquareOutlined />}
              onClick={() => setIsProductModalOpen(true)}
            >
              Tạo SP mới
            </Button>
            <Button
              icon={<AppstoreAddOutlined />}
              onClick={() => setIsVariantModalOpen(true)}
            >
              Thêm biến thể
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              className="bg-blue-600 rounded-lg border-none px-8"
            >
              Xác nhận
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <ShoppingCartOutlined />
                  <span>Danh sách hàng nhập</span>
                </Space>
              }
              style={cardStyle}
            >
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <div
                        key={key}
                        className="relative mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <Row gutter={16}>
                          <Col span={12}>
                            <Form.Item
                              {...restField}
                              name={[name, "product_variant_id"]}
                              label="Sản phẩm & Biến thể"
                              rules={[{ required: true }]}
                            >
                              <Select
                                showSearch
                                placeholder="Tìm theo Tên..."
                                options={variants.map((v: any) => ({
                                  label: `${v.product_name} - ${v.variant_name}`,
                                  value: v.id,
                                }))}
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              />
                            </Form.Item>
                          </Col>
                          <Col span={4}>
                            <Form.Item
                              {...restField}
                              name={[name, "quantity"]}
                              label="SL"
                              rules={[{ required: true }]}
                            >
                              <InputNumber className="w-full" min={1} />
                            </Form.Item>
                          </Col>
                          <Col span={7}>
                            <Form.Item
                              {...restField}
                              name={[name, "unit_price"]}
                              label="Giá nhập"
                              rules={[{ required: true }]}
                            >
                              <InputNumber
                                className="w-full"
                                min={0}
                                formatter={(value) =>
                                  `${value}`.replace(
                                    /\B(?=(\d{3})+(?!\d))/g,
                                    ",",
                                  )
                                }
                                addonAfter="đ"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={1}>
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => remove(name)}
                              style={{ marginTop: "30px" }}
                            />
                          </Col>
                        </Row>
                      </div>
                    ))}
                    <Button
                      type="dashed"
                      onClick={() => add({ quantity: 1, unit_price: 0 })}
                      block
                      icon={<PlusOutlined />}
                    >
                      Thêm dòng
                    </Button>
                  </>
                )}
              </Form.List>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size="large" className="w-full">
              <Card title="Thông tin chung" style={cardStyle}>
                <Form.Item
                  name="supplier_id"
                  label="Nhà cung cấp"
                  rules={[{ required: true }]}
                >
                  <Select
                    options={suppliers.map((s: any) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                  />
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                  <TextArea rows={3} />
                </Form.Item>
              </Card>

              <Card style={cardStyle} className="bg-blue-50/30">
                <div className="flex justify-between items-center">
                  <Text strong>TỔNG TIỀN:</Text>
                  <Text strong className="text-2xl text-blue-600">
                    {totalAmount.toLocaleString()} đ
                  </Text>
                </div>
              </Card>
            </Space>
          </Col>
        </Row>
      </Form>

      {/* MODAL TẠO NHANH SẢN PHẨM */}
      <Modal
        title="Tạo nhanh sản phẩm mới"
        open={isProductModalOpen}
        onCancel={() => setIsProductModalOpen(false)}
        onOk={() => quickProductForm.submit()}
      >
        <Form
          form={quickProductForm}
          layout="vertical"
          onFinish={handleQuickProduct}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="variant_name"
                label="Tên biến thể"
                initialValue="Mặc định"
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* MODAL THÊM BIẾN THỂ CHO SẢN PHẨM CÓ SẴN */}
      <Modal
        title="Thêm biến thể mới"
        open={isVariantModalOpen}
        onCancel={() => setIsVariantModalOpen(false)}
        onOk={() => quickVariantForm.submit()}
      >
        <Form
          form={quickVariantForm}
          layout="vertical"
          onFinish={handleQuickVariant}
        >
          <Form.Item
            name="product_id"
            label="Chọn sản phẩm gốc"
            rules={[{ required: true }]}
          >
            <Select
              showSearch
              options={products.map((p: any) => ({
                label: p.name,
                value: p.id,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="variant_name"
            label="Tên biến thể (Dung tích/Màu sắc...)"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ví dụ: 50ml, Màu Đỏ..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PurchaseReceiptFormPage;
