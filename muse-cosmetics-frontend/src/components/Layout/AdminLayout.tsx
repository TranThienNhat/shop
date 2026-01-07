import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Typography,
  Dropdown,
  Space,
  Badge,
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
  BellOutlined,
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
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>,
    },
    {
      key: "/admin/products",
      icon: <ShoppingOutlined />,
      label: <Link to="/admin/products">Sản phẩm</Link>,
    },
    {
      key: "/admin/categories",
      icon: <TagsOutlined />,
      label: <Link to="/admin/categories">Danh mục</Link>,
    },
    {
      key: "/admin/brands",
      icon: <BranchesOutlined />,
      label: <Link to="/admin/brands">Thương hiệu</Link>,
    },
    {
      key: "/admin/coupons",
      icon: <GiftOutlined />,
      label: <Link to="/admin/coupons">Mã giảm giá</Link>,
    },
    {
      key: "/admin/orders",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/orders">Đơn hàng</Link>,
    },
    {
      key: "/admin/users",
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Người dùng</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
      icon: <UserOutlined />,
    },
    {
      key: "user-site",
      label: (
        <Link to="/" className="flex items-center gap-2">
          <HomeOutlined />
          Về trang người dùng
        </Link>
      ),
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="bg-white shadow-lg"
        width={250}
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}>
        <div className="p-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            {!collapsed && (
              <div>
                <Title level={5} className="!mb-0 !text-charcoal">
                  Muse Admin
                </Title>
              </div>
            )}
          </Link>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          className="border-none"
          style={{ height: "calc(100vh - 80px)", borderRight: 0 }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 80 : 250,
          transition: "margin-left 0.2s",
        }}>
        <Header
          className="bg-white shadow-sm px-4 flex items-center justify-between"
          style={{
            position: "fixed",
            zIndex: 1,
            width: `calc(100% - ${collapsed ? 80 : 250}px)`,
            transition: "width 0.2s",
          }}>
          <div className="flex items-center gap-4">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-charcoal hover:text-primary"
            />
          </div>

          <Space size="middle">
            <Tooltip title="Về trang người dùng">
              <Link to="/">
                <Button
                  type="text"
                  icon={<HomeOutlined />}
                  className="text-charcoal hover:text-primary"
                />
              </Link>
            </Tooltip>

            <Tooltip title="Thông báo">
              <Badge count={5} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  className="text-charcoal hover:text-primary"
                />
              </Badge>
            </Tooltip>

            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}>
              <Button
                type="text"
                className="text-charcoal hover:text-primary flex items-center gap-2">
                <UserOutlined />
                <span>{user?.name}</span>
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content
          className="p-6 bg-gray-50"
          style={{ marginTop: 64, minHeight: "calc(100vh - 64px)" }}>
          <div className="mb-4">
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link to="/" className="text-gray-500 hover:text-primary">
                  <HomeOutlined className="mr-1" />
                  Trang chủ
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link to="/admin" className="text-gray-500 hover:text-primary">
                  Admin Panel
                </Link>
              </Breadcrumb.Item>
              {location.pathname !== "/admin" && (
                <Breadcrumb.Item className="text-charcoal">
                  {location.pathname.includes("/products") && "Sản phẩm"}
                  {location.pathname.includes("/categories") && "Danh mục"}
                  {location.pathname.includes("/brands") && "Thương hiệu"}
                  {location.pathname.includes("/coupons") && "Mã giảm giá"}
                  {location.pathname.includes("/orders") && "Đơn hàng"}
                  {location.pathname.includes("/users") && "Người dùng"}
                  {location.pathname.includes("/reports") && "Báo cáo"}
                </Breadcrumb.Item>
              )}
            </Breadcrumb>
          </div>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
