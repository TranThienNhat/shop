create database mypham_db;
use mypham_db;

-- =================================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU E-COMMERCE MỸ PHẨM HOÀN CHỈNH
-- Đặc tính: Chuẩn hóa 3NF, Quản lý SKU, Bảo mật Coupon, Snapshot Giá, Đa hình ảnh.
-- =================================================================================

-- 1. NHÓM QUẢN LÝ NGƯỜI DÙNG
-- Nghiệp vụ: Lưu trữ định danh khách hàng và nhân viên (Admin/User).
CREATE TABLE `users` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20),
  `role` enum('user', 'admin') DEFAULT 'user',
  `is_active` tinyint DEFAULT 1, -- 0: Khóa, 1: Hoạt động
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. NHÓM PHÂN LOẠI & THƯƠNG HIỆU
-- Nghiệp vụ: 'parent_id' cho phép tạo danh mục đa cấp (VD: Chăm sóc da > Kem dưỡng).
-- 2. NHÓM PHÂN LOẠI & THƯƠNG HIỆU
CREATE TABLE `categories` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE `brands` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `image_url` varchar(255) DEFAULT NULL, -- Logo thương hiệu (Cực kỳ quan trọng để làm slider logo)
  `description` text -- Thêm mô tả ngắn về hãng nếu cần
) ENGINE=InnoDB;

-- 3. NHÓM SẢN PHẨM & SKU (TRÁI TIM HỆ THỐNG)
-- Nghiệp vụ: Bảng 'products' lưu thông tin chung. Giá và Kho nằm ở 'product_variants'.
CREATE TABLE `products` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `category_id` bigint,
  `brand_id` bigint,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `status` enum('active', 'hidden') DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`)
) ENGINE=InnoDB;

-- Nghiệp vụ: Quản lý biến thể (VD: Son màu 01, Son màu 02). 
-- Mỗi biến thể là 1 SKU độc lập có giá và tồn kho riêng.
CREATE TABLE `product_variants` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `sku` varchar(100) UNIQUE, 
  `variant_name` varchar(255), -- 'Màu 01 - Đỏ', 'Chai 500ml'
  `price` decimal(15,2) NOT NULL,
  `stock_qty` int DEFAULT 0,
  `variant_image` varchar(255) DEFAULT NULL, -- Ảnh riêng cho màu/size đó
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. QUẢN LÝ HÌNH ẢNH (GALLERY)
-- Nghiệp vụ: Một sản phẩm có nhiều ảnh. 'is_main' dùng để lấy ảnh đại diện nhanh.
CREATE TABLE `product_galleries` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_main` tinyint DEFAULT 0, -- 1: Ảnh chính, 0: Ảnh phụ
  `sort_order` int DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. HỆ THỐNG KHUYẾN MÃI (COUPONS)
-- Nghiệp vụ: Quản lý mã giảm giá, giới hạn ngân sách và thời gian sử dụng.
CREATE TABLE `coupons` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE,
  `type` enum('percentage', 'fixed_amount') NOT NULL,
  `value` decimal(15,2) NOT NULL, 
  `min_order_value` decimal(15,2) DEFAULT 0,
  `max_discount_value` decimal(15,2) NULL,
  `start_date` datetime,
  `end_date` datetime,
  `total_limit` int DEFAULT NULL, -- Tổng lượt dùng toàn sàn
  `used_count` int DEFAULT 0,
  `is_active` tinyint DEFAULT 1
) ENGINE=InnoDB;

-- Nghiệp vụ: UNIQUE KEY chặn User dùng 1 mã nhiều lần.
CREATE TABLE `coupon_user` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `coupon_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `order_id` bigint NOT NULL,
  `used_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  UNIQUE KEY `uq_user_coupon` (`user_id`, `coupon_id`) 
) ENGINE=InnoDB;

-- 6. GIỎ HÀNG & ĐƠN HÀNG
-- Nghiệp vụ: 'session_id' lưu giỏ hàng cho khách chưa đăng nhập.
CREATE TABLE `carts` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NULL,
  `session_id` varchar(100) NULL,
  `coupon_id` bigint NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `cart_items` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `cart_id` bigint NOT NULL,
  `variant_id` bigint NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`)
) ENGINE=InnoDB;

-- Nghiệp vụ Orders: Lưu tổng tiền cuối cùng và mã giảm giá đã dùng.
CREATE TABLE `orders` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NULL,
  `order_code` varchar(50) NOT NULL UNIQUE,
  `shipping_name` varchar(255) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `notes` text NULL,
  `shipping_fee` decimal(15,2) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `discount_amount` decimal(15,2) DEFAULT 0,
  `final_amount` decimal(15,2) NOT NULL,
  `coupon_id` bigint NULL,
  `status` enum('pending','processing','shipped','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB;

-- Nghiệp vụ Order_Items: Snapshot 'price' giúp cố định giá lúc mua, 
-- tránh sai lệch doanh thu khi SP thay đổi giá trong tương lai.
CREATE TABLE `order_items` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `variant_id` bigint NULL,
  `price` decimal(15,2) NOT NULL, -- Giá snapshot
  `quantity` int NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. TƯƠNG TÁC KHÁCH HÀNG
-- Nghiệp vụ Reviews: Gắn với 'order_id' để xác nhận "Người mua thực".
CREATE TABLE `reviews` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `product_id` bigint NOT NULL,
  `order_id` bigint,
  `rating` tinyint CHECK (rating BETWEEN 1 AND 5),
  `comment` text,
  `is_approved` tinyint DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB;