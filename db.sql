CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(255),
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(255),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_id BIGINT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    image_url VARCHAR(255),
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id) REFERENCES categories(id)
);
CREATE TABLE IF NOT EXISTS products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT,
    brand_id BIGINT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,

    price DECIMAL(15,2) NOT NULL,
    sale_price DECIMAL(15,2),
    cost DECIMAL(15,2),
    stock_qty INT DEFAULT 0,
    sold_qty INT DEFAULT 0,

    short_description VARCHAR(2000),
    content TEXT,
    image_url VARCHAR(255),

    capacity VARCHAR(255),
    color VARCHAR(255),
    ingredients TEXT,

    status VARCHAR(20) DEFAULT 'in_stock',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_products_categories
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_products_brands
        FOREIGN KEY (brand_id) REFERENCES brands(id)
        ON DELETE SET NULL,

    CHECK (stock_qty >= 0),
    CHECK (status IN ('in_stock', 'out_of_stock', 'hidden'))
);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sale_price ON products(sale_price);
CREATE TABLE IF NOT EXISTS galleries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,

    CONSTRAINT fk_galleries_products
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS galleries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,

    CONSTRAINT fk_galleries_products
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS carts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    session_id VARCHAR(100) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_carts_users
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id),
    CHECK (quantity > 0)
);
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255),
    description TEXT,

    type VARCHAR(20),
    value DECIMAL(15,2) NOT NULL,

    min_order_value DECIMAL(15,2) DEFAULT 0,
    max_discount_value DECIMAL(15,2),

    quantity INT,
    used_count INT DEFAULT 0,

    start_date DATETIME,
    end_date DATETIME,
    status VARCHAR(20) DEFAULT 'active',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CHECK (type IN ('percentage', 'fixed_amount')),
    CHECK (status IN ('active', 'inactive', 'expired'))
);
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    code VARCHAR(50) NOT NULL UNIQUE,

    subtotal DECIMAL(15,2),
    shipping_fee DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total DECIMAL(15,2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'Unpaid',

    shipping_name VARCHAR(100),
    shipping_phone VARCHAR(20),
    shipping_address TEXT,
    shipping_email VARCHAR(100),
    note TEXT,

    status VARCHAR(20) DEFAULT 'pending',
    coupon_id BIGINT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_orders_users
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_orders_coupons
        FOREIGN KEY (coupon_id) REFERENCES coupons(id)
        ON DELETE SET NULL,

    CHECK (payment_status IN ('Unpaid', 'Paid', 'Refunded')),
    CHECK (status IN ('pending', 'confirmed', 'shipping', 'completed', 'cancelled', 'refunded'))
);
CREATE TABLE IF NOT EXISTS order_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_id BIGINT NULL,

    product_name VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    quantity INT,
    total_price DECIMAL(15,2),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_details_orders
        FOREIGN KEY (order_id) REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_details_products
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE SET NULL,

    CHECK (quantity > 0)
);
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    order_id BIGINT NULL,

    rating INT,
    comment TEXT,
    is_approved BOOLEAN DEFAULT FALSE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reviews_users
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reviews_products
        FOREIGN KEY (product_id) REFERENCES products(id)
        ON DELETE CASCADE,

    CHECK (rating BETWEEN 1 AND 5)
);
