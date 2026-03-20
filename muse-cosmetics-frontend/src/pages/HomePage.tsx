import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Typography, Carousel, Spin } from "antd";
import { Link } from "react-router-dom";
import { ArrowRight, Star, Headphones, Truck } from "lucide-react"; 
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Paragraph, Text } = Typography;
const { Meta } = Card;

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 1. HARDCODE 5 ẢNH BANNER (Nàng có thể thay link ảnh của nàng vào đây nhé)
  const showcaseImages = [
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1976&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620916566398-39f1143f7c0e?q=80&w=1974&auto=format&fit=crop"
  ];

  useEffect(() => {
    const authToken = localStorage.getItem("auth_token");
    setIsLoggedIn(!!authToken);
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products?limit=8");
      setFeaturedProducts(response.data.data || []);
    } catch (error) {
      console.error("Error loading featured products:", error);
    } finally {
      setLoading(false);
    }
  };

  const heroSlides = [
    {
      title: "Bộ sưu tập mới",
      subtitle: "Khám phá vẻ đẹp tự nhiên",
      description: "Những sản phẩm mỹ phẩm cao cấp được tuyển chọn kỹ lưỡng",
      cta: "Khám phá ngay",
    },
    {
      title: "Chăm sóc da chuyên sâu",
      subtitle: "Công nghệ tiên tiến",
      description: "Dòng sản phẩm chăm sóc da với thành phần tự nhiên",
      cta: "Xem chi tiết",
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative">
        <Carousel autoplay effect="fade" className="h-[600px]">
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div className="h-[600px] bg-gradient-to-r from-rose-50 to-white flex items-center">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                  <Row align="middle" gutter={[48, 48]}>
                    <Col xs={24} lg={12}>
                      <div className="space-y-6">
                        <div>
                          <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-2">{slide.subtitle}</p>
                          <Title level={1} className="!text-charcoal !mb-4 !font-serif !text-5xl">{slide.title}</Title>
                          <Paragraph className="text-lg text-gray mb-8 italic font-serif leading-relaxed">{slide.description}</Paragraph>
                        </div>
                        <Link to="/products">
                          <Button 
                            type="primary" 
                            size="large" 
                            className="bg-primary border-none h-14 px-10 rounded-full font-bold uppercase tracking-widest shadow-lg shadow-rose-100 flex items-center gap-3 hover:!bg-rose-500"
                          >
                            {slide.cta} <ArrowRight size={18} />
                          </Button>
                        </Link>
                      </div>
                    </Col>

                    {/* 2. PHẦN BANNER THAY ĐỔI LIÊN TỤC (SHOWCASE) */}
                    <Col xs={24} lg={12}>
                      <div className="relative group">
                        <div className="absolute -inset-4 bg-rose-100/50 rounded-[40px] blur-2xl group-hover:bg-rose-200/50 transition-all"></div>
                        <div className="relative h-[450px] overflow-hidden rounded-[40px] shadow-2xl shadow-rose-100 border-4 border-white">
                          <Carousel autoplay autoplaySpeed={3000} effect="fade" dots={false}>
                            {showcaseImages.map((img, i) => (
                              <div key={i} className="h-[450px]">
                                <img 
                                  src={img} 
                                  alt="Muse Showcase" 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </Carousel>
                        </div>
                        {/* Decorative Tag */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl hidden lg:block">
                            <Text className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-1">Authentic</Text>
                            <Text className="font-serif italic text-gray-500">Muse Cosmetics ✨</Text>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Features Section - Nàng giữ nguyên code cũ của nàng ở đây */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <Star size={24} />
                </div>
                <Title level={4} className="!text-charcoal !font-serif">Chất lượng cao cấp</Title>
                <Paragraph className="text-gray-400">Sản phẩm được tuyển chọn kỹ lưỡng từ các thương hiệu uy tín.</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <Truck size={24} />
                </div>
                <Title level={4} className="!text-charcoal !font-serif">Giao hàng nhanh</Title>
                <Paragraph className="text-gray-400">Đơn hàng được vận chuyển hỏa tốc trong vòng 24h.</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
                  <Headphones size={24} />
                </div>
                <Title level={4} className="!text-charcoal !font-serif">Tư vấn tận tâm</Title>
                <Paragraph className="text-gray-400">Muse luôn sẵn sàng lắng nghe và hỗ trợ nàng 24/7.</Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Title level={2} className="!text-charcoal !mb-4 !font-serif !text-4xl">Sản phẩm nổi bật</Title>
            <div className="w-12 h-1 bg-rose-200 mx-auto mb-4 rounded-full"></div>
            <Paragraph className="text-lg text-gray-400 font-serif italic">Những món quà nhỏ dành cho làn da nàng</Paragraph>
          </div>

          {loading ? (
            <div className="text-center py-12"><Spin size="large" /></div>
          ) : (
            <Row gutter={[32, 32]}>
              {featuredProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} lg={6}>
                  <Card
                    hoverable
                    className="border-none shadow-sm h-full rounded-[32px] overflow-hidden group"
                    cover={
                      <Link to={`/products/${product.id}`}>
                        <div className="h-72 overflow-hidden bg-gray-50 p-2">
                          <img
                            alt={product.name}
                            src={getImageUrl(product.thumb_image)}
                            className="w-full h-full object-cover rounded-[24px] group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                      </Link>
                    }
                  >
                    <Meta
                      title={
                        <Link to={`/products/${product.id}`} className="text-charcoal hover:text-rose-400 line-clamp-1 font-serif text-lg">
                          {product.name}
                        </Link>
                      }
                      description={
                        <div className="mt-2">
                          <Text className="text-rose-400 font-bold text-lg">
                            {formatCurrency(Number(product.min_price || 0))}
                          </Text>
                        </div>
                      }
                    />
                    <div className="mt-6">
                         <Link to={`/products/${product.id}`}>
                            <Button block className="rounded-full border-rose-100 text-rose-400 font-bold uppercase tracking-widest text-[10px] h-10 hover:!border-rose-400 hover:!text-rose-400">
                                Xem chi tiết
                            </Button>
                         </Link>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <div className="text-center mt-16">
            <Link to="/products">
              <Button size="large" className="rounded-full border-charcoal text-charcoal px-10 h-14 font-bold uppercase tracking-widest hover:!border-primary hover:!text-primary">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      {!isLoggedIn && (
        <section className="py-24 bg-rose-50/30">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center bg-white p-16 rounded-[60px] shadow-sm border border-rose-50">
            <Title level={2} className="!text-charcoal !mb-4 !font-serif">Gia nhập cộng đồng Muse</Title>
            <Paragraph className="text-lg text-gray-400 mb-10 font-serif italic">
              Đăng ký để nhận thông báo về bộ sưu tập mới và các ưu đãi bí mật dành riêng cho nàng.
            </Paragraph>
            <div className="max-w-md mx-auto">
              <Link to="/register">
                <Button type="primary" size="large" className="bg-charcoal border-none w-full h-14 rounded-full font-bold uppercase tracking-widest shadow-lg shadow-rose-100 hover:!bg-black">
                    Đăng ký ngay
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;