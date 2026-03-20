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
        message.error("Sản phẩm đã bay đi đâu mất rồi nàng ạ!");
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
      message.error("Không thể kết nối với Muse lúc này");
      navigate("/products");
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return message.warning("Nàng chọn phiên bản trước nhé!");
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
    if (!selectedVariant) return message.warning("Nàng chọn phiên bản trước nhé!");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffafb]">
      <Spin size="large" />
      <Text className="mt-4 text-rose-300 italic font-serif">Muse đang chuẩn bị món quà cho nàng...</Text>
    </div>
  );
  
  if (!product) return null;

  const allImages = product.galleries?.map((g: any) => g.image_url) || [product.thumb_image];

  return (
    <div className="bg-[#fffafb] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        
        {/* Breadcrumb nhẹ nhàng */}
        <Breadcrumb className="mb-10 text-[11px] uppercase tracking-widest text-gray-400">
          <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
          <Breadcrumb.Item><Link to="/products">Cửa hàng</Link></Breadcrumb.Item>
          <Breadcrumb.Item className="text-rose-400">{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[64, 64]}>
          {/* CỘT TRÁI: GALLERY ẢNH */}
          <Col xs={24} lg={11}>
            <div className="sticky top-24">
              <div className="aspect-[4/5] overflow-hidden rounded-[40px] bg-white shadow-sm border border-rose-50 p-2">
                <img
                  src={getImageUrl(selectedImage)}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-[32px] transition-all duration-500 hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x800?text=Muse"; }}
                />
              </div>
              <div className="flex gap-4 mt-6 overflow-x-auto pb-4 no-scrollbar">
                {allImages.map((img: string, i: number) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImage === img ? "border-rose-300 shadow-md shadow-rose-100 scale-105" : "border-transparent opacity-60"
                    }`}
                  >
                    <img src={getImageUrl(img)} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN CHI TIẾT */}
          <Col xs={24} lg={13}>
            <div className="space-y-8">
              <div>
                <Title level={1} className="!font-serif !text-4xl !text-charcoal !mb-4 leading-tight">{product.name}</Title>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Rate disabled allowHalf value={averageRating} className="text-xs text-rose-300" />
                    <Text className="text-rose-300 text-xs font-medium">({reviews.length} cảm nhận)</Text>
                  </div>
                  <Divider type="vertical" className="bg-rose-100 h-4" />
                  <Text className="text-gray-400 text-xs uppercase tracking-widest">Mã: {selectedVariant?.sku || 'MUSE-001'}</Text>
                </div>
              </div>

              {/* Box Giá */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-rose-50/50 inline-block min-w-[300px]">
                <Text className="text-gray-300 line-through text-sm block mb-1">
                  {formatCurrency(Number(selectedVariant?.price || 0) * 1.2)}
                </Text>
                <div className="flex items-baseline gap-3">
                    <Text className="text-4xl font-serif text-rose-500 font-bold">
                        {formatCurrency(Number(selectedVariant?.price || product.min_price || 0))}
                    </Text>
                    <Tag color="pink" className="border-none rounded-full text-[10px] uppercase font-bold">-20% OFF</Tag>
                </div>
              </div>

              {/* Lựa chọn phiên bản */}
              {product.variants?.length > 0 && (
                <div className="space-y-4">
                  <Text strong className="text-xs uppercase tracking-widest text-gray-500">Nàng chọn phiên bản nào?</Text>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v: any) => (
                      <Button
                        key={v.id}
                        onClick={() => {
                            setSelectedVariant(v);
                            if(v.variant_image) setSelectedImage(v.variant_image);
                        }}
                        className={`h-11 px-6 rounded-full font-medium transition-all ${
                            selectedVariant?.id === v.id 
                            ? "bg-rose-400 border-none text-white shadow-lg shadow-rose-100" 
                            : "bg-white border-rose-100 text-gray-400 hover:!text-rose-400 hover:!border-rose-400"
                        }`}
                      >
                        {v.variant_name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Số lượng */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center bg-white border border-rose-100 rounded-full p-1 shadow-sm">
                    <Button 
                        type="text" 
                        shape="circle" 
                        icon={<Text className="font-bold">-</Text>} 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    />
                    <InputNumber 
                        min={1} 
                        max={selectedVariant?.stock_qty || 10} 
                        value={quantity} 
                        onChange={(v) => setQuantity(v || 1)} 
                        controls={false}
                        bordered={false}
                        className="w-12 text-center font-bold"
                    />
                    <Button 
                        type="text" 
                        shape="circle" 
                        icon={<Text className="font-bold">+</Text>} 
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={quantity >= (selectedVariant?.stock_qty || 0)}
                    />
                </div>
                <Text className="text-gray-400 text-xs italic">
                    {selectedVariant?.stock_qty && selectedVariant.stock_qty > 0 
                        ? `Chỉ còn ${selectedVariant.stock_qty} món cuối cùng` 
                        : "Hết hàng tạm thời"}
                </Text>
              </div>

              {/* Nút Action */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="primary" 
                  size="large" 
                  icon={<Zap size={18} fill="white" />} 
                  className="bg-charcoal border-none h-16 flex-1 rounded-full font-bold uppercase tracking-[0.2em] shadow-xl hover:!bg-black transition-all hover:-translate-y-1"
                  onClick={handleBuyNow}
                  loading={actionLoading}
                  disabled={!selectedVariant?.stock_qty}
                >
                  Mua ngay
                </Button>

                <Button 
                  size="large" 
                  icon={<ShoppingCart size={18} />} 
                  className="bg-white border-2 border-rose-200 text-rose-400 h-16 flex-1 rounded-full font-bold uppercase tracking-[0.2em] hover:!border-rose-400 hover:!text-rose-400 transition-all hover:-translate-y-1"
                  onClick={handleAddToCart}
                  loading={actionLoading}
                  disabled={!selectedVariant?.stock_qty}
                >
                  Thêm vào túi
                </Button>
              </div>

              {/* Cam kết shop */}
              <div className="grid grid-cols-2 gap-4 pt-10">
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <ShieldCheck size={16} className="text-green-300" /> Cam kết chính hãng 100%
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <Truck size={16} className="text-blue-300" /> Freeship đơn từ 500k
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <CheckCircle2 size={16} className="text-rose-300" /> Đổi trả trong 7 ngày
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400">
                    <Heart size={16} className="text-rose-300" /> Gói quà miễn phí
                  </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* TABS CHI TIẾT & REVIEW */}
        <div className="mt-32">
          <Tabs defaultActiveKey="1" size="large" centered className="muse-tabs">
            <TabPane tab={<span className="px-8 font-serif text-lg">Mô tả món quà</span>} key="1">
              <div className="bg-white p-12 rounded-[48px] shadow-sm border border-rose-50/50 leading-relaxed text-gray-500 text-base max-w-4xl mx-auto">
                <div dangerouslySetInnerHTML={{ __html: product.description || "Nội dung đang được Muse cập nhật..." }} />
              </div>
            </TabPane>
            
            <TabPane tab={<span className="px-8 font-serif text-lg">Cảm nhận nàng thơ ({reviews.length})</span>} key="2">
                <div className="max-w-5xl mx-auto py-10">
                    {reviews.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-rose-100">
                            <Star size={32} className="text-rose-100 mx-auto mb-4" />
                            <Paragraph className="text-gray-300 italic font-serif">Chưa có đánh giá nào cho sản phẩm này. <br/> Hãy là nàng thơ đầu tiên để lại cảm nhận nhé ✨</Paragraph>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {reviews.map((r: any) => (
                                <div key={r.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-rose-50/50 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-400 font-serif font-bold text-lg shadow-inner">
                                                {r.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <Text strong className="block text-charcoal font-serif text-base">{r.user_name}</Text>
                                                <Text className="text-[10px] text-gray-300 uppercase tracking-[0.2em]">
                                                    {new Date(r.created_at).toLocaleDateString("vi-VN")}
                                                </Text>
                                            </div>
                                        </div>
                                        <Rate disabled value={Number(r.rating)} className="text-[10px] text-rose-300" />
                                    </div>
                                    
                                    <div className="relative">
                                        <span className="text-5xl text-rose-50 absolute -top-6 -left-2 font-serif select-none opacity-50">“</span>
                                        <Paragraph className="text-gray-500 italic leading-relaxed relative z-10 pl-5 mb-0">
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