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
    owner_user_id INT NULL,
    consultant_id INT NULL,
    office_id INT NULL,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'TL',
    type ENUM('satilik','kiralik') NOT NULL,
    category ENUM('konut','ticari','arsa') NOT NULL,
    status ENUM('active','pending','sold','approved','rejected') NOT NULL DEFAULT 'pending',
    view_count INT NOT NULL DEFAULT 0,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    request_consultant TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_listing_consultant FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_listing_office FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
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

-- Örnek danışman/advisor hesapları (şifre: advisor123)
INSERT INTO users (name, email, password, phone, role, image, social_links)
VALUES
('Abdurrahman Tayğav', 'advisor1@dies.com', '$2y$12$LPuffDeMWr6LxRF1UwNqoO83u2THLbt7g286S5L9jdauhKg59J5Xe', '+90 543 868 26 68', 'advisor', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400', JSON_OBJECT('instagram', 'https://www.instagram.com/diesgayrimenkul/', 'facebook', 'https://www.facebook.com/diesgayrimenkul/')),
('İsmail Demirbilek', 'advisor2@dies.com', '$2y$12$LPuffDeMWr6LxRF1UwNqoO83u2THLbt7g286S5L9jdauhKg59J5Xe', '+90 505 996 96 12', 'advisor', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400', JSON_OBJECT('instagram', 'https://www.instagram.com/diesgayrimenkul/', 'facebook', 'https://www.facebook.com/diesgayrimenkul/')),
('Ahmet Yılmaz', 'advisor3@dies.com', '$2y$12$LPuffDeMWr6LxRF1UwNqoO83u2THLbt7g286S5L9jdauhKg59J5Xe', '+90 555 123 45 67', 'advisor', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400', NULL);

-- Örnek kullanıcı (şifre: user123)
INSERT INTO users (name, email, password, phone, role)
VALUES ('Test Kullanıcısı', 'user1@dies.com', '$2y$12$kyuR8LYfYWwoKQrdtyyhO.kS5lOhB0XV0tKC4QJh.zciZNIwK2Xxu', '+90 532 000 00 00', 'user');

-- Örnek ilanlar
INSERT INTO listings (owner_user_id, consultant_id, title, slug, description, price, currency, type, category, status, view_count, is_featured, request_consultant)
VALUES
(1, 1, 'Gültepe\'de Ultra Lüks 4.5+1 Daire', 'gultepe-ultra-luks-45-1', 'Ultra lüks yapılı, geniş balkonlu, güney cephe. Özel mimari tasarım, birinci sınıf malzeme kalitesi.', 5500000, 'TL', 'satilik', 'konut', 'approved', 120, 1, 0),
(1, 2, 'Kültür Mahallesi Ara Kat 3+1', 'kultur-ara-kat-3-1', 'Okullara ve marketlere yürüme mesafesinde. Geniş ve ferah odalar.', 3200000, 'TL', 'satilik', 'konut', 'approved', 75, 1, 0),
(1, 3, 'Belde Mahallesi Kiralık Lüx Daire', 'belde-kiralik-lux-daire', 'Belde mahallesinde, park ve okullara yakın, önü açık, ferah kiralık daire.', 15000, 'TL', 'kiralik', 'konut', 'approved', 34, 0, 0);

INSERT INTO listing_details (listing_id, province, district, neighborhood, bedrooms, bathrooms, area_gross, area_net, floor_location, total_floors, heating_type, building_age, is_furnished, balcony_count, sahibinden_link, features)
VALUES
(1, 'Batman', 'Merkez', 'Gültepe', '4+1', 2, 210, 185, '8', '10', 'Yerden Isıtma', '0', 0, 2, NULL, JSON_ARRAY('Asansör','Kapalı Otopark','7/24 Güvenlik','Akıllı Ev Sistemi','Ebeveyn Banyosu')),
(2, 'Batman', 'Merkez', 'Kültür', '3+1', 1, 145, 0, '3', '5', 'Doğalgaz (Kombi)', '10-15', 0, 1, NULL, JSON_ARRAY('Doğalgaz','Balkon','Çelik Kapı','Isı Yalıtımı')),
(3, 'Batman', 'Merkez', 'Belde', '3+1', 1, 165, 150, '5', '8', 'Doğalgaz (Kombi)', '5-10', 0, 2, NULL, JSON_ARRAY('Asansör','Balkon','Doğalgaz','Parke Zemin'));

INSERT INTO listing_images (listing_id, image_url, is_cover, sort_order)
VALUES
(1, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=1200', 1, 1),
(1, 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&q=80&w=1200', 0, 2),
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200', 0, 3),
(2, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=1200', 1, 1),
(2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=1200', 0, 2),
(3, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=1200', 1, 1),
(3, 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&q=80&w=1200', 0, 2);
