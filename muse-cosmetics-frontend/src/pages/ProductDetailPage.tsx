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
} from "antd";
import { ArrowLeft, ShoppingCart, Heart, Share2 } from "lucide-react";
import { Product, Review } from "../types";
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
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct();
    }
  }, [slug]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/slug/${slug}`), // Sử dụng endpoint slug
        api.get(`/reviews/product/slug/${slug}`), // Sử dụng review endpoint slug
      ]);

      const productData = productRes.data.data; // Sửa để lấy đúng data
      setProduct(productData);
      setSelectedImage(productData.image_url);
      setReviews(reviewsRes.data || []); // Reviews trả về trực tiếp array
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
    if (!product) {
      message.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    if (!product.id) {
      message.error("ID sản phẩm không hợp lệ");
      return;
    }

    if (product.stock_qty <= 0) {
      message.error("Sản phẩm đã hết hàng");
      return;
    }

    if (quantity > product.stock_qty) {
      message.error(`Chỉ còn ${product.stock_qty} sản phẩm trong kho`);
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

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

  const allImages = [
    product.image_url,
    ...product.galleries.map((g) => g.image_url),
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Breadcrumb */}
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
              {/* Main Image */}
              <div className="aspect-square overflow-hidden rounded-lg bg-white">
                <img
                  src={getImageUrl(selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/placeholder-product.jpg";
                  }}
                />
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === image
                          ? "border-primary"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(image)}>
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-product.jpg";
                        }}
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

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <Rate disabled value={averageRating} />
                  <span className="text-gray">({reviews.length} đánh giá)</span>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  <span className="text-gray">Tình trạng:</span>
                  <span
                    className={`font-medium ${
                      product.stock_qty > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                    {product.stock_qty > 0
                      ? `Còn ${product.stock_qty} sản phẩm`
                      : "Hết hàng"}
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  {product.sale_price ? (
                    <div className="space-y-1">
                      <Title level={2} className="!text-primary !mb-0">
                        {formatCurrency(parseFloat(product.sale_price))}
                      </Title>
                      <div className="flex items-center gap-2">
                        <span className="text-gray line-through">
                          {formatCurrency(parseFloat(product.price))}
                        </span>
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                          Giảm{" "}
                          {Math.round(
                            (1 -
                              parseFloat(product.sale_price) /
                                parseFloat(product.price)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  ) : (
                    <Title level={2} className="!text-primary !mb-0">
                      {formatCurrency(parseFloat(product.price))}
                    </Title>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <Paragraph className="text-gray text-lg leading-relaxed">
                  {product.short_description}
                </Paragraph>
              </div>

              {/* Product Specifications */}
              {(product.capacity || product.color || product.ingredients) && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Title level={5} className="!mb-3">
                    Thông số sản phẩm
                  </Title>
                  <div className="space-y-2">
                    {product.capacity && (
                      <div className="flex">
                        <span className="w-24 text-gray font-medium">
                          Dung tích:
                        </span>
                        <span className="text-charcoal">
                          {product.capacity}
                        </span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex">
                        <span className="w-24 text-gray font-medium">
                          Màu sắc:
                        </span>
                        <span className="text-charcoal">{product.color}</span>
                      </div>
                    )}
                    {product.ingredients && (
                      <div className="flex">
                        <span className="w-24 text-gray font-medium">
                          Thành phần:
                        </span>
                        <span className="text-charcoal">
                          {product.ingredients}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-charcoal font-medium">Số lượng:</span>
                  <InputNumber
                    min={1}
                    max={product.stock_qty}
                    value={quantity}
                    onChange={(value) => setQuantity(value || 1)}
                    className="w-24"
                    disabled={product.stock_qty === 0}
                  />
                  <span className="text-gray text-sm">
                    (Còn {product.stock_qty} sản phẩm)
                  </span>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCart size={20} />}
                    loading={addingToCart}
                    onClick={handleAddToCart}
                    disabled={product.stock_qty === 0}
                    className="bg-primary border-primary flex-1">
                    {product.stock_qty === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                  </Button>

                  <Button
                    size="large"
                    icon={<Heart size={20} />}
                    className="border-primary text-primary hover:bg-primary hover:text-white">
                    Yêu thích
                  </Button>

                  <Button
                    size="large"
                    icon={<Share2 size={20} />}
                    className="border-gray-300">
                    Chia sẻ
                  </Button>
                </div>
              </div>

              {/* Product Features */}
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

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultActiveKey="description" size="large">
            <TabPane tab="Mô tả chi tiết" key="description">
              <div className="bg-white p-8 rounded-lg">
                <div className="prose max-w-none">
                  <Paragraph className="text-gray text-base leading-relaxed whitespace-pre-line">
                    {product.content || product.short_description}
                  </Paragraph>

                  {product.ingredients && (
                    <div className="mt-6">
                      <Title level={4}>Thành phần chính:</Title>
                      <Paragraph className="text-gray">
                        {product.ingredients}
                      </Paragraph>
                    </div>
                  )}

                  <div className="mt-6">
                    <Title level={4}>Hướng dẫn sử dụng:</Title>
                    <ul className="text-gray space-y-1">
                      <li>• Làm sạch da trước khi sử dụng</li>
                      <li>• Thoa đều sản phẩm lên da</li>
                      <li>• Massage nhẹ nhàng để sản phẩm thấm sâu</li>
                      <li>• Sử dụng 2 lần/ngày để đạt hiệu quả tốt nhất</li>
                    </ul>
                  </div>

                  <div className="mt-6">
                    <Title level={4}>Lưu ý:</Title>
                    <ul className="text-gray space-y-1">
                      <li>• Tránh tiếp xúc với mắt</li>
                      <li>• Ngưng sử dụng nếu có dấu hiệu kích ứng</li>
                      <li>• Bảo quản nơi khô ráo, thoáng mát</li>
                      <li>• Tránh ánh nắng trực tiếp</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabPane>

            <TabPane tab={`Đánh giá (${reviews.length})`} key="reviews">
              <div className="space-y-6">
                {/* Rating Summary */}
                <div className="bg-white p-6 rounded-lg">
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <Title level={2} className="!text-primary !mb-1">
                        {averageRating.toFixed(1)}
                      </Title>
                      <Rate disabled value={averageRating} />
                      <p className="text-gray mt-1">
                        {reviews.length} đánh giá
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length > 0 ? (
                    reviews.map((review) => (
                      <Card key={review.id} className="border-0 shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-charcoal">
                                {review.user_name}
                              </p>
                              <Rate
                                disabled
                                value={review.rating}
                                className="text-sm"
                              />
                            </div>
                            <span className="text-gray text-sm">
                              {new Date(review.created_at).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>
                          <Paragraph className="text-gray mb-0">
                            {review.comment}
                          </Paragraph>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray">
                        Chưa có đánh giá nào cho sản phẩm này
                      </p>
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
