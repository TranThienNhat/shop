CREATE DATABASE IF NOT EXISTS mypham_db;
USE mypham_db;

-- 1. NHÓM QUẢN LÝ NGƯỜI DÙNG
CREATE TABLE `users` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20),
  `role` enum('user', 'admin') DEFAULT 'user',
  `is_active` tinyint DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

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
  `image_url` varchar(255) DEFAULT NULL,
  `description` text 
) ENGINE=InnoDB;

-- 3. NHÓM SẢN PHẨM & SKU
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

CREATE TABLE `product_variants` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `sku` varchar(100) UNIQUE, 
  `variant_name` varchar(255), 
  `price` decimal(8,0) NOT NULL, -- Tối đa ~100 triệu/món
  `stock_qty` int DEFAULT 0,
  `variant_image` varchar(255) DEFAULT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. QUẢN LÝ HÌNH ẢNH
CREATE TABLE `product_galleries` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `product_id` bigint NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `is_main` tinyint DEFAULT 0,
  `sort_order` int DEFAULT 0,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. HỆ THỐNG KHUYẾN MÃI (COUPONS)
CREATE TABLE `coupons` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `code` varchar(50) NOT NULL UNIQUE,
  `type` enum('percentage', 'fixed_amount') NOT NULL,
  `value` decimal(8,0) NOT NULL, 
  `min_order_value` decimal(8,0) DEFAULT 0,
  `max_discount_value` decimal(8,0) NULL,
  `start_date` datetime,
  `end_date` datetime,
  `total_limit` int DEFAULT NULL,
  `used_count` int DEFAULT 0,
  `is_active` tinyint DEFAULT 1
) ENGINE=InnoDB;

-- 6. GIỎ HÀNG & ĐƠN HÀNG
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

CREATE TABLE `orders` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `user_id` bigint NULL,
  `order_code` varchar(50) NOT NULL UNIQUE,
  `shipping_name` varchar(255) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `notes` text NULL,
  `shipping_fee` decimal(8,0) NOT NULL,
  `total_amount` decimal(8,0) NOT NULL, -- Lưu ý: Tổng đơn không quá 100tr
  `discount_amount` decimal(8,0) DEFAULT 0,
  `final_amount` decimal(8,0) NOT NULL,
  `coupon_id` bigint NULL,
  `status` enum('pending','processing','shipped','completed','cancelled') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`)
) ENGINE=InnoDB;

CREATE TABLE `order_items` (
  `id` bigint PRIMARY KEY AUTO_INCREMENT,
  `order_id` bigint NOT NULL,
  `variant_id` bigint NULL,
  `price` decimal(8,0) NOT NULL,
  `quantity` int NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. TƯƠNG TÁC KHÁCH HÀNG
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