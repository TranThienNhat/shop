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

  // 1. HARDCODE 5 ẢNH BANNER
  const showcaseImages = [
    "D:\shop\muse-cosmetics-frontend\src\album\banner1.jpg",
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
      description: "Những sản phẩm mỹ phẩm cao cấp được tuyển chọn kỹ lưỡng, đánh thức vẻ đẹp thuần khiết của bạn.",
      cta: "Khám phá ngay",
    },
    {
      title: "Chăm sóc da chuyên sâu",
      subtitle: "Công nghệ tiên tiến",
      description: "Dòng sản phẩm chăm sóc da với thành phần tự nhiên, an toàn và lành tính cho mọi loại da.",
      cta: "Xem chi tiết",
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative bg-white border-b border-gray/10">
        <Carousel autoplay effect="fade" className="h-[500px] md:h-[600px]">
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div className="h-[500px] md:h-[600px] flex items-center bg-background/50">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                  <Row align="middle" gutter={[48, 48]}>
                    <Col xs={24} lg={12} className="z-10">
                      <div className="space-y-6 max-w-xl">
                        <div>
                          <Text className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-3 block">
                            {slide.subtitle}
                          </Text>
                          <Title level={1} className="!text-charcoal !mb-4 !font-serif !text-4xl md:!text-5xl leading-tight">
                            {slide.title}
                          </Title>
                          <Paragraph className="text-lg text-gray mb-8 italic font-serif leading-relaxed">
                            {slide.description}
                          </Paragraph>
                        </div>
                        <Link to="/products">
                          <Button 
                            type="primary" 
                            size="large" 
                            className="bg-primary border-primary h-12 px-8 rounded-lg text-base font-medium shadow-sm hover:!bg-primary/90 flex items-center gap-2 group"
                          >
                            {slide.cta} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </Col>

                    {/* SHOWCASE IMAGES */}
                    <Col xs={24} lg={12} className="hidden lg:block">
                      <div className="relative group p-4">
                        <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-xl group-hover:bg-primary/10 transition-all duration-700"></div>
                        <div className="relative h-[450px] overflow-hidden rounded-2xl shadow-lg border border-white/50">
                          <Carousel autoplay autoplaySpeed={4000} effect="fade" dots={false}>
                            {showcaseImages.map((img, i) => (
                              <div key={i} className="h-[450px]">
                                <img 
                                  src={img} 
                                  alt="Linh Showcase" 
                                  className="w-full h-full object-cover scale-105"
                                />
                              </div>
                            ))}
                          </Carousel>
                        </div>
                        {/* Decorative Tag */}
                        <div className="absolute bottom-10 -left-6 bg-white p-5 rounded-xl shadow-lg border border-gray/10">
                          <Text className="text-[10px] uppercase font-bold tracking-widest text-primary block mb-1">Authentic</Text>
                          <Text className="font-serif italic text-charcoal">Linh Cosmetics ✨</Text>
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

      {/* 2. FEATURES SECTION */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Row gutter={[32, 32]}>
            {[
              { icon: <Star size={24} />, title: "Chất lượng cao cấp", desc: "Sản phẩm được tuyển chọn kỹ lưỡng từ các thương hiệu uy tín." },
              { icon: <Truck size={24} />, title: "Giao hàng nhanh", desc: "Đơn hàng được vận chuyển hỏa tốc trong vòng 24h." },
              { icon: <Headphones size={24} />, title: "Tư vấn tận tâm", desc: "Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn 24/7." }
            ].map((feature, idx) => (
              <Col xs={24} md={8} key={idx}>
                <div className="text-center space-y-4 p-6 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                    {feature.icon}
                  </div>
                  <Title level={4} className="!text-charcoal !font-serif !m-0">{feature.title}</Title>
                  <Paragraph className="text-gray leading-relaxed m-0">{feature.desc}</Paragraph>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <Title level={2} className="!text-charcoal !mb-4 !font-serif !text-3xl md:!text-4xl">Sản phẩm nổi bật</Title>
            <div className="w-12 h-1 bg-primary/30 mx-auto mb-4 rounded-full"></div>
            <Paragraph className="text-base text-gray font-serif italic">Những món quà nhỏ dành cho làn da của bạn</Paragraph>
          </div>

          {loading ? (
            <div className="text-center py-12"><Spin size="large" className="text-primary" /></div>
          ) : (
            <Row gutter={[24, 32]}>
              {featuredProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} lg={6}>
                  <Card
                    hoverable
                    className="border border-gray/10 shadow-sm h-full rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300"
                    bodyStyle={{ padding: '20px' }}
                    cover={
                      <Link to={`/products/${product.id}`}>
                        <div className="h-72 overflow-hidden bg-gray/5">
                          <img
                            alt={product.name}
                            src={getImageUrl(product.thumb_image)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                      </Link>
                    }
                  >
                    <Meta
                      title={
                        <Link to={`/products/${product.id}`} className="text-charcoal hover:text-primary transition-colors line-clamp-1 font-serif text-lg">
                          {product.name}
                        </Link>
                      }
                      description={
                        <div className="mt-2 flex flex-col gap-4">
                          <Text className="text-primary font-medium text-lg">
                            {formatCurrency(Number(product.min_price || 0))}
                          </Text>
                          <Link to={`/products/${product.id}`} className="w-full">
                            <Button 
                              block 
                              className="rounded-lg border-primary text-primary h-10 hover:!bg-primary hover:!text-white font-medium transition-colors"
                            >
                              Xem chi tiết
                            </Button>
                          </Link>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <div className="text-center mt-16">
            <Link to="/products">
              <Button size="large" className="rounded-lg border-charcoal text-charcoal px-10 h-12 font-medium hover:!border-primary hover:!text-primary transition-colors">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. NEWSLETTER SECTION */}
      {!isLoggedIn && (
        <section className="py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 lg:px-8">
            <div className="bg-white p-10 md:p-16 rounded-2xl shadow-xl shadow-primary/5 border border-gray/10 text-center relative overflow-hidden">
              <div className="relative z-10">
                <Title level={2} className="!text-charcoal !mb-4 !font-serif !text-3xl">Gia nhập cộng đồng Linh</Title>
                <Paragraph className="text-base text-gray mb-8 font-serif italic max-w-lg mx-auto leading-relaxed">
                  Đăng ký ngay để nhận thông báo về bộ sưu tập mới và các ưu đãi bí mật dành riêng cho bạn.
                </Paragraph>
                <div className="max-w-sm mx-auto">
                  <Link to="/register">
                    <Button type="primary" size="large" className="bg-primary border-primary w-full h-12 rounded-lg text-base font-medium shadow-sm hover:!bg-primary/90">
                      Tạo tài khoản ngay
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;