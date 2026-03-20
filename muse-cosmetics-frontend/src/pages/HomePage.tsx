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
  
  // Trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra đúng key 'auth_token' bạn đang dùng
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
              <div className="h-[600px] bg-gradient-to-r from-primary/20 to-primary/10 flex items-center">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                  <Row align="middle" gutter={[48, 48]}>
                    <Col xs={24} lg={12}>
                      <div className="space-y-6">
                        <div>
                          <p className="text-primary font-medium mb-2">{slide.subtitle}</p>
                          <Title level={1} className="!text-charcoal !mb-4 font-serif">{slide.title}</Title>
                          <Paragraph className="text-lg text-gray mb-6">{slide.description}</Paragraph>
                        </div>
                        <Link to="/products">
                          <Button type="primary" size="large" className="bg-primary border-primary hover:bg-primary/90 flex items-center gap-2">
                            {slide.cta} <ArrowRight size={16} />
                          </Button>
                        </Link>
                      </div>
                    </Col>
                    <Col xs={24} lg={12}>
                      <div className="h-[400px] bg-white/50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
                        <p className="text-gray italic">Muse Cosmetics Showcase</p>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Star className="text-primary" size={24} />
                </div>
                <Title level={4} className="!text-charcoal">Chất lượng cao cấp</Title>
                <Paragraph className="text-gray">Sản phẩm được tuyển chọn từ các thương hiệu uy tín hàng đầu</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Truck className="text-primary" size={24} />
                </div>
                <Title level={4} className="!text-charcoal">Giao hàng nhanh</Title>
                <Paragraph className="text-gray">Giao hàng tận nơi trong 24h tại TP.HCM</Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Headphones className="text-primary" size={24} />
                </div>
                <Title level={4} className="!text-charcoal">Tư vấn chuyên nghiệp</Title>
                <Paragraph className="text-gray">Đội ngũ chuyên gia tư vấn giúp bạn chọn sản phẩm phù hợp</Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-charcoal !mb-4 font-serif">Sản phẩm nổi bật</Title>
            <Paragraph className="text-lg text-gray max-w-2xl mx-auto">Khám phá mỹ phẩm được yêu thích nhất</Paragraph>
          </div>

          {loading ? (
            <div className="text-center py-12"><Spin size="large" /></div>
          ) : (
            <Row gutter={[24, 24]}>
              {featuredProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} lg={6}>
                  <Card
                    hoverable
                    className="border-0 shadow-sm h-full"
                    cover={
                      <Link to={`/products/${product.id}`}> {/* DÙNG ID Ở ĐÂY */}
                        <div className="h-64 overflow-hidden bg-gray-100">
                          <img
                            alt={product.name}
                            src={getImageUrl(product.thumb_image)}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== "https://placehold.co/400x400?text=No+Image") {
                                  target.src = "https://placehold.co/400x400?text=No+Image";
                              }
                            }}
                          />
                        </div>
                      </Link>
                    }
                    actions={[
                      <Link key="view" to={`/products/${product.id}`}> {/* DÙNG ID Ở ĐÂY */}
                        <Button type="primary" className="bg-primary border-primary w-[90%] mx-auto block">
                          Xem chi tiết
                        </Button>
                      </Link>,
                    ]}
                  >
                    <Meta
                      title={
                        <Link to={`/products/${product.id}`} className="text-charcoal hover:text-primary line-clamp-1">
                          {product.name}
                        </Link>
                      }
                      description={
                        <div className="space-y-2">
                          <Text className="text-primary font-semibold text-lg">
                            {formatCurrency(Number(product.min_price || 0))}
                          </Text>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="large" className="border-primary text-primary hover:!border-primary hover:!text-primary">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section - Ẩn khi đã có auth_token */}
      {!isLoggedIn && (
        <section className="py-16 bg-primary/5">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <Title level={2} className="!text-charcoal !mb-4 font-serif">Đăng ký nhận tin</Title>
            <Paragraph className="text-lg text-gray mb-8">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt từ Muse Cosmetics
            </Paragraph>
            <div className="max-w-md mx-auto">
              <Link to="/register">
                <Button type="primary" size="large" className="bg-primary border-primary w-full">Đăng ký ngay</Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;