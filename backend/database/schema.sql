CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================
-- ENUM TYPES
-- =====================================

CREATE TYPE user_role AS ENUM (
    'customer',
    'restaurant',
    'admin'
);

CREATE TYPE account_status AS ENUM (
    'active',
    'suspended',
    'pending'
);

CREATE TYPE restaurant_status AS ENUM (
    'pending',
    'active',
    'suspended',
    'rejected'
);

CREATE TYPE order_status AS ENUM (
    'order_placed',
    'order_confirmed',
    'preparing',
    'out_for_delivery',
    'delivered',
    'cancelled'
);

CREATE TYPE payment_method AS ENUM (
    'cash_on_delivery',
    'paystack'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'successful',
    'failed',
    'refunded'
);


-- =====================================
-- USERS
-- =====================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE,

    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'customer',
    status account_status NOT NULL DEFAULT 'active',

    profile_image TEXT,

    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- RESTAURANTS
-- =====================================

CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(180) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,

    description TEXT,

    email VARCHAR(255),
    phone VARCHAR(30),

    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),

    logo TEXT,
    cover_image TEXT,

    delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 500,
    minimum_order NUMERIC(12,2) NOT NULL DEFAULT 0,

    rating NUMERIC(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,

    is_open BOOLEAN DEFAULT TRUE,

    status restaurant_status DEFAULT 'pending',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- RESTAURANT USERS
-- =====================================

CREATE TABLE restaurant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id) ON DELETE CASCADE,

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    staff_role VARCHAR(50) DEFAULT 'owner',

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (restaurant_id, user_id)
);


-- =====================================
-- CATEGORIES
-- =====================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,

    image TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- RESTAURANT CATEGORIES
-- =====================================

CREATE TABLE restaurant_categories (
    restaurant_id UUID REFERENCES restaurants(id)
        ON DELETE CASCADE,

    category_id UUID REFERENCES categories(id)
        ON DELETE CASCADE,

    PRIMARY KEY (restaurant_id, category_id)
);


-- =====================================
-- FOOD ITEMS
-- =====================================

CREATE TABLE food_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id) ON DELETE CASCADE,

    category_id UUID
        REFERENCES categories(id) ON DELETE SET NULL,

    name VARCHAR(180) NOT NULL,
    description TEXT,

    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),

    image TEXT,

    is_available BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- CUSTOMER ADDRESSES
-- =====================================

CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    label VARCHAR(80),
    recipient_name VARCHAR(150),
    phone VARCHAR(30),

    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),

    delivery_instructions TEXT,

    is_default BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- CARTS
-- =====================================

CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    status VARCHAR(20) DEFAULT 'active'
        CHECK (status IN ('active', 'converted', 'abandoned')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX one_active_cart_per_user
ON carts(user_id)
WHERE status = 'active';


-- =====================================
-- CART ITEMS
-- =====================================

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    cart_id UUID NOT NULL
        REFERENCES carts(id) ON DELETE CASCADE,

    food_item_id UUID NOT NULL
        REFERENCES food_items(id) ON DELETE CASCADE,

    quantity INTEGER NOT NULL CHECK (quantity > 0),

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE (cart_id, food_item_id)
);


-- =====================================
-- ORDERS
-- =====================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_number VARCHAR(40) UNIQUE NOT NULL,

    customer_id UUID NOT NULL
        REFERENCES users(id),

    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id),

    status order_status DEFAULT 'order_placed',

    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',

    subtotal NUMERIC(12,2) NOT NULL,
    delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    service_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,

    delivery_name VARCHAR(150),
    delivery_phone VARCHAR(30),
    delivery_address TEXT NOT NULL,
    delivery_instructions TEXT,

    customer_note TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- ORDER ITEMS
-- =====================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id) ON DELETE CASCADE,

    food_item_id UUID
        REFERENCES food_items(id) ON DELETE SET NULL,

    item_name VARCHAR(180) NOT NULL,

    unit_price NUMERIC(12,2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    item_total NUMERIC(12,2) NOT NULL
);


-- =====================================
-- PAYMENTS
-- =====================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id),

    reference VARCHAR(150) UNIQUE NOT NULL,

    amount NUMERIC(12,2) NOT NULL,

    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',

    provider_response JSONB,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- ORDER STATUS HISTORY
-- =====================================

CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id) ON DELETE CASCADE,

    status order_status NOT NULL,

    changed_by UUID
        REFERENCES users(id) ON DELETE SET NULL,

    note TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- REVIEWS
-- =====================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    customer_id UUID NOT NULL
        REFERENCES users(id),

    restaurant_id UUID NOT NULL
        REFERENCES restaurants(id),

    order_id UUID UNIQUE
        REFERENCES orders(id),

    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),

    comment TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- NOTIFICATIONS
-- =====================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- =====================================
-- INDEXES
-- =====================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_restaurants_status
ON restaurants(status);

CREATE INDEX idx_food_items_restaurant
ON food_items(restaurant_id);

CREATE INDEX idx_food_items_category
ON food_items(category_id);

CREATE INDEX idx_orders_customer
ON orders(customer_id);

CREATE INDEX idx_orders_restaurant
ON orders(restaurant_id);

CREATE INDEX idx_orders_status
ON orders(status);

CREATE INDEX idx_order_history
ON order_status_history(order_id);

CREATE INDEX idx_notifications_user
ON notifications(user_id);

CREATE INDEX idx_addresses_user
ON addresses(user_id);
