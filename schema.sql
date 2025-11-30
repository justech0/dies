CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role ENUM('admin','advisor','user') NOT NULL DEFAULT 'user',
    image VARCHAR(255),
    social_links JSON NULL,
    about TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'TL',
    type ENUM('satilik','kiralik') NOT NULL,
    category ENUM('konut','ticari','arsa') NOT NULL,
    status ENUM('active','pending','sold') NOT NULL DEFAULT 'pending',
    view_count INT NOT NULL DEFAULT 0,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_listing_status (status),
    INDEX idx_listing_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS listing_details (
    listing_id INT PRIMARY KEY,
    province VARCHAR(120),
    district VARCHAR(120),
    neighborhood VARCHAR(150),
    bedrooms VARCHAR(50),
    bathrooms VARCHAR(50),
    area_gross INT,
    area_net INT,
    floor_location VARCHAR(50),
    total_floors VARCHAR(50),
    heating_type VARCHAR(120),
    building_age VARCHAR(50),
    is_furnished TINYINT(1) DEFAULT 0,
    balcony_count INT,
    sahibinden_link VARCHAR(255),
    features JSON,
    CONSTRAINT fk_details_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS listing_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_cover TINYINT(1) DEFAULT 0,
    sort_order INT DEFAULT 0,
    CONSTRAINT fk_image_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    INDEX idx_image_listing (listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,
    name VARCHAR(150) NOT NULL,
    type ENUM('province','district','neighborhood') NOT NULL,
    CONSTRAINT fk_location_parent FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_parent (parent_id),
    INDEX idx_location_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS offices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    address VARCHAR(255),
    phone VARCHAR(50),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT,
    status ENUM('pending','approved','rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    role ENUM('admin','advisor','user') NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_log_user (user_id),
    INDEX idx_log_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek admin kullanıcısı (şifre: admin123)
INSERT INTO users (name, email, password, phone, role)
VALUES ('Site Admin', 'admin@dies.com', '$2y$10$7pO1t0dxtgVo8S6Y04xvXu3C0cFLbFhF38sZ4N2VNivXzXcX4Jt1C', '+90 000 000 00 00', 'admin');
