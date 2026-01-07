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
  Space,
} from "antd";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Product, Category, Brand, ApiResponse } from "../types";
import api from "../utils/api";
import { getImageUrl, formatCurrency } from "../utils/helpers";

const { Title } = Typography;
const { Meta } = Card;
const { Option } = Select;

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    number | undefined
  >();
  const [selectedBrand, setSelectedBrand] = useState<number | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Load URL params
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

      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", pageSize.toString());

      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory)
        params.append("category_id", selectedCategory.toString());
      if (selectedBrand) params.append("brand_id", selectedBrand.toString());
      params.append("min_price", priceRange[0].toString());
      params.append("max_price", priceRange[1].toString());

      const response = await api.get<ApiResponse<Product[]>>(
        `/products?${params}`
      );
      setProducts(response.data.data || []);
      setTotal(response.data.meta?.total || 0);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateURL({ search: value, page: "1" });
  };

  const handleCategoryChange = (value: number | undefined) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    updateURL({ category: value?.toString(), page: "1" });
  };

  const handleBrandChange = (value: number | undefined) => {
    setSelectedBrand(value);
    setCurrentPage(1);
    updateURL({ brand: value?.toString(), page: "1" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ page: page.toString() });
  };

  const updateURL = (params: Record<string, string | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
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
    <div className="bg-background min-h-screen">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Title level={1} className="!text-charcoal !mb-4 font-serif">
            Sản phẩm
          </Title>
          <p className="text-gray text-lg">
            Khám phá bộ sưu tập mỹ phẩm cao cấp tại Muse Cosmetics
          </p>
        </div>

        <Row gutter={[24, 24]}>
          {/* Sidebar Filters */}
          <Col xs={24} lg={6}>
            <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <Title level={4} className="!mb-0">
                  <Filter size={20} className="inline mr-2" />
                  Bộ lọc
                </Title>
                <Button
                  type="link"
                  onClick={clearFilters}
                  className="text-primary">
                  Xóa bộ lọc
                </Button>
              </div>

              {/* Search */}
              <div>
                <label className="block text-charcoal font-medium mb-2">
                  Tìm kiếm
                </label>
                <Input
                  placeholder="Tên sản phẩm..."
                  prefix={<Search size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onPressEnter={(e) =>
                    handleSearch((e.target as HTMLInputElement).value)
                  }
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-charcoal font-medium mb-2">
                  Danh mục
                </label>
                <Select
                  placeholder="Chọn danh mục"
                  className="w-full"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  allowClear>
                  {categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-charcoal font-medium mb-2">
                  Thương hiệu
                </label>
                <Select
                  placeholder="Chọn thương hiệu"
                  className="w-full"
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  allowClear>
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.id}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-charcoal font-medium mb-2">
                  Khoảng giá
                </label>
                <Slider
                  range
                  min={0}
                  max={5000000}
                  step={100000}
                  value={priceRange}
                  onChange={setPriceRange}
                  tooltip={{
                    formatter: (value) => formatCurrency(value || 0),
                  }}
                />
                <div className="flex justify-between text-sm text-gray mt-2">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>
          </Col>

          {/* Products Grid */}
          <Col xs={24} lg={18}>
            <div className="space-y-6">
              {/* Results Info */}
              <div className="flex justify-between items-center">
                <p className="text-gray">
                  Hiển thị {products.length} trong tổng số {total} sản phẩm
                </p>
              </div>

              {/* Products */}
              {loading ? (
                <div className="text-center py-12">
                  <Spin size="large" />
                </div>
              ) : products.length > 0 ? (
                <>
                  <Row gutter={[24, 24]}>
                    {products.map((product) => (
                      <Col key={product.id} xs={24} sm={12} xl={8}>
                        <Card
                          hoverable
                          className="border-0 shadow-sm h-full"
                          cover={
                            <div className="h-64 overflow-hidden">
                              <img
                                alt={product.name}
                                src={getImageUrl(product.image_url)}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    "/placeholder-product.jpg";
                                }}
                              />
                            </div>
                          }
                          actions={[
                            <Link key="view" to={`/products/${product.slug}`}>
                              <Button
                                type="primary"
                                className="bg-primary border-primary w-full">
                                Xem chi tiết
                              </Button>
                            </Link>,
                          ]}>
                          <Meta
                            title={
                              <Link
                                to={`/products/${product.slug}`}
                                className="text-charcoal hover:text-primary line-clamp-2">
                                {product.name}
                              </Link>
                            }
                            description={
                              <div className="space-y-2">
                                <p className="text-primary font-semibold text-lg">
                                  {formatCurrency(product.price)}
                                </p>
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Pagination */}
                  {total > pageSize && (
                    <div className="flex justify-center mt-8">
                      <Pagination
                        current={currentPage}
                        total={total}
                        pageSize={pageSize}
                        onChange={handlePageChange}
                        showSizeChanger={false}
                        showQuickJumper
                        showTotal={(total, range) =>
                          `${range[0]}-${range[1]} của ${total} sản phẩm`
                        }
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray text-lg">
                    Không tìm thấy sản phẩm nào
                  </p>
                  <Button
                    type="primary"
                    className="bg-primary border-primary mt-4"
                    onClick={clearFilters}>
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductsPage;
