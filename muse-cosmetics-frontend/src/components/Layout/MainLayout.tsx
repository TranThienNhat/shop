import React from "react";
import { Layout, Menu, Badge, Dropdown, Button, Space, Typography } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Search,
  Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();

  const menuItems = [
    {
      key: "/",
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "/products",
      label: <Link to="/products">Sản phẩm</Link>,
    },
    {
      key: "/about",
      label: <Link to="/about">Giới thiệu</Link>,
    },
    {
      key: "/contact",
      label: <Link to="/contact">Liên hệ</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "orders",
      label: (
        <Link to="/orders" className="flex items-center gap-2">
          <Package size={16} />
          Đơn hàng của tôi
        </Link>
      ),
    },
    ...(user?.role === "admin"
      ? [
          {
            key: "admin",
            label: (
              <Link to="/admin" className="flex items-center gap-2">
                <Settings size={16} />
                Quản trị
              </Link>
            ),
          },
        ]
      : []),
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: (
        <span className="flex items-center gap-2 text-red-500">
          <LogOut size={16} />
          Đăng xuất
        </span>
      ),
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-background">
      <Header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-gray-200 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Title level={2} className="!mb-0 !text-charcoal font-serif">
              Muse Cosmetics
            </Title>
          </Link>

          {/* Navigation Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="flex-1 justify-center bg-transparent border-none"
          />

          {/* Right Actions */}
          <Space size="middle">
            {/* Search */}
            <Button
              type="text"
              icon={<Search size={20} />}
              className="text-charcoal hover:text-primary"
              onClick={() => navigate("/search")}
            />

            {/* Cart */}
            <Badge count={totalItems} size="small">
              <Button
                type="text"
                icon={<ShoppingCart size={20} />}
                className="text-charcoal hover:text-primary"
                onClick={() => navigate("/cart")}
              />
            </Badge>

            {/* User Menu */}
            {isAuthenticated ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}>
                <Button
                  type="text"
                  className="text-charcoal hover:text-primary flex items-center gap-2">
                  <User size={20} />
                  <span className="hidden md:inline">{user?.name}</span>
                </Button>
              </Dropdown>
            ) : (
              <Space>
                <Link to="/login">
                  <Button
                    type="text"
                    className="text-charcoal hover:text-primary">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" className="bg-primary border-primary">
                    Đăng ký
                  </Button>
                </Link>
              </Space>
            )}
          </Space>
        </div>
      </Header>

      <Content className="flex-1">{children}</Content>

      <Footer className="bg-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Title level={4} className="!text-white !mb-4 font-serif">
                Muse Cosmetics
              </Title>
              <p className="text-gray-300">
                Thương hiệu mỹ phẩm cao cấp, mang đến vẻ đẹp tự nhiên và sang
                trọng cho phụ nữ Việt.
              </p>
            </div>

            <div>
              <Title level={5} className="!text-white !mb-4">
                Sản phẩm
              </Title>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link
                    to="/products?category=skincare"
                    className="hover:text-primary">
                    Chăm sóc da
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=makeup"
                    className="hover:text-primary">
                    Trang điểm
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products?category=fragrance"
                    className="hover:text-primary">
                    Nước hoa
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Title level={5} className="!text-white !mb-4">
                Hỗ trợ
              </Title>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <Link to="/contact" className="hover:text-primary">
                    Liên hệ
                  </Link>
                </li>
                <li>
                  <Link to="/shipping" className="hover:text-primary">
                    Chính sách giao hàng
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="hover:text-primary">
                    Đổi trả
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <Title level={5} className="!text-white !mb-4">
                Liên hệ
              </Title>
              <div className="space-y-2 text-gray-300">
                <p>Email: info@musecosmetics.vn</p>
                <p>Hotline: 1900 1234</p>
                <p>Địa chỉ: 123 Nguyễn Huệ, Q1, TP.HCM</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Muse Cosmetics. All rights reserved.</p>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
