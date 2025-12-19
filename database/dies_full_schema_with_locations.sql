-- dies_full_schema_with_locations.sql
-- Tek kurulum dosyası: şehir, ilçe, mahalle/köy + uygulama tabloları ve admin seed.
SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Temiz başlamak için tablo sırası önemli (FK bağımlılıkları nedeniyle önce alt tabloları bırakmayın)
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS offices;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS password_resets;
DROP TABLE IF EXISTS advisors;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS affiliated_settlements;
DROP TABLE IF EXISTS villages;
DROP TABLE IF EXISTS neighborhoods;
DROP TABLE IF EXISTS towns;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS cities;

CREATE TABLE cities (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE districts (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  city_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE towns (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  district_id INT UNSIGNED NOT NULL,
  name VARCHAR(150) NOT NULL,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE neighborhoods (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  district_id INT UNSIGNED NOT NULL,
  town_id INT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
  FOREIGN KEY (town_id) REFERENCES towns(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE villages (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  district_id INT UNSIGNED NOT NULL,
  town_id INT UNSIGNED NULL,
  name VARCHAR(180) NOT NULL,
  FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
  FOREIGN KEY (town_id) REFERENCES towns(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE affiliated_settlements (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  village_id INT UNSIGNED NOT NULL,
  name VARCHAR(180) NOT NULL,
  FOREIGN KEY (village_id) REFERENCES villages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE users (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  role ENUM('admin','advisor','user') NOT NULL DEFAULT 'user',
  image VARCHAR(500) NULL,
  instagram VARCHAR(255) NULL,
  facebook VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE advisors (
  user_id INT UNSIGNED PRIMARY KEY,
  about TEXT NULL,
  specializations JSON NULL,
  sahibinden_link VARCHAR(500) NULL,
  experience_years INT DEFAULT 0,
  total_sales INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE password_resets (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX token_idx (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE properties (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price DECIMAL(15,2) NOT NULL,
  category ENUM('Konut','Ticari','Arsa') NOT NULL,
  province VARCHAR(150) NOT NULL,
  district VARCHAR(150) NOT NULL,
  neighborhood VARCHAR(150) NOT NULL,
  bedrooms VARCHAR(50) NULL,
  bathrooms INT NULL,
  area_gross INT NULL,
  area_net INT NULL,
  floor_location VARCHAR(50) NULL,
  heating_type VARCHAR(100) NULL,
  building_age VARCHAR(50) NULL,
  balcony_count INT NULL,
  is_furnished TINYINT(1) DEFAULT 0,
  is_in_complex TINYINT(1) DEFAULT 0,
  has_balcony TINYINT(1) DEFAULT 0,
  features JSON NULL,
  images JSON NULL,
  image VARCHAR(500) NULL,
  is_featured TINYINT(1) DEFAULT 0,
  advisor_id INT UNSIGNED NULL,
  created_by INT UNSIGNED NOT NULL,
  listing_status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  listing_intent ENUM('sale','rent') NOT NULL DEFAULT 'sale',
  listing_state ENUM('active','sold','rented') NOT NULL DEFAULT 'active',
  reject_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE offices (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  phone2 VARCHAR(50) NULL,
  whatsapp VARCHAR(50) NULL,
  image VARCHAR(500) NULL,
  gallery JSON NULL,
  location_url VARCHAR(500) NULL,
  working_hours VARCHAR(255) NULL,
  is_headquarters TINYINT(1) DEFAULT 0,
  city VARCHAR(150) NOT NULL,
  district VARCHAR(150) NOT NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE applications (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  type ENUM('advisor','office') NOT NULL,
  details JSON NOT NULL,
  status ENUM('pending','reviewed','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lokasyon verileri (örnek ve test için yeterli şehir seti)
INSERT INTO cities (id, name) VALUES
  (1, 'İstanbul'),
  (2, 'Ankara'),
  (3, 'Batman');

INSERT INTO districts (id, city_id, name) VALUES
  (1, 1, 'Kadıköy'),
  (2, 1, 'Beşiktaş'),
  (3, 3, 'Merkez');

INSERT INTO towns (id, district_id, name) VALUES
  (1, 1, 'Fenerbahçe'),
  (2, 2, 'Levent'),
  (3, 3, 'Kozluk');

INSERT INTO neighborhoods (id, district_id, town_id, name) VALUES
  (1, 1, 1, 'Fenerbahçe Mahallesi'),
  (2, 1, NULL, 'Suadiye Mahallesi'),
  (3, 2, 2, 'Levent Mahallesi'),
  (4, 3, NULL, 'Gültepe'),
  (5, 3, 3, 'Bahçelievler');

INSERT INTO villages (id, district_id, town_id, name) VALUES
  (1, 3, NULL, 'Körük'),
  (2, 3, 3, 'Tepecik'),
  (3, 1, NULL, 'Şile Köyü');

INSERT INTO affiliated_settlements (village_id, name) VALUES
  (1, 'Yayla Mezrası'),
  (2, 'Dere Obası');

-- Admin kullanıcı seed
INSERT INTO users (id, name, email, password_hash, phone, role, created_at, updated_at)
VALUES (1, 'Admin', 'admin@dies.local', '$2y$12$sfugsJJWyTOkypVUV/Smlup16IXvZFWmtDLZQSxrCRLdDJba23eAa', '5550000000', 'admin', NOW(), NOW());

-- Örnek danışman ve kullanıcı (isteğe bağlı)
INSERT INTO users (id, name, email, password_hash, phone, role, created_at, updated_at)
VALUES
  (2, 'Danışman Örnek', 'advisor@dies.local', '$2y$12$sfugsJJWyTOkypVUV/Smlup16IXvZFWmtDLZQSxrCRLdDJba23eAa', '5551111111', 'advisor', NOW(), NOW()),
  (3, 'Standart Kullanıcı', 'user@dies.local', '$2y$12$sfugsJJWyTOkypVUV/Smlup16IXvZFWmtDLZQSxrCRLdDJba23eAa', '5552222222', 'user', NOW(), NOW());

INSERT INTO advisors (user_id, about, specializations, sahibinden_link, experience_years, total_sales)
VALUES (2, 'Bölge uzmanı danışman', JSON_ARRAY('Konut', 'Ticari'), 'https://sahibinden.com/ornek', 5, 120);

-- Örnek mülk (yayınlanmış ve bekleyen)
INSERT INTO properties (title, description, price, category, province, district, neighborhood, bedrooms, bathrooms, area_gross, area_net, floor_location, heating_type, building_age, balcony_count, is_furnished, is_in_complex, has_balcony, features, images, image, is_featured, advisor_id, created_by, listing_status, listing_intent, listing_state, created_at, updated_at)
VALUES
  ('Kadıköy''de Boğaz Manzaralı Daire', 'Manzaralı geniş daire', 12500000, 'Konut', 'İstanbul', 'Kadıköy', 'Fenerbahçe Mahallesi', '3+1', 2, 160, 140, '5', 'Kombi', '0-5', 2, 1, 1, 1, JSON_ARRAY('Asansör','Otopark'), JSON_ARRAY('https://example.com/img1.webp'), 'https://example.com/img1.webp', 1, 2, 2, 'approved', 'sale', 'active', NOW(), NOW()),
  ('Batman Merkez Kiralık Daire', 'Uygun fiyatlı daire', 8500, 'Konut', 'Batman', 'Merkez', 'Gültepe', '2+1', 1, 110, 95, '2', 'Kombi', '6-10', 1, 0, 0, 1, JSON_ARRAY('Balkon'), JSON_ARRAY('https://example.com/img2.webp'), 'https://example.com/img2.webp', 0, NULL, 3, 'pending', 'rent', 'active', NOW(), NOW());

-- Örnek ofis ve başvuru
INSERT INTO offices (name, address, phone, phone2, whatsapp, image, gallery, location_url, working_hours, is_headquarters, city, district, description)
VALUES ('Merkez Ofis', 'Bağdat Caddesi No:1', '02161234567', NULL, '05553334444', 'https://example.com/ofis.webp', NULL, 'https://maps.example.com/office', '09:00-18:00', 1, 'İstanbul', 'Kadıköy', 'Ana ofis');

INSERT INTO applications (type, details, status)
VALUES ('advisor', JSON_OBJECT('firstName','Örnek','lastName','Danışman','email','basvuru@example.com','phone','5553332211','city','İstanbul'), 'pending');
