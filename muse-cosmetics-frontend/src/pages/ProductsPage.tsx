import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Typography, Spin, Pagination, Slider, Select, Input, Empty, Breadcrumb } from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter, RefreshCcw, ChevronRight } from "lucide-react";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]); 
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);

  // 1. Khởi tạo dữ liệu (Danh mục & Thương hiệu)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          api.get("/categories"),
          api.get("/brands")
        ]);
        setCategories(catRes.data.data || []);
        setBrands(brandRes.data.data || []);
      } catch (error) {
        console.error("Lỗi tải dữ liệu lọc:", error);
      }
    };
    loadInitialData();
  }, []);

  // 2. Lắng nghe thay đổi từ URL và gọi API lấy sản phẩm
  useEffect(() => {
    loadProducts();
    
    // Đồng bộ Page hiện tại với URL
    const page = searchParams.get("page");
    if (page) setCurrentPage(Number(page));
  }, [searchParams, priceRange]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: searchParams.get("page") || 1,
        limit: pageSize,
        min_price: priceRange[0],
        max_price: priceRange[1],
        search: searchParams.get("search") || undefined,
        category_id: searchParams.get("category_id") || undefined,
        brand_id: searchParams.get("brand_id") || undefined,
      };

      const response = await api.get("/products", { params });
      setProducts(response.data.data || []);
      setTotal(response.data.meta?.total || 0);
    } catch (error) {
      console.error("Lỗi tải sản phẩm:", error);
    } finally {
      setLoading(false);
    }
  };

  // 3. Hàm xử lý thay đổi bộ lọc (Cập nhật URL)
  const handleFilterChange = (key: string, value: any) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value.toString());
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1"); // Luôn reset về trang 1 khi lọc
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setPriceRange([0, 5000000]);
    setSearchParams({});
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#fffafb] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
        
        {/* Breadcrumb & Header */}
        <Breadcrumb className="mb-6 uppercase tracking-widest text-[10px]" items={[{ title: <Link to="/">Trang chủ</Link> }, { title: "Sản phẩm" }]} />
        
        <div className="mb-12 text-center md:text-left">
          <Title level={1} className="!text-charcoal !mb-2 !font-serif !text-4xl uppercase tracking-wider">Cửa hàng của Muse</Title>
          <Text className="text-gray-400 italic font-serif">Nơi nàng tìm thấy bản sao hoàn hảo nhất của chính mình ✨</Text>
        </div>

        <Row gutter={[32, 32]}>
          {/* SIDEBAR BỘ LỌC */}
          <Col xs={24} lg={6}>
            <div className="bg-white p-8 rounded-[40px] shadow-sm space-y-8 sticky top-28 border border-rose-50">
              <div className="flex items-center justify-between border-b border-rose-50 pb-4">
                <Title level={4} className="!mb-0 !font-serif flex items-center gap-2">
                   <Filter size={18} className="text-rose-400" /> Bộ lọc
                </Title>
                <Button type="link" onClick={clearFilters} className="text-rose-300 hover:text-rose-500 p-0 flex items-center gap-1 text-xs">
                   <RefreshCcw size={12} /> Làm mới
                </Button>
              </div>

              {/* Tìm kiếm */}
              <div>
                <label className="block text-charcoal font-bold mb-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">Tìm kiếm sản phẩm</label>
                <Input 
                  placeholder="Nàng đang tìm gì..." 
                  prefix={<Search size={14} className="text-rose-200" />} 
                  className="rounded-2xl border-rose-50 bg-rose-50/20 h-11 focus:border-rose-300"
                  value={searchParams.get("search") || ""}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

              {/* Lọc theo Thương hiệu (Nhận brand_id từ URL) */}
              <div>
                <label className="block text-charcoal font-bold mb-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">Thương hiệu</label>
                <Select 
                  placeholder="Tất cả thương hiệu" 
                  className="w-full muse-select" 
                  value={searchParams.get("brand_id") ? Number(searchParams.get("brand_id")) : undefined}
                  onChange={(val) => handleFilterChange("brand_id", val)}
                  allowClear
                >
                  {brands.map((b) => <Option key={b.id} value={b.id}>{b.name}</Option>)}
                </Select>
              </div>

              {/* Lọc theo Danh mục */}
              <div>
                <label className="block text-charcoal font-bold mb-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">Danh mục</label>
                <Select 
                  placeholder="Chọn danh mục" 
                  className="w-full muse-select" 
                  value={searchParams.get("category_id") ? Number(searchParams.get("category_id")) : undefined}
                  onChange={(val) => handleFilterChange("category_id", val)}
                  allowClear
                >
                  {categories.map((c) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </div>

              {/* Lọc theo Giá tiền */}
              <div>
                <label className="block text-charcoal font-bold mb-3 text-[10px] uppercase tracking-[0.2em] text-gray-400">Khoảng giá (VNĐ)</label>
                <Slider 
                  range 
                  min={0} 
                  max={5000000} 
                  step={50000}
                  value={priceRange}
                  onChange={(val: number[]) => setPriceRange(val as [number, number])}
                  trackStyle={[{ backgroundColor: '#fb7185' }]}
                  handleStyle={[{ borderColor: '#fb7185' }, { borderColor: '#fb7185' }]}
                />
                <div className="flex justify-between text-[11px] text-rose-400 mt-3 font-bold font-serif">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </Col>

          {/* DANH SÁCH SẢN PHẨM */}
          <Col xs={24} lg={18}>
            {loading ? (
              <div className="text-center py-32"><Spin size="large" /></div>
            ) : products.length > 0 ? (
              <>
                <Row gutter={[24, 32]}>
                  {products.map((product) => (
                    <Col key={product.id} xs={24} sm={12} xl={8}>
                      <Card
                        hoverable
                        className="border-none shadow-sm h-full rounded-[40px] overflow-hidden group flex flex-col bg-white"
                        cover={
                          <Link to={`/products/${product.id}`}>
                            <div className="h-72 overflow-hidden bg-rose-50/20 p-2">
                              <img
                                alt={product.name}
                                src={getImageUrl(product.thumb_image)}
                                className="w-full h-full object-cover rounded-[32px] group-hover:scale-110 transition-transform duration-700"
                              />
                            </div>
                          </Link>
                        }
                      >
                        <div className="flex flex-col h-full">
                          <Meta
                            title={
                              <Link to={`/products/${product.id}`} className="text-charcoal hover:text-rose-400 line-clamp-1 font-serif text-lg transition-colors">
                                {product.name}
                              </Link>
                            }
                            description={
                              <div className="mt-2">
                                <Text className="text-rose-500 font-bold text-xl font-serif">
                                  {formatCurrency(Number(product.min_price || 0))}
                                </Text>
                              </div>
                            }
                          />
                          <div className="mt-6 pt-4 border-t border-rose-50">
                             <Link to={`/products/${product.id}`}>
                                <Button block className="rounded-full border-rose-100 text-rose-400 font-bold uppercase tracking-widest text-[10px] h-12 flex items-center justify-center gap-2 hover:!bg-rose-400 hover:!text-white transition-all">
                                    Chi tiết món quà <ChevronRight size={14} />
                                </Button>
                             </Link>
                          </div>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {/* Phân trang */}
                <div className="flex justify-center mt-16">
                  <Pagination
                    current={currentPage}
                    total={total}
                    pageSize={pageSize}
                    onChange={(page) => {
                      setCurrentPage(page);
                      handleFilterChange("page", page);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    showSizeChanger={false}
                    className="muse-pagination"
                  />
                </div>
              </>
            ) : (
              <Card className="text-center py-24 border-none shadow-sm rounded-[40px] bg-white">
                <Empty description={<Text className="text-gray-400 italic font-serif text-lg">Muse chưa tìm thấy sản phẩm nàng cần...</Text>} />
                <Button 
                    type="primary" 
                    className="mt-8 bg-rose-400 border-none rounded-full h-12 px-8 uppercase tracking-widest font-bold" 
                    onClick={clearFilters}
                >
                    Xem lại tất cả sản phẩm
                </Button>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductsPage;