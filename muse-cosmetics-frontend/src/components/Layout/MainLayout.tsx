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
  Phone,
  BookOpen,
  Heart,
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
    }
  };

  const menuItems = [
    { key: "/", label: <Link to="/">Trang chủ</Link> },
    { key: "/brands", label: <Link to="/brands">Thương hiệu</Link> },
    { key: "/products", label: <Link to="/products">Sản phẩm</Link> },
    { key: "/blogs", label: <Link to="/blogs">Blog làm đẹp</Link> },
    { key: "/about", label: <Link to="/about">Giới thiệu</Link> },
    { key: "/contact", label: <Link to="/contact">Liên hệ</Link> },
  ];

  const userMenuItems = [
    {
      key: "orders",
      label: (
        <Link to="/orders" className="flex items-center gap-2 py-1">
          {" "}
          <Package size={16} /> <span>Đơn hàng của tôi</span>{" "}
        </Link>
      ),
    },
    // Đã sửa tại đây: Cho phép cả Admin và Staff thấy nút Quản trị
    ...(user?.role === "admin" || user?.role === "staff"
      ? [
          {
            key: "admin",
            label: (
              <Link to="/admin" className="flex items-center gap-2 py-1">
                {" "}
                <Settings size={16} /> <span>Quản trị hệ thống</span>{" "}
              </Link>
            ),
          },
        ]
      : []),
    { type: "divider" as const },
    {
      key: "logout",
      label: (
        <span className="flex items-center gap-2 text-red-500 py-1 hover:text-red-600 transition-colors">
          {" "}
          <LogOut size={16} /> <span>Đăng xuất</span>{" "}
        </span>
      ),
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen bg-[#FDFBF7]">
      <Header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100 h-20 flex items-center px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          <Link to="/" className="flex items-center">
            <Title
              level={3}
              className="!mb-0 !text-[#2D2D2D] font-serif tracking-tighter"
            >
              Linh Cosmetics
            </Title>
          </Link>

          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="flex-1 justify-center bg-transparent border-none hidden md:flex font-medium"
          />

          <Space size="middle">
            <Button
              type="text"
              icon={<Search size={22} />}
              onClick={() => setSearchModalVisible(true)}
            />
            <Badge count={totalItems} color="#BC8F8F">
              <Button
                type="text"
                icon={<ShoppingCart size={22} />}
                onClick={() => navigate("/cart")}
              />
            </Badge>
            {isAuthenticated ? (
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Button
                  type="text"
                  className="flex items-center gap-2 font-medium"
                >
                  <User size={22} />{" "}
                  <span className="hidden lg:inline">{user?.name}</span>
                </Button>
              </Dropdown>
            ) : (
              <Link to="/login">
                <Button
                  type="primary"
                  className="bg-[#BC8F8F] rounded-full px-6"
                >
                  Đăng nhập
                </Button>
              </Link>
            )}
          </Space>
        </div>
      </Header>

      <Content className="flex-1">{children}</Content>

      <Footer className="bg-[#2D2D2D] text-white/70 py-16 px-8 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Title level={4} className="!text-white font-serif">
              Linh Cosmetics
            </Title>
            <p className="text-sm italic">
              "Vẻ đẹp bắt đầu từ sự chăm sóc tâm hồn và làn da."
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Khám phá</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="hover:text-[#BC8F8F]">
                  Tất cả sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/blogs" className="hover:text-[#BC8F8F]">
                  Bí quyết làm đẹp
                </Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-[#BC8F8F]">
                  Thương hiệu nổi bật
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Liên hệ</h4>
            <p className="text-sm">Hotline: 1900 1234</p>
            <p className="text-sm">Email: contact@linhcosmetics.vn</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6">Theo dõi chúng tôi</h4>
            <div className="flex gap-4">
              {/* Thêm các icon mạng xã hội ở đây */}
            </div>
          </div>
        </div>
      </Footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
        <a
          href="https://zalo.me/0334523154" // Thay số điện thoại của bạn vào đây
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 bg-[#0068FF] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform overflow-hidden"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" 
            alt="Zalo" 
            className="w-8 h-8"
          />
        </a>
      </div>

      <Modal
        open={searchModalVisible}
        onCancel={() => setSearchModalVisible(false)}
        footer={null}
        centered
      >
        <Input
          placeholder="Bạn tìm gì hôm nay?"
          size="large"
          prefix={<Search size={20} />}
          onPressEnter={handleSearch}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Modal>
    </Layout>
  );
};

export default MainLayout;