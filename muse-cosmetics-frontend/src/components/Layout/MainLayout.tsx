import React, { useState } from "react";
import {
  Layout,
  Menu,
  Badge,
  Dropdown,
  Button,
  Space,
  Typography,
  Input,
  Modal,
} from "antd";
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
const { Title, Text } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchModalVisible(false);
      setSearchValue("");
    } else {
      navigate("/products");
      setSearchModalVisible(false);
    }
  };

  const menuItems = [
    {
      key: "/",
      label: <Link to="/" className="text-base font-medium">Trang chủ</Link>,
    },
    { 
      key: "/brands", 
      label: <Link to="/brands" className="text-base font-medium">Thương hiệu</Link> 
    },
    {
      key: "/products",
      label: <Link to="/products" className="text-base font-medium">Sản phẩm</Link>,
    },
    {
      key: "/about",
      label: <Link to="/about" className="text-base font-medium">Giới thiệu</Link>,
    },
    {
      key: "/contact",
      label: <Link to="/contact" className="text-base font-medium">Liên hệ</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "orders",
      label: (
        <Link to="/orders" className="flex items-center gap-2 py-1">
          <Package size={16} />
          <span>Đơn hàng của tôi</span>
        </Link>
      ),
    },
    ...(user?.role === "admin"
      ? [
          {
            key: "admin",
            label: (
              <Link to="/admin" className="flex items-center gap-2 py-1">
                <Settings size={16} />
                <span>Quản trị hệ thống</span>
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
        <span className="flex items-center gap-2 text-red-500 py-1 hover:text-red-600 transition-colors">
          <LogOut size={16} />
          <span>Đăng xuất</span>
        </span>
      ),
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-background">
      {/* HEADER */}
      <Header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-gray/10 px-4 lg:px-8 h-20 flex items-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Title level={3} className="!mb-0 !text-charcoal font-serif tracking-tight">
              Muse Cosmetics
            </Title>
          </Link>

          {/* Navigation Menu (Desktop) */}
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="flex-1 justify-center bg-transparent border-none hidden md:flex"
          />

          {/* Right Actions */}
          <Space size="large" className="flex items-center">
            {/* Search */}
            <Button
              type="text"
              icon={<Search size={22} />}
              className="text-charcoal hover:text-primary transition-colors p-0 flex items-center justify-center"
              onClick={() => setSearchModalVisible(true)}
            />

            {/* Cart */}
            <Badge count={totalItems} size="small" color="#fb7185">
              <Button
                type="text"
                icon={<ShoppingCart size={22} />}
                className="text-charcoal hover:text-primary transition-colors p-0 flex items-center justify-center"
                onClick={() => navigate("/cart")}
              />
            </Badge>

            {/* User Menu / Login Actions */}
            {isAuthenticated ? (
              <Dropdown
                menu={{ items: userMenuItems }}
                placement="bottomRight"
                trigger={["click"]}
                overlayClassName="min-w-[200px]"
              >
                <Button
                  type="text"
                  className="text-charcoal hover:text-primary flex items-center gap-2 p-0 transition-colors"
                >
                  <User size={22} />
                  <span className="hidden lg:inline font-medium text-sm">{user?.name}</span>
                </Button>
              </Dropdown>
            ) : (
              <Space className="hidden md:flex ml-2">
                <Link to="/login">
                  <Button type="text" className="text-charcoal hover:text-primary font-medium">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" className="bg-primary border-primary hover:bg-primary/90 rounded-lg font-medium px-6">
                    Đăng ký
                  </Button>
                </Link>
              </Space>
            )}
          </Space>
        </div>
      </Header>

      {/* CONTENT */}
      <Content className="flex-1 flex flex-col">{children}</Content>

      {/* FOOTER */}
      <Footer className="bg-charcoal text-white/80 py-16 border-t border-gray/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            
            <div className="space-y-4">
              <Title level={3} className="!text-white !mb-0 font-serif tracking-tight">
                Muse Cosmetics
              </Title>
              <p className="text-white/60 leading-relaxed text-sm pr-4">
                Thương hiệu mỹ phẩm cao cấp, mang đến vẻ đẹp tự nhiên, thanh lịch và trải nghiệm chăm sóc bản thân hoàn hảo nhất.
              </p>
            </div>

            <div>
              <Title level={5} className="!text-white !mb-6 uppercase tracking-widest text-xs">
                Sản phẩm
              </Title>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link to="/products?category=skincare" className="hover:text-white transition-colors">Chăm sóc da</Link></li>
                <li><Link to="/products?category=makeup" className="hover:text-white transition-colors">Trang điểm</Link></li>
                <li><Link to="/products?category=fragrance" className="hover:text-white transition-colors">Nước hoa</Link></li>
                <li><Link to="/products?category=bodycare" className="hover:text-white transition-colors">Chăm sóc cơ thể</Link></li>
              </ul>
            </div>

            <div>
              <Title level={5} className="!text-white !mb-6 uppercase tracking-widest text-xs">
                Hỗ trợ khách hàng
              </Title>
              <ul className="space-y-3 text-sm text-white/60">
                <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors">Chính sách vận chuyển</Link></li>
                <li><Link to="/returns" className="hover:text-white transition-colors">Chính sách đổi trả</Link></li>
              </ul>
            </div>

            <div>
              <Title level={5} className="!text-white !mb-6 uppercase tracking-widest text-xs">
                Liên hệ
              </Title>
              <div className="space-y-3 text-sm text-white/60">
                <p className="flex items-center gap-2"><span className="text-white">Email:</span> hello@musecosmetics.vn</p>
                <p className="flex items-center gap-2"><span className="text-white">Hotline:</span> 1900 1234</p>
                <p className="leading-relaxed"><span className="text-white block mb-1">Cửa hàng chính:</span> 123 Đường Lụa, Phường Hoa, Quận Nàng Thơ, TP.HCM</p>
              </div>
            </div>

          </div>

          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
            <p>&copy; 2024 Muse Cosmetics. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Điều khoản dịch vụ</Link>
            </div>
          </div>
        </div>
      </Footer>

      {/* SEARCH MODAL */}
      <Modal
        open={searchModalVisible}
        onCancel={() => {
          setSearchModalVisible(false);
          setSearchValue("");
        }}
        footer={null}
        width={550}
        centered
        closeIcon={null}
        styles={{ content: { borderRadius: "20px", padding: "32px" } }}
      >
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <Title level={3} className="!font-serif !text-charcoal !mb-2">Tìm kiếm</Title>
            <Text className="text-gray text-sm">Nhập tên sản phẩm bạn đang tìm kiếm</Text>
          </div>
          
          <div className="flex gap-3">
            <Input
              placeholder="Ví dụ: son môi, serum dưỡng ẩm..."
              size="large"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onPressEnter={handleSearch}
              autoFocus
              className="rounded-lg border-gray/20 focus:border-primary focus:shadow-none bg-background h-12"
              prefix={<Search size={18} className="text-gray mr-2" />}
            />
            <Button 
              type="primary" 
              onClick={handleSearch}
              className="bg-primary border-primary hover:bg-primary/90 rounded-lg h-12 px-6 font-medium"
            >
              Tìm ngay
            </Button>
          </div>
          
          <div className="flex justify-center gap-4 text-xs">
            <Button type="text" onClick={() => { setSearchModalVisible(false); setSearchValue(""); }} className="text-gray hover:text-charcoal font-medium">
              Đóng cửa sổ
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default MainLayout;