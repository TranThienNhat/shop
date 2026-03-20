import React, { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Spin, Breadcrumb, Button } from "antd";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Heart } from "lucide-react";
import api from "../utils/api";
import { getImageUrl } from "../utils/helpers";

const { Title, Text, Paragraph } = Typography;

const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await api.get("/brands");
        setBrands(response.data.data || []);
      } catch (error) {
        console.error("Lỗi tải thương hiệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#fffafb]"><Spin size="large" /></div>;

  return (
    <div className="bg-[#fffafb] min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb nhẹ nhàng, không thô cứng */}
        <Breadcrumb 
          className="mb-12 uppercase tracking-widest text-[10px] opacity-60"
          items={[{ title: <Link to="/">Trang chủ</Link> }, { title: "Thương hiệu" }]} 
        />
        
        {/* Phần tiêu đề đầy cảm hứng */}
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-2 mb-3">
             <Sparkles size={18} className="text-rose-300" />
             <Text className="text-rose-400 uppercase tracking-[0.4em] font-bold text-[10px]">Muse Partners</Text>
             <Sparkles size={18} className="text-rose-300" />
          </div>
          <Title level={2} className="!font-serif !text-5xl !text-charcoal !mb-6">Những người bạn đồng hành</Title>
          <div className="w-12 h-1 bg-rose-200 mx-auto rounded-full mb-8"></div>
          <Paragraph className="text-gray-400 italic font-serif text-lg max-w-xl mx-auto leading-relaxed">
            "Tại Muse, chúng mình chỉ bắt tay với những thương hiệu trân quý vẻ đẹp tự nhiên và sự an lành của làn da nàng."
          </Paragraph>
        </div>

        {/* Brand Grid - Lột xác từ Table sang Card */}
        <Row gutter={[32, 48]}>
          {brands.map((brand) => (
            <Col xs={24} sm={12} md={8} lg={6} key={brand.id}>
              <Link to={`/products?brand_id=${brand.id}`}>
                <Card
                  hoverable
                  className="border-none shadow-sm h-full rounded-[40px] overflow-hidden group bg-white p-3 transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
                  cover={
                    <div className="h-64 overflow-hidden bg-rose-50/20 rounded-[32px] flex items-center justify-center p-12 relative">
                      {/* Logo thương hiệu được đặt trang trọng ở giữa */}
                      <img
                        alt={brand.name}
                        src={getImageUrl(brand.image_url)}
                        className="max-w-[80%] max-h-[80%] object-contain group-hover:scale-110 transition-transform duration-700 ease-in-out grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100"
                      />
                      
                      {/* Tag nhỏ xinh góc card */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Heart size={16} fill="#fb7185" className="text-rose-400" />
                      </div>
                    </div>
                  }
                >
                  <div className="p-4 text-center">
                    <Title level={4} className="!font-serif !mb-4 group-hover:text-rose-400 transition-colors">
                      {brand.name}
                    </Title>
                    
                    {/* Nút bấm mềm mại thay cho mấy cái icon Edit/Delete của Admin */}
                    <Button 
                      block 
                      className="rounded-full border-rose-100 text-rose-400 font-bold uppercase tracking-widest text-[9px] h-11 flex items-center justify-center gap-2 group-hover:bg-rose-400 group-hover:text-white transition-all border-2"
                    >
                      Khám phá sản phẩm <ArrowRight size={14} />
                    </Button>
                  </div>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>

        {/* Phần đuôi trang để khách không cảm thấy trống trải */}
        <div className="mt-32 p-12 bg-white rounded-[60px] text-center border border-rose-50 shadow-sm relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-rose-50 rounded-full blur-3xl"></div>
            <Title level={3} className="!font-serif mb-4">Nàng muốn tìm một cái tên khác?</Title>
            <Paragraph className="text-gray-400 mb-8 max-w-md mx-auto">Nếu thương hiệu yêu thích của nàng chưa có mặt, đừng ngần ngại nhắn cho Muse nhé!</Paragraph>
            <Link to="/contact">
                <Button size="large" className="rounded-full border-charcoal text-charcoal px-10 h-14 font-bold uppercase tracking-widest text-xs hover:!border-rose-400 hover:!text-rose-400 transition-all">
                    Gửi yêu thương cho Muse
                </Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default BrandsPage;