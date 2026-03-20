import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  InputNumber,
  Tabs,
  Rate,
  Card,
  Spin,
  message,
  Breadcrumb,
  Select,
} from "antd";
import { ArrowLeft, ShoppingCart, Heart, Share2 } from "lucide-react";
import { Product, ProductVariant, Review } from "../types";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";
import { useCart } from "../contexts/CartContext";

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (slug) loadProduct();
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/slug/${slug}`),
        api.get(`/reviews/product/slug/${slug}`),
      ]);

      const productData = productRes.data.data;
      setProduct(productData);

      // Chọn variant đầu tiên mặc định
      if (productData.variants?.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }

      // Ảnh đầu tiên từ galleries hoặc placeholder
      if (productData.galleries?.length > 0) {
        setSelectedImage(productData.galleries[0].image_url);
      }

      setReviews(reviewsRes.data || []);
    } catch (error: any) {
      console.error("Error loading product:", error);
      if (error.response?.status === 404) {
        message.error("Không tìm thấy sản phẩm");
        navigate("/products");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedVariant) {
      message.error("Vui lòng chọn phiên bản sản phẩm");
      return;
    }

    if (selectedVariant.stock_qty <= 0) {
      message.error("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > selectedVariant.stock_qty) {
      message.error(`Chỉ còn ${selectedVariant.stock_qty} sản phẩm trong kho`);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(selectedVariant.id, quantity);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const currentPrice = selectedVariant?.price ?? product?.min_price ?? 0;
  const currentStock = selectedVariant?.stock_qty ?? 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Title level={3}>Không tìm thấy sản phẩm</Title>
          <Button type="primary" onClick={() => navigate("/products")}>
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  const allImages = product.galleries?.map((g) => g.image_url) || [];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Button
              type="link"
              icon={<ArrowLeft size={16} />}
              onClick={() => navigate(-1)}
              className="p-0 text-gray hover:text-primary">
              Quay lại
            </Button>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Sản phẩm</Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[48, 48]}>
          {/* Product Images */}
          <Col xs={24} lg={12}>
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-lg bg-white">
                <img
                  src={getImageUrl(selectedImage || allImages[0])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === image ? "border-primary" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(image)}>
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-product.jpg"; }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Col>

          {/* Product Info */}
          <Col xs={24} lg={12}>
            <div className="space-y-6">
              <div>
                <Title level={1} className="!text-charcoal !mb-2 font-serif">
                  {product.name}
                </Title>

                <div className="flex items-center gap-4 mb-4">
                  <Rate disabled value={averageRating} />
                  <span className="text-gray">({reviews.length} đánh giá)</span>
                </div>

                {/* Giá */}
                <div className="mb-4">
                  <Title level={2} className="!text-primary !mb-0">
                    {formatCurrency(currentPrice)}
                  </Title>
                </div>

                {/* Tình trạng kho */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray">Tình trạng:</span>
                  <span className={`font-medium ${currentStock > 0 ? "text-green-600" : "text-red-600"}`}>
                    {currentStock > 0 ? `Còn ${currentStock} sản phẩm` : "Hết hàng"}
                  </span>
                </div>
              </div>

              {/* Chọn variant */}
              {product.variants && product.variants.length > 1 && (
                <div>
                  <span className="text-charcoal font-medium block mb-2">Phiên bản:</span>
                  <Select
                    value={selectedVariant?.id}
                    onChange={(variantId) => {
                      const v = product.variants.find((v) => v.id === variantId);
                      if (v) setSelectedVariant(v);
                    }}
                    style={{ width: "100%" }}
                    size="large">
                    {product.variants.map((v) => (
                      <Select.Option key={v.id} value={v.id} disabled={v.stock_qty === 0}>
                        {v.variant_name || v.sku || `Variant #${v.id}`}
                        {v.stock_qty === 0 ? " (Hết hàng)" : ` - ${formatCurrency(v.price)}`}
                      </Select.Option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Số lượng & Thêm vào giỏ */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-charcoal font-medium">Số lượng:</span>
                  <InputNumber
                    min={1}
                    max={currentStock}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    className="w-24"
                    disabled={currentStock === 0}
                  />
                  <span className="text-gray text-sm">(Còn {currentStock} sản phẩm)</span>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCart size={20} />}
                    loading={addingToCart}
                    onClick={handleAddToCart}
                    disabled={currentStock === 0}
                    className="bg-primary border-primary flex-1">
                    {currentStock === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  </Button>

                  <Button size="large" icon={<Heart size={20} />} className="border-primary text-primary">
                    Yêu thích
                  </Button>

                  <Button size="large" icon={<Share2 size={20} />} className="border-gray-300">
                    Chia sẻ
                  </Button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="space-y-2 text-gray">
                  <li>✓ Chính hãng 100%</li>
                  <li>✓ Giao hàng miễn phí từ 500k</li>
                  <li>✓ Đổi trả trong 7 ngày</li>
                  <li>✓ Tư vấn miễn phí</li>
                </ul>
              </div>
            </div>
          </Col>
        </Row>

        {/* Tabs mô tả & đánh giá */}
        <div className="mt-16">
          <Tabs defaultActiveKey="description" size="large">
            <TabPane tab="Mô tả chi tiết" key="description">
              <div className="bg-white p-8 rounded-lg">
                <Paragraph className="text-gray text-base leading-relaxed whitespace-pre-line">
                  {product.description}
                </Paragraph>
              </div>
            </TabPane>

            <TabPane tab={`Đánh giá (${reviews.length})`} key="reviews">
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <Title level={2} className="!text-primary !mb-1">
                        {averageRating.toFixed(1)}
                      </Title>
                      <Rate disabled value={averageRating} />
                      <p className="text-gray mt-1">{reviews.length} đánh giá</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id} className="border-0 shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-charcoal">{review.user_name}</p>
                              <Rate disabled value={review.rating} className="text-sm" />
                            </div>
                            <span className="text-gray text-sm">
                              {new Date(review.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                          <Paragraph className="text-gray mb-0">{review.comment}</Paragraph>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray">Chưa có đánh giá nào cho sản phẩm này</p>
                    </div>
                  )}
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
