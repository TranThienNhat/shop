import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Dropdown,
  Space,
  Tooltip,
  Breadcrumb,
} from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  DashboardOutlined,
  ShoppingOutlined,
  TagsOutlined,
  BranchesOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  GiftOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    { key: "/admin", icon: <DashboardOutlined />, label: <Link to="/admin">Dashboard</Link> },
    { key: "/admin/products", icon: <ShoppingOutlined />, label: <Link to="/admin/products">Sản phẩm</Link> },
    { key: "/admin/categories", icon: <TagsOutlined />, label: <Link to="/admin/categories">Danh mục</Link> },
    { key: "/admin/brands", icon: <BranchesOutlined />, label: <Link to="/admin/brands">Thương hiệu</Link> },
    { key: "/admin/coupons", icon: <GiftOutlined />, label: <Link to="/admin/coupons">Mã giảm giá</Link> },
    { key: "/admin/orders", icon: <ShoppingCartOutlined />, label: <Link to="/admin/orders">Đơn hàng</Link> },
    { key: "/admin/users", icon: <UserOutlined />, label: <Link to="/admin/users">Người dùng</Link> },
  ];

  const userMenuItems = [
    { key: "profile", label: "Thông tin cá nhân", icon: <UserOutlined /> },
    {
      key: "user-site",
      label: <Link to="/" className="flex items-center gap-2"><HomeOutlined /> Về trang người dùng</Link>,
    },
    { type: "divider" as const },
    { key: "logout", label: "Đăng xuất", icon: <LogoutOutlined />, onClick: logout },
  ];

  return (
    <Layout className="min-h-screen">
      {/* SIDER */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white shadow-lg z-[100]"
        width={250}
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
        }}
      >
        <div className="p-4 border-b border-gray-100 flex justify-center items-center h-20">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-400 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            {!collapsed && (
              <Title level={5} className="!mb-0 !text-slate-800 whitespace-nowrap">
                Linh Admin
              </Title>
            )}
          </Link>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none mt-2"
        />
      </Sider>

      {/* MAIN SECTION */}
      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start", // Quan trọng: Luôn bắt đầu từ đỉnh
        }}
      >
        <Header
          className="bg-white shadow-sm px-6 flex items-center justify-between"
          style={{
            position: "fixed",
            zIndex: 99,
            width: `calc(100% - ${collapsed ? 80 : 250}px)`,
            height: 64,
            transition: "width 0.2s",
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />

          <Space size="middle">
            <Tooltip title="Về trang chủ">
              <Link to="/">
                <Button type="text" icon={<HomeOutlined />} />
              </Link>
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <Button type="text" className="flex items-center gap-2">
                <UserOutlined />
                <span className="font-medium">{user?.name}</span>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        {/* CONTENT AREA */}
        <Content
          className="p-6 bg-slate-50"
          style={{ 
            marginTop: 64, // Khớp với chiều cao Header
            minHeight: "calc(100vh - 64px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start" // Đảm bảo nội dung con không bị đẩy xuống dưới
          }}
        >
          <Breadcrumb className="mb-6">
            <Breadcrumb.Item><HomeOutlined /></Breadcrumb.Item>
            <Breadcrumb.Item>Admin</Breadcrumb.Item>
            {location.pathname !== "/admin" && (
              <Breadcrumb.Item className="capitalize">
                {location.pathname.split("/").pop()}
              </Breadcrumb.Item>
            )}
          </Breadcrumb>

          {/* Wrapper cho children để tránh lỗi flex của Content */}
          <div className="w-full h-full flex flex-col justify-start">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;