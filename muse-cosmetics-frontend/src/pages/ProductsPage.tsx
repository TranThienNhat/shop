import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Spin,
  Pagination,
  Slider,
  Select,
  Input,
} from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter } from "lucide-react";
// Đã xóa Product khỏi import vì bạn đang dùng dữ liệu động 'any' để khớp thumb_image
import { Category, Brand, ApiResponse } from "../types"; 
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title, Text } = Typography;
const { Meta } = Card;
const { Option } = Select;

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  
  // State khoảng giá
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const page = searchParams.get("page");

    if (category) setSelectedCategory(Number(category));
    if (brand) setSelectedBrand(Number(brand));
    if (search) setSearchTerm(search);
    if (page) setCurrentPage(Number(page));
  }, [searchParams]);

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, selectedBrand, searchTerm, priceRange]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        api.get("/categories"),
        api.get("/brands"),
      ]);
      setCategories(categoriesRes.data.data || []);
      setBrands(brandsRes.data.data || []);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: pageSize,
        min_price: priceRange[0],
        max_price: priceRange[1],
      };

      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedBrand) params.brand_id = selectedBrand;

      const response = await api.get<ApiResponse<any[]>>("/products", { params });

      setProducts(response.data.data || []);
      setTotal(response.data.meta?.total || 0);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value) newSearchParams.set(key, value);
      else newSearchParams.delete(key);
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setPriceRange([0, 5000000]);
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div className="bg-background min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        <div className="mb-8 text-center md:text-left">
          <Title level={1} className="!text-charcoal !mb-2 font-serif">Sản phẩm</Title>
          <p className="text-gray text-lg">Khám phá vẻ đẹp thuần khiết cùng Muse Cosmetics</p>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={6}>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between">
                <Title level={4} className="!mb-0"><Filter size={18} className="inline mr-2" /> Bộ lọc</Title>
                <Button type="link" onClick={clearFilters} className="text-primary p-0">Xóa hết</Button>
              </div>

              <div>
                <label className="block text-charcoal font-medium mb-2 text-sm">Tìm kiếm</label>
                <Input 
                  placeholder="Tên sản phẩm..." 
                  prefix={<Search size={14} className="text-gray-400" />} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-charcoal font-medium mb-2 text-sm">Danh mục</label>
                <Select 
                  placeholder="Chọn danh mục" 
                  className="w-full" 
                  value={selectedCategory}
                  onChange={(val) => { setSelectedCategory(val); updateURL({ category: val?.toString(), page: "1" }); }}
                  allowClear
                >
                  {categories.map((c) => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </div>

              <div>
                <label className="block text-charcoal font-medium mb-2 text-sm">Khoảng giá</label>
                {/* FIX LỖI TS TẠI ĐÂY: Sử dụng arrow function để ép kiểu mảng */}
                <Slider 
                  range 
                  min={0} 
                  max={5000000} 
                  step={100000}
                  value={priceRange}
                  onChange={(value: number[]) => setPriceRange(value as [number, number])}
                  onAfterChange={() => setCurrentPage(1)}
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 uppercase tracking-tighter">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} lg={18}>
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-20"><Spin size="large" /></div>
              ) : products.length > 0 ? (
                <>
                  <Row gutter={[20, 20]}>
                    {products.map((product) => (
                      <Col key={product.id} xs={24} sm={12} xl={8}>
                        <Card
                          hoverable
                          className="border-0 shadow-sm h-full flex flex-col group overflow-hidden"
                          cover={
                            <Link to={`/products/${product.id}`}>
                              <div className="h-64 overflow-hidden bg-gray-50">
                                <img
                                  alt={product.name}
                                  src={getImageUrl(product.thumb_image)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://placehold.co/400x400?text=No+Image";
                                  }}
                                />
                              </div>
                            </Link>
                          }
                          actions={[
                            <Link key="view" to={`/products/${product.id}`}>
                              <Button type="primary" className="bg-primary border-primary w-[85%] mx-auto block">
                                Xem chi tiết
                              </Button>
                            </Link>,
                          ]}
                        >
                          <Meta
                            title={
                              <Link to={`/products/${product.id}`} className="text-charcoal hover:text-primary line-clamp-1 font-medium">
                                {product.name}
                              </Link>
                            }
                            description={
                              <div className="mt-1">
                                <Text className="text-primary font-bold text-base">
                                  {formatCurrency(Number(product.min_price || 0))}
                                </Text>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <div className="flex justify-center mt-10">
                    <Pagination
                      current={currentPage}
                      total={total}
                      pageSize={pageSize}
                      onChange={(page) => { setCurrentPage(page); updateURL({ page: page.toString() }); }}
                      showSizeChanger={false}
                    />
                  </div>
                </>
              ) : (
                <Card className="text-center py-20 border-0 shadow-sm">
                  <p className="text-gray-400 text-lg">Không tìm thấy sản phẩm nào.</p>
                  <Button type="primary" className="mt-4" onClick={clearFilters}>Xóa bộ lọc</Button>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductsPage;