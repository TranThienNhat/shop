import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { ShoppingCart, Heart, ArrowRight, Zap } from "lucide-react"; 
import { Product, ProductVariant, Review } from "../types";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";
import { useCart } from "../contexts/CartContext";
import CartDrawer from "../components/CartDrawer"; // Component giỏ hàng trượt

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productRes = await api.get(`/products/${id}`);
      const productData = productRes.data.data;

      if (!productData) {
        message.error("Sản phẩm không tồn tại");
        navigate("/products");
        return;
      }

      setProduct(productData);
      if (productData.variants?.length > 0) setSelectedVariant(productData.variants[0]);
      
      const mainImg = productData.galleries?.find((g: any) => g.is_main === 1) || productData.galleries?.[0];
      setSelectedImage(mainImg?.image_url || productData.thumb_image || "");

      try {
        const reviewsRes = await api.get(`/reviews/product/${id}`);
        setReviews(reviewsRes.data.data || reviewsRes.data || []);
      } catch (revErr) { setReviews([]); }

    } catch (error: any) {
      message.error("Không thể tải thông tin sản phẩm");
      navigate("/products");
    } finally { setLoading(false); }
  };

  // Hàm "Thêm vào giỏ" -> Mở Drawer
  const handleAddToCart = async () => {
    if (!selectedVariant) return message.warning("Vui lòng chọn phiên bản");
    try {
      setActionLoading(true);
      await addToCart(selectedVariant.id, quantity);
      setIsDrawerOpen(true); // Mở giỏ hàng trượt ra
    } catch (error) { message.error("Lỗi thêm vào giỏ hàng"); } 
    finally { setActionLoading(false); }
  };

  // Hàm "Mua ngay" -> Chuyển đến CartPage
  const handleBuyNow = async () => {
    if (!selectedVariant) return message.warning("Vui lòng chọn phiên bản");
    try {
      setActionLoading(true);
      await addToCart(selectedVariant.id, quantity);
      navigate("/cart"); // Chuyển trang ngay lập tức
    } catch (error) { message.error("Lỗi xử lý mua hàng"); } 
    finally { setActionLoading(false); }
  };

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;
  if (!product) return null;

  const allImages = product.galleries?.map((g: any) => g.image_url) || [product.thumb_image];

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/products">Sản phẩm</Link></Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[48, 48]}>
          {/* Gallery */}
          <Col xs={24} lg={12}>
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm">
                <img
                  src={getImageUrl(selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x600?text=No+Image"; }}
                />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? "border-primary shadow-md" : "border-transparent"}`}
                  >
                    <img src={getImageUrl(img)} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Col>

          {/* Info */}
          <Col xs={24} lg={12}>
            <div className="space-y-6">
              <Title level={1} className="!font-serif !text-4xl !text-charcoal">{product.name}</Title>
              <div className="flex items-center gap-4">
                <Rate disabled allowHalf value={averageRating} className="text-sm" />
                <Text type="secondary">({reviews.length} đánh giá)</Text>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl">
                <Text className="text-gray-400 line-through text-base block mb-1">
                  {formatCurrency(Number(selectedVariant?.price || 0) * 1.2)}
                </Text>
                <Title level={2} className="!text-primary !m-0 !text-3xl">
                  {formatCurrency(Number(selectedVariant?.price || product.min_price || 0))}
                </Title>
              </div>

              {product.variants?.length > 0 && (
                <div className="space-y-3">
                  <Text strong>Chọn phiên bản:</Text>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v: any) => (
                      <Button
                        key={v.id}
                        type={selectedVariant?.id === v.id ? "primary" : "default"}
                        onClick={() => setSelectedVariant(v)}
                        className={selectedVariant?.id === v.id ? "bg-primary border-primary" : "hover:border-primary hover:text-primary"}
                      >
                        {v.variant_name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <Text strong>Số lượng:</Text>
                <InputNumber min={1} max={selectedVariant?.stock_qty || 10} value={quantity} onChange={(v) => setQuantity(v || 1)} size="large" className="rounded-md" />
                <Text type="secondary">Kho: {selectedVariant?.stock_qty || 0}</Text>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {/* NÚT MUA NGAY */}
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<Zap size={18} fill="white" />} 
                  className="bg-charcoal border-charcoal hover:!bg-black h-14 flex-1 rounded-full font-bold uppercase tracking-wider"
                  onClick={handleBuyNow}
                  loading={actionLoading}
                >
                  Mua ngay
                </Button>

                {/* NÚT THÊM VÀO GIỎ */}
                <Button 
                  size="large" 
                  icon={<ShoppingCart size={18} />} 
                  className="border-primary text-primary hover:bg-primary/5 h-14 flex-1 rounded-full font-bold uppercase tracking-wider"
                  onClick={handleAddToCart}
                  loading={actionLoading}
                >
                  Thêm vào giỏ
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-20">
          <Tabs defaultActiveKey="1" size="large">
            <TabPane tab="Chi tiết sản phẩm" key="1">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-50 leading-relaxed text-base">
                {product.description || "Nội dung đang được cập nhật..."}
              </div>
            </TabPane>
            <TabPane tab={`Đánh giá (${reviews.length})`} key="2">
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <Card key={r.id} className="border-0 border-b shadow-none rounded-none">
                    <Text strong>{r.user_name}</Text>
                    <Rate disabled value={r.rating} className="block text-xs mt-1" />
                    <Paragraph className="mt-3 text-gray-500 italic">"{r.comment}"</Paragraph>
                  </Card>
                ))}
              </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      <CartDrawer 
        visible={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default ProductDetailPage;