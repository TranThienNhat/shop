import React from "react";
import { Typography, Row, Col, Button, Divider, Card } from "antd";
import { Heart, Sparkles, Leaf, ShieldCheck, ArrowRight, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#fffafb] min-h-screen pb-24">
      {/* 1. HERO SECTION - LỜI CHÀO NÀNG THƠ */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-20"
            alt="Muse Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#fffafb]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl">
          <Text className="text-rose-400 uppercase tracking-[0.4em] font-bold text-xs mb-4 block">
            Since 2024 • Muse Cosmetics
          </Text>
          <Title level={1} className="!font-serif !text-6xl !text-charcoal !mb-6 leading-tight">
            Đánh thức vẻ đẹp <br /> <span className="italic text-rose-400">thuần khiết</span> của nàng
          </Title>
          <div className="w-16 h-1 bg-rose-200 mx-auto rounded-full mb-8"></div>
          <Paragraph className="text-gray-500 text-lg italic font-serif leading-relaxed">
            "Tại Muse, chúng mình tin rằng mỹ phẩm không chỉ để trang điểm, <br /> 
            mà là để tôn vinh câu chuyện riêng của mỗi người phụ nữ."
          </Paragraph>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* 2. CÂU CHUYỆN THƯƠNG HIỆU */}
        <Row gutter={[64, 64]} className="items-center mb-32">
          <Col xs={24} lg={12}>
            <div className="relative p-4">
              <div className="aspect-[3/4] rounded-[60px] overflow-hidden shadow-2xl rotate-2">
                <img 
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1974&auto=format&fit=crop" 
                  className="w-full h-full object-cover"
                  alt="Story"
                />
              </div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-rose-100/50 rounded-full blur-3xl -z-10"></div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="space-y-6">
              <Title level={2} className="!font-serif !text-4xl text-charcoal">Câu chuyện từ tâm hồn</Title>
              <Paragraph className="text-gray-500 text-base leading-relaxed">
                Muse Cosmetics ra đời từ những ngày đầu đông năm 2024, bắt nguồn từ khát khao tìm kiếm những giá trị thực trong ngành làm đẹp. Chúng mình không theo đuổi những xu hướng chớp nhoáng, Muse chọn đồng hành cùng các nàng trong hành trình chăm sóc bản thân bền vững.
              </Paragraph>
              <Paragraph className="text-gray-500 text-base leading-relaxed">
                Mỗi sản phẩm tại Muse đều được tuyển chọn khắt khe, từ thành phần thiên nhiên lành tính đến bao bì tinh tế, mang lại trải nghiệm vỗ về làn da và tâm trí sau những giờ làm việc mệt mỏi.
              </Paragraph>
              <Button 
                type="link" 
                className="text-rose-400 p-0 font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:gap-4 transition-all"
              >
                Khám phá bộ sưu tập <ArrowRight size={16} />
              </Button>
            </div>
          </Col>
        </Row>

        {/* 3. GIÁ TRỊ CỐT LÕI - 3 CỘT */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <Title level={2} className="!font-serif">Triết lý của Muse</Title>
            <Text className="text-gray-400 italic">Những giá trị tạo nên sự khác biệt</Text>
          </div>
          
          <Row gutter={[32, 32]}>
            {[
              { 
                icon: <Leaf className="text-rose-300" size={32} />, 
                title: "Thuần Khiết", 
                desc: "Cam kết 100% nguyên liệu an toàn, minh bạch và lành tính cho mọi làn da nhạy cảm nhất." 
              },
              { 
                icon: <Heart className="text-rose-300" size={32} />, 
                title: "Yêu Bản Thân", 
                desc: "Chúng mình khuyến khích các nàng dành ít nhất 15 phút mỗi ngày để lắng nghe và chăm sóc làn da." 
              },
              { 
                icon: <ShieldCheck className="text-rose-300" size={32} />, 
                title: "Trách Nhiệm", 
                desc: "Nói không với thử nghiệm trên động vật và luôn ưu tiên các vật liệu đóng gói thân thiện môi trường." 
              }
            ].map((item, idx) => (
              <Col xs={24} md={8} key={idx}>
                <Card className="border-none bg-white rounded-[40px] p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 h-full">
                  <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    {item.icon}
                  </div>
                  <Title level={4} className="!font-serif mb-4">{item.title}</Title>
                  <Text className="text-gray-400 leading-relaxed block">{item.desc}</Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 4. QUOTE TRÂN TRỌNG */}
        <div className="bg-rose-400 rounded-[60px] p-16 text-center text-white mb-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles size={120} />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <Title level={2} className="!text-white !font-serif !text-4xl mb-8">
              "Mỗi nàng thơ là một bông hoa độc bản, và Muse ở đây để giúp nàng tỏa hương."
            </Title>
            <Divider className="border-rose-300 w-24 mx-auto" />
            <Text className="uppercase tracking-[0.3em] text-[10px] font-bold">LỜI TỪ ĐỘI NGŨ MUSE</Text>
          </div>
        </div>

        {/* 5. KÊNH KẾT NỐI */}
        <div className="text-center">
          <Title level={3} className="!font-serif mb-10">Ghé thăm ngôi nhà của Muse</Title>
          <div className="flex justify-center gap-6">
            <Button 
              size="large" 
              className="rounded-full border-rose-100 text-rose-400 h-14 px-8 font-bold flex items-center gap-3 hover:!border-rose-400 hover:!text-rose-400"
            >
              <Instagram size={20} /> @muse.cosmetics
            </Button>
            <Link to="/products">
              <Button 
                type="primary" 
                size="large" 
                className="bg-charcoal border-none rounded-full h-14 px-10 font-bold uppercase tracking-widest shadow-xl shadow-rose-100 hover:!bg-black"
              >
                Mua sắm ngay
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;