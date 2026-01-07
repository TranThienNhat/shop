import React, { useEffect } from "react";
import { Form, Input, Button, Typography, Card, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const { Title, Paragraph } = Typography;

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: RegisterFormData) => {
    const success = await register(values.name, values.email, values.password);
    if (success) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <div className="text-center mb-8">
            <Title level={2} className="!text-charcoal !mb-2 font-serif">
              Đăng ký
            </Title>
            <Paragraph className="text-gray">
              Tạo tài khoản để trải nghiệm mua sắm tuyệt vời
            </Paragraph>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            size="large"
            requiredMark={false}>
            <Form.Item
              name="name"
              label="Họ và tên"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên" },
                { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự" },
              ]}>
              <Input
                prefix={<User size={16} className="text-gray" />}
                placeholder="Nguyễn Văn A"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email" },
                { type: "email", message: "Email không hợp lệ" },
              ]}>
              <Input
                prefix={<Mail size={16} className="text-gray" />}
                placeholder="your@email.com"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}>
              <Input.Password
                prefix={<Lock size={16} className="text-gray" />}
                placeholder="Nhập mật khẩu"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp")
                    );
                  },
                }),
              ]}>
              <Input.Password
                prefix={<Lock size={16} className="text-gray" />}
                placeholder="Nhập lại mật khẩu"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mb-6">
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full bg-primary border-primary rounded-lg h-12 text-base font-medium">
                Đăng ký
              </Button>
            </Form.Item>
          </Form>

          <div className="text-center text-xs text-gray mb-6">
            Bằng việc đăng ký, bạn đồng ý với{" "}
            <Link to="/terms" className="text-primary hover:text-primary/80">
              Điều khoản sử dụng
            </Link>{" "}
            và{" "}
            <Link to="/privacy" className="text-primary hover:text-primary/80">
              Chính sách bảo mật
            </Link>{" "}
            của chúng tôi.
          </div>

          <Divider className="my-6">
            <span className="text-gray text-sm">hoặc</span>
          </Divider>

          <div className="text-center">
            <Paragraph className="text-gray mb-2">Đã có tài khoản?</Paragraph>
            <Link to="/login">
              <Button
                size="large"
                className="w-full border-primary text-primary hover:bg-primary hover:text-white rounded-lg h-12">
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-gray hover:text-primary text-sm">
            ← Quay về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
