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
  Tag,
  Spin,
  message,
  Breadcrumb,
  Divider,
} from "antd";
import { ShoppingCart, Heart, Zap, Star, CheckCircle2, ShieldCheck, Truck } from "lucide-react"; 
import { Product, ProductVariant, Review } from "../types";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";
import { useCart } from "../contexts/CartContext";
import CartDrawer from "../components/CartDrawer";

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
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
        message.error("Sản phẩm không tồn tại hoặc đã bị xóa!");
        navigate("/products");
        return;
      }

      setProduct(productData);
      
      // Mặc định chọn phiên bản đầu tiên
      if (productData.variants?.length > 0) {
          setSelectedVariant(productData.variants[0]);
      }
      
      // Lấy ảnh chính
      const mainImg = productData.galleries?.find((g: any) => g.is_main === 1) || productData.galleries?.[0];
      setSelectedImage(mainImg?.image_url || productData.thumb_image || "");

      // Tải đánh giá
      try {
        const reviewsRes = await api.get(`/reviews/product/${id}`);
        setReviews(reviewsRes.data.data || []);
      } catch (revErr) { 
        setReviews([]); 
      }

    } catch (error: any) {
      message.error("Không thể tải thông tin sản phẩm lúc này.");
      navigate("/products");
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return message.warning("Vui lòng chọn phiên bản sản phẩm!");
    try {
      setActionLoading(true);
      await addToCart(selectedVariant.id, quantity);
      setIsDrawerOpen(true);
    } catch (error) { 
      // Lỗi đã xử lý trong context
    } finally { 
      setActionLoading(false); 
    }
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return message.warning("Vui lòng chọn phiên bản sản phẩm!");
    try {
      setActionLoading(true);
      await addToCart(selectedVariant.id, quantity);
      navigate("/cart");
    } catch (error) { 
      // Lỗi đã xử lý
    } finally { 
      setActionLoading(false); 
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length 
    : 0;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <Spin size="large" className="text-primary" />
      <Text className="mt-4 text-gray italic font-serif text-sm">Đang tải thông tin sản phẩm...</Text>
    </div>
  );
  
  if (!product) return null;

  const allImages = product.galleries?.map((g: any) => g.image_url) || [product.thumb_image];

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8 text-[11px] uppercase tracking-widest text-gray">
          <Breadcrumb.Item><Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/products" className="hover:text-primary transition-colors">Cửa hàng</Link></Breadcrumb.Item>
          <Breadcrumb.Item className="text-charcoal font-medium">{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[48, 48]}>
          {/* CỘT TRÁI: GALLERY ẢNH */}
          <Col xs={24} lg={11}>
            <div className="sticky top-24">
              <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-white shadow-sm border border-gray/10 p-1">
                <img
                  src={getImageUrl(selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl transition-all duration-700 hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x800?text=Muse"; }}
                />
              </div>
              <div className="flex gap-3 mt-4 overflow-x-auto pb-4 custom-scrollbar">
                {allImages.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-24 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImage === img ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={getImageUrl(img)} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <Col xs={24} lg={13}>
            <div className="space-y-8">
              <div>
                <Title level={1} className="!font-serif !text-3xl md:!text-4xl !text-charcoal !mb-4 leading-tight">
                  {product.name}
                </Title>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Rate disabled allowHalf value={averageRating} className="text-sm text-yellow-400" />
                    <Text className="text-gray text-xs font-medium">({reviews.length} đánh giá)</Text>
                  </div>
                  <Divider type="vertical" className="bg-gray/20 h-4" />
                  <Text className="text-gray text-xs uppercase tracking-widest">Mã SP: {selectedVariant?.sku || 'MUSE-001'}</Text>
                </div>
              </div>

              {/* Box Giá */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray/10 inline-block min-w-[300px]">
                <Text className="text-gray line-through text-sm block mb-1">
                  {formatCurrency(Number(selectedVariant?.price || 0) * 1.2)}
                </Text>
                <div className="flex items-baseline gap-3">
                    <Text className="text-3xl md:text-4xl font-serif text-primary font-bold">
                        {formatCurrency(Number(selectedVariant?.price || product.min_price || 0))}
                    </Text>
                    <Tag className="bg-primary/10 text-primary border-none rounded-md px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                      -20%
                    </Tag>
                </div>
              </div>

              {/* Lựa chọn phiên bản */}
              {product.variants?.length > 0 && (
                <div className="space-y-3">
                  <Text strong className="text-xs uppercase tracking-widest text-charcoal">Phiên bản</Text>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v: any) => (
                      <Button
                        key={v.id}
                        onClick={() => {
                            setSelectedVariant(v);
                            if(v.variant_image) setSelectedImage(v.variant_image);
                        }}
                        className={`h-10 px-5 rounded-lg font-medium transition-all ${
                            selectedVariant?.id === v.id 
                            ? "bg-primary border-primary text-white" 
                            : "bg-background border-gray/20 text-gray hover:!text-primary hover:!border-primary"
                        }`}
                      >
                        {v.variant_name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Số lượng */}
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center bg-background border border-gray/20 rounded-lg p-0.5">
                    <Button 
                        type="text" 
                        size="small"
                        icon={<Text className="font-medium">-</Text>} 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="text-gray hover:text-charcoal"
                    />
                    <InputNumber 
                        min={1} 
                        max={selectedVariant?.stock_qty || 10} 
                        value={quantity} 
                        onChange={(v) => setQuantity(v || 1)} 
                        controls={false}
                        bordered={false}
                        className="w-12 text-center font-medium !text-charcoal text-sm"
                    />
                    <Button 
                        type="text" 
                        size="small"
                        icon={<Text className="font-medium">+</Text>} 
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= (selectedVariant?.stock_qty || 0)}
                        className="text-gray hover:text-charcoal"
                    />
                </div>
                <Text className="text-gray text-xs">
                    {selectedVariant?.stock_qty && selectedVariant.stock_qty > 0 
                        ? `Còn lại ${selectedVariant.stock_qty} sản phẩm` 
                        : <span className="text-red-500 font-medium">Tạm hết hàng</span>}
                </Text>
              </div>

              {/* Nút Action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<Zap size={18} fill="currentColor" />} 
                  className="bg-charcoal border-charcoal h-12 flex-1 rounded-lg font-medium shadow-sm hover:!bg-black transition-all"
                  onClick={handleBuyNow}
                  loading={actionLoading}
                  disabled={!selectedVariant?.stock_qty}
                >
                  Mua ngay
                </Button>

                <Button 
                  size="large" 
                  icon={<ShoppingCart size={18} />} 
                  className="bg-transparent border-primary text-primary h-12 flex-1 rounded-lg font-medium hover:!bg-primary/5 hover:!border-primary hover:!text-primary transition-all"
                  onClick={handleAddToCart}
                  loading={actionLoading}
                  disabled={!selectedVariant?.stock_qty}
                >
                  Thêm vào giỏ
                </Button>
              </div>

              {/* Cam kết shop */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray/10">
                  <div className="flex items-center gap-3 text-xs text-gray">
                    <ShieldCheck size={18} className="text-primary" /> Cam kết chính hãng
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray">
                    <Truck size={18} className="text-primary" /> Miễn phí vận chuyển
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray">
                    <CheckCircle2 size={18} className="text-primary" /> Đổi trả 7 ngày
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray">
                    <Heart size={18} className="text-primary" /> Đóng gói an toàn
                  </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* TABS CHI TIẾT & REVIEW */}
        <div className="mt-24">
          <Tabs defaultActiveKey="1" size="large" centered className="muse-tabs">
            <TabPane tab={<span className="px-6 font-serif text-lg">Mô tả sản phẩm</span>} key="1">
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray/10 leading-relaxed text-gray text-base max-w-4xl mx-auto">
                <div dangerouslySetInnerHTML={{ __html: product.description || "Nội dung đang được cập nhật..." }} />
              </div>
            </TabPane>
            
            <TabPane tab={<span className="px-6 font-serif text-lg">Đánh giá khách hàng ({reviews.length})</span>} key="2">
                <div className="max-w-4xl mx-auto py-8">
                    {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-background rounded-2xl border border-dashed border-gray/20">
                            <Star size={32} className="text-gray/30 mx-auto mb-3" />
                            <Paragraph className="text-gray italic font-serif mb-0">Chưa có đánh giá nào cho sản phẩm này.<br/>Hãy trải nghiệm và để lại đánh giá đầu tiên nhé.</Paragraph>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.map((r: any) => (
                                <div key={r.id} className="bg-background p-6 rounded-2xl border border-gray/10 hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-serif font-bold text-base">
                                                {r.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <Text strong className="block text-charcoal font-serif text-base">{r.user_name}</Text>
                                                <Text className="text-[10px] text-gray uppercase tracking-widest">
                                                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                                                </Text>
                                            </div>
                                        </div>
                                        <Rate disabled value={Number(r.rating)} className="text-xs text-yellow-400" />
                                    </div>
                                    
                                    <div className="relative pt-2">
                                        <span className="text-4xl text-gray/10 absolute -top-4 -left-2 font-serif select-none">“</span>
                                        <Paragraph className="text-gray text-sm leading-relaxed relative z-10 pl-4 mb-0">
                                            {r.comment}
                                        </Paragraph>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Cart Drawer trượt ra khi thêm hàng */}
      <CartDrawer 
        visible={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
};

export default ProductDetailPage;