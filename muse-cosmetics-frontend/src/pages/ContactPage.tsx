import React, { useState } from "react";
import { Typography, Row, Col, Button, Input, Form, Card, message } from "antd";
import { 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  Send, 
  Clock, 
  Instagram, 
  Facebook 
} from "lucide-react";

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const ContactPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log("Dữ liệu liên hệ:", values);
    // Giả lập gửi API
    setTimeout(() => {
      message.success("Cảm ơn nàng đã gửi lời nhắn, Muse sẽ phản hồi sớm nhất nhé! ✨");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-[#fffafb] min-h-screen pb-24">
      {/* 1. HERO SECTION */}
      <div className="py-20 text-center bg-white border-b border-rose-50">
        <div className="max-w-3xl mx-auto px-4">
          <Text className="text-rose-400 uppercase tracking-[0.4em] font-bold text-[10px] mb-4 block">
            Kết nối cùng Muse
          </Text>
          <Title level={1} className="!font-serif !text-5xl !text-charcoal !mb-6">
            Gửi lời tâm tình <br /> <span className="italic text-rose-300">cho chúng mình</span>
          </Title>
          <div className="w-12 h-1 bg-rose-200 mx-auto rounded-full mb-6"></div>
          <Paragraph className="text-gray-400 text-base italic font-serif">
            "Dù là một câu hỏi nhỏ hay một lời góp ý chân thành, <br /> 
            Muse luôn sẵn lòng lắng nghe nàng mọi lúc."
          </Paragraph>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 -mt-10">
        <Row gutter={[48, 48]}>
          {/* 2. CỘT TRÁI: THÔNG TIN LIÊN HỆ */}
          <Col xs={24} lg={10}>
            <div className="space-y-6">
              {[
                { 
                  icon: <MapPin size={20} />, 
                  title: "Ngôi nhà của Muse", 
                  detail: "123 Đường Lụa, Phường Hoa, Quận Nàng Thơ, TP. Hồ Chí Minh" 
                },
                { 
                  icon: <Phone size={20} />, 
                  title: "Đường dây nóng", 
                  detail: "1900 1234 • 0987 654 321" 
                },
                { 
                  icon: <Mail size={20} />, 
                  title: "Hòm thư điện tử", 
                  detail: "love@musecosmetics.vn" 
                },
                { 
                  icon: <Clock size={20} />, 
                  title: "Giờ ghé chơi", 
                  detail: "Thứ 2 - Chủ Nhật (09:00 - 21:00)" 
                }
              ].map((item, idx) => (
                <Card 
                  key={idx} 
                  className="border-none bg-white rounded-[32px] shadow-sm hover:shadow-md transition-all p-2 group"
                >
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-400 group-hover:bg-rose-400 group-hover:text-white transition-all duration-500">
                      {item.icon}
                    </div>
                    <div>
                      <Text strong className="block text-charcoal text-sm uppercase tracking-wider mb-1">
                        {item.title}
                      </Text>
                      <Text className="text-gray-400 text-xs leading-relaxed">
                        {item.detail}
                      </Text>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Mạng xã hội */}
              <div className="p-8 bg-rose-400 rounded-[40px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <MessageCircle size={80} />
                </div>
                <Title level={4} className="!text-white !font-serif mb-6">Theo dõi Muse trên mxh</Title>
                <div className="flex gap-4">
                    <Button shape="circle" icon={<Instagram size={18} />} className="bg-white/20 border-none text-white hover:!bg-white hover:!text-rose-400" />
                    <Button shape="circle" icon={<Facebook size={18} />} className="bg-white/20 border-none text-white hover:!bg-white hover:!text-rose-400" />
                </div>
              </div>
            </div>
          </Col>

          {/* 3. CỘT PHẢI: FORM LIÊN HỆ */}
          <Col xs={24} lg={14}>
            <div className="bg-white p-12 rounded-[48px] shadow-xl shadow-rose-100/20 border border-rose-50">
              <Title level={3} className="!font-serif mb-8 text-charcoal">Viết cho Muse</Title>
              
              <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
                <Row gutter={24}>
                  <Col span={12}>
                    <Form.Item 
                      name="name" 
                      label={<Text className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Tên của nàng</Text>}
                      rules={[{ required: true, message: 'Nàng cho Muse biết tên nhé!' }]}
                    >
                      <Input placeholder="Nguyễn Nàng Thơ" className="h-12 rounded-2xl border-rose-50 bg-[#fffafb] focus:border-rose-300" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      name="email" 
                      label={<Text className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Email liên hệ</Text>}
                      rules={[{ required: true, type: 'email', message: 'Email này không hợp lệ rồi nàng ơi!' }]}
                    >
                      <Input placeholder="nangtho@gmail.com" className="h-12 rounded-2xl border-rose-50 bg-[#fffafb] focus:border-rose-300" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item 
                  name="subject" 
                  label={<Text className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Chủ đề nàng quan tâm</Text>}
                >
                  <Input placeholder="Tư vấn da, Đặt hàng, Góp ý..." className="h-12 rounded-2xl border-rose-50 bg-[#fffafb] focus:border-rose-300" />
                </Form.Item>

                <Form.Item 
                  name="message" 
                  label={<Text className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Lời tâm tình của nàng</Text>}
                  rules={[{ required: true, message: 'Nàng đừng để trống lời nhắn nhé!' }]}
                >
                  <TextArea 
                    rows={5} 
                    placeholder="Viết điều gì đó thật xinh đẹp tại đây..." 
                    className="rounded-3xl border-rose-50 bg-[#fffafb] focus:border-rose-300 p-4" 
                  />
                </Form.Item>

                <Form.Item className="mb-0">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<Send size={18} />}
                    className="bg-rose-400 border-none h-14 rounded-full w-full font-bold uppercase tracking-widest shadow-lg shadow-rose-100 hover:!bg-rose-500 hover:-translate-y-1 transition-all"
                  >
                    Gửi lời nhắn ✨
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </div>

      {/* 4. GOOGLE MAP PLACEHOLDER */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-24">
        <div className="w-full h-[400px] bg-rose-50 rounded-[60px] overflow-hidden relative shadow-inner">
            <div className="absolute inset-0 flex items-center justify-center flex-col opacity-50">
                <MapPin size={48} className="text-rose-300 mb-4" />
                <Text className="font-serif italic text-rose-400">Bản đồ ghé thăm cửa hàng Muse đang được cập nhật...</Text>
            </div>
            {/* Nếu nàng có Google Map Iframe, hãy thay thế vào đây */}
            {/* <iframe src="..." width="100%" height="100%" style={{ border: 0 }} allowFullScreen></iframe> */}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;