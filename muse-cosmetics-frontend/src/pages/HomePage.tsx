import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Typography, Carousel, Spin } from "antd";
import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { Product } from "../types";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Paragraph } = Typography;
const { Meta } = Card;

const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
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
      image: "/hero-1.jpg",
      cta: "Khám phá ngay",
    },
    {
      title: "Chăm sóc da chuyên sâu",
      subtitle: "Công nghệ tiên tiến",
      description: "Dòng sản phẩm chăm sóc da với thành phần tự nhiên",
      image: "/hero-2.jpg",
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
                          <p className="text-primary font-medium mb-2">
                            {slide.subtitle}
                          </p>
                          <Title
                            level={1}
                            className="!text-charcoal !mb-4 font-serif">
                            {slide.title}
                          </Title>
                          <Paragraph className="text-lg text-gray mb-6">
                            {slide.description}
                          </Paragraph>
                        </div>
                        <Link to="/products">
                          <Button
                            type="primary"
                            size="large"
                            className="bg-primary border-primary hover:bg-primary/90 flex items-center gap-2">
                            {slide.cta}
                            <ArrowRight size={16} />
                          </Button>
                        </Link>
                      </div>
                    </Col>
                    <Col xs={24} lg={12}>
                      <div className="h-[400px] bg-white/50 rounded-lg flex items-center justify-center">
                        <p className="text-gray">Hero Image Placeholder</p>
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
                <Title level={4} className="!text-charcoal">
                  Chất lượng cao cấp
                </Title>
                <Paragraph className="text-gray">
                  Sản phẩm được tuyển chọn từ các thương hiệu uy tín hàng đầu
                  thế giới
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Star className="text-primary" size={24} />
                </div>
                <Title level={4} className="!text-charcoal">
                  Giao hàng nhanh
                </Title>
                <Paragraph className="text-gray">
                  Giao hàng tận nơi trong 24h tại TP.HCM và 2-3 ngày toàn quốc
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Star className="text-primary" size={24} />
                </div>
                <Title level={4} className="!text-charcoal">
                  Tư vấn chuyên nghiệp
                </Title>
                <Paragraph className="text-gray">
                  Đội ngũ chuyên gia tư vấn giúp bạn chọn sản phẩm phù hợp nhất
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <Title level={2} className="!text-charcoal !mb-4 font-serif">
              Sản phẩm nổi bật
            </Title>
            <Paragraph className="text-lg text-gray max-w-2xl mx-auto">
              Khám phá những sản phẩm mỹ phẩm được yêu thích nhất tại Muse
              Cosmetics
            </Paragraph>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {featuredProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} lg={6}>
                  <Card
                    hoverable
                    className="border-0 shadow-sm"
                    cover={
                      <div className="h-64 overflow-hidden">
                        <img
                          alt={product.name}
                          src={getImageUrl(product.image_url)}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-product.jpg";
                          }}
                        />
                      </div>
                    }
                    actions={[
                      <Link key="view" to={`/products/${product.slug}`}>
                        <Button
                          type="primary"
                          className="bg-primary border-primary w-full">
                          Xem chi tiết
                        </Button>
                      </Link>,
                    ]}>
                    <Meta
                      title={
                        <Link
                          to={`/products/${product.slug}`}
                          className="text-charcoal hover:text-primary">
                          {product.name}
                        </Link>
                      }
                      description={
                        <div className="space-y-2">
                          <p className="text-primary font-semibold text-lg">
                            {formatCurrency(product.price)}
                          </p>
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
              <Button
                size="large"
                className="border-primary text-primary hover:bg-primary hover:text-white">
                Xem tất cả sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <Title level={2} className="!text-charcoal !mb-4 font-serif">
            Đăng ký nhận tin
          </Title>
          <Paragraph className="text-lg text-gray mb-8">
            Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt từ Muse Cosmetics
          </Paragraph>
          <div className="max-w-md mx-auto">
            <Button
              type="primary"
              size="large"
              className="bg-primary border-primary w-full">
              Đăng ký ngay
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
