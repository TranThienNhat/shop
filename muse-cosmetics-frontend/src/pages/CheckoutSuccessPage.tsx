import React from "react";
import { Result, Button, Card, Typography } from "antd";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, Package, Home } from "lucide-react";

const { Paragraph } = Typography;

const CheckoutSuccessPage: React.FC = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <Card className="border-0 shadow-lg text-center">
          <Result
            icon={<CheckCircle size={72} className="text-green-500 mx-auto" />}
            title={
              <span className="text-charcoal font-serif text-2xl">
                Đặt hàng thành công!
              </span>
            }
            subTitle={
              <div className="space-y-4">
                <Paragraph className="text-gray text-lg">
                  Cảm ơn bạn đã mua sắm tại Muse Cosmetics. Đơn hàng của bạn đã
                  được tiếp nhận và đang được xử lý.
                </Paragraph>

                {orderId && (
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <p className="text-charcoal font-medium">
                      Mã đơn hàng:{" "}
                      <span className="text-primary font-bold">#{orderId}</span>
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg text-left">
                  <h4 className="text-charcoal font-semibold mb-2">
                    Thông tin giao hàng:
                  </h4>
                  <ul className="text-gray space-y-1 text-sm">
                    <li>• Thời gian giao hàng: 1-3 ngày làm việc</li>
                    <li>
                      • Phương thức thanh toán: Thanh toán khi nhận hàng (COD)
                    </li>
                    <li>
                      • Bạn sẽ nhận được SMS/Email xác nhận khi đơn hàng được
                      giao
                    </li>
                    <li>• Hotline hỗ trợ: 1900 1234 (8:00 - 22:00)</li>
                  </ul>
                </div>
              </div>
            }
            extra={
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/orders">
                    <Button
                      type="primary"
                      size="large"
                      icon={<Package size={20} />}
                      className="bg-primary border-primary w-full sm:w-auto">
                      Xem đơn hàng của tôi
                    </Button>
                  </Link>

                  <Link to="/">
                    <Button
                      size="large"
                      icon={<Home size={20} />}
                      className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
                      Về trang chủ
                    </Button>
                  </Link>
                </div>

                <Link to="/products">
                  <Button
                    type="link"
                    className="text-primary hover:text-primary/80">
                    Tiếp tục mua sắm →
                  </Button>
                </Link>
              </div>
            }
          />
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <Card className="border-0 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="text-primary" size={24} />
                </div>
                <h4 className="text-charcoal font-semibold mb-1">
                  Đóng gói cẩn thận
                </h4>
                <p className="text-gray text-sm">
                  Sản phẩm được đóng gói an toàn, chống va đập
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="text-primary" size={24} />
                </div>
                <h4 className="text-charcoal font-semibold mb-1">
                  Chính hãng 100%
                </h4>
                <p className="text-gray text-sm">
                  Cam kết sản phẩm chính hãng, có tem chống hàng giả
                </p>
              </div>

              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Home className="text-primary" size={24} />
                </div>
                <h4 className="text-charcoal font-semibold mb-1">
                  Đổi trả dễ dàng
                </h4>
                <p className="text-gray text-sm">
                  Hỗ trợ đổi trả trong 7 ngày nếu có vấn đề
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
