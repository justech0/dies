CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin','consultant','user') NOT NULL DEFAULT 'user',
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    phone VARCHAR(50),
    username VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    about TEXT,
    avatar_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

CREATE TABLE IF NOT EXISTS listings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    owner_user_id INT NOT NULL,
    consultant_id INT NULL,
    office_id INT NULL,
    is_featured TINYINT(1) NOT NULL DEFAULT 0,
    province VARCHAR(120),
    district VARCHAR(120),
    neighborhood VARCHAR(120),
    request_consultant TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_listing_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_listing_consultant FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_listing_office FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
    INDEX idx_listing_status (status),
    INDEX idx_listing_featured (is_featured),
    INDEX idx_listing_consultant (consultant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS listing_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    listing_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    sort_order INT DEFAULT 0,
    CONSTRAINT fk_image_listing FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
    INDEX idx_image_listing (listing_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    role ENUM('admin','consultant','user') NULL,
    action VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_log_user (user_id),
    INDEX idx_log_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Örnek admin kullanıcısı (şifre: admin123)
INSERT INTO users (role, name, email, phone, username, password_hash)
VALUES ('admin', 'Site Admin', 'admin@dies.com', '+90 000 000 00 00', 'admin', '$2y$10$7pO1t0dxtgVo8S6Y04xvXu3C0cFLbFhF38sZ4N2VNivXzXcX4Jt1C');
