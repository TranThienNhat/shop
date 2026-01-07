import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider } from "antd";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { antdTheme } from "./config/theme";
import MainLayout from "./components/Layout/MainLayout";
import AdminLayout from "./components/Layout/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import OrdersPage from "./pages/OrdersPage";
// Admin Pages
import DashboardPage from "./pages/admin/DashboardPage";
import AdminProductsPage from "./pages/admin/ProductsPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import BrandsPage from "./pages/admin/BrandsPage";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import UsersPage from "./pages/admin/UsersPage";
import CouponManagement from "./pages/admin/CouponManagement";
import "./index.css";

const App: React.FC = () => {
  return (
    <ConfigProvider theme={antdTheme}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              {/* Auth Routes (without layout) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/checkout/success"
                element={<CheckoutSuccessPage />}
              />

              {/* Admin Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminLayout>
                      <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route
                          path="/products"
                          element={<AdminProductsPage />}
                        />
                        <Route
                          path="/products/create"
                          element={<ProductFormPage />}
                        />
                        <Route
                          path="/products/:id/edit"
                          element={<ProductFormPage />}
                        />
                        <Route
                          path="/categories"
                          element={<CategoriesPage />}
                        />
                        <Route path="/brands" element={<BrandsPage />} />
                        <Route path="/orders" element={<AdminOrdersPage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/coupons" element={<CouponManagement />} />
                        {/* Add more admin routes here */}
                      </Routes>
                    </AdminLayout>
                  </ProtectedRoute>
                }
              />

              {/* Main Routes (with layout) */}
              <Route
                path="/*"
                element={
                  <MainLayout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route
                        path="/products/:slug"
                        element={<ProductDetailPage />}
                      />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/orders" element={<OrdersPage />} />

                      {/* Fallback route */}
                      <Route
                        path="*"
                        element={
                          <div className="min-h-screen bg-background flex items-center justify-center">
                            <div className="text-center">
                              <h1 className="text-4xl font-bold text-charcoal mb-4">
                                404
                              </h1>
                              <p className="text-gray mb-6">
                                Trang không tồn tại
                              </p>
                              <a
                                href="/"
                                className="text-primary hover:text-primary/80">
                                Về trang chủ
                              </a>
                            </div>
                          </div>
                        }
                      />
                    </Routes>
                  </MainLayout>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
