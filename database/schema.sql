-- Dies Gayrimenkul temel şema
-- Charset: utf8mb4_unicode_ci | Engine: InnoDB

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(180) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NULL,
  `role` ENUM('admin','advisor','user') NOT NULL DEFAULT 'user',
  `image` VARCHAR(255) NULL,
  `instagram` VARCHAR(255) NULL,
  `facebook` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `advisors` (
  `user_id` BIGINT UNSIGNED NOT NULL,
  `is_founder` TINYINT(1) NOT NULL DEFAULT 0,
  `about` TEXT NULL,
  `specializations` JSON NULL,
  `sahibinden_link` VARCHAR(255) NULL,
  `experience_years` INT DEFAULT 0,
  `total_sales` INT DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_advisors_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `properties` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `advisor_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(15,2) NOT NULL DEFAULT 0,
  `currency` ENUM('TL','USD','EUR') NOT NULL DEFAULT 'TL',
  `province` VARCHAR(120) NOT NULL,
  `district` VARCHAR(120) NOT NULL,
  `neighborhood` VARCHAR(150) NULL,
  `category` ENUM('Konut','Ticari','Arsa') NOT NULL DEFAULT 'Konut',
  `listing_intent` ENUM('sale','rent') NOT NULL DEFAULT 'sale',
  `listing_status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `listing_state` ENUM('active','sold','rented') NOT NULL DEFAULT 'active',
  `image` VARCHAR(255) NOT NULL,
  `images` JSON NULL,
  `bedrooms` VARCHAR(50) NULL,
  `bathrooms` INT NULL,
  `area_gross` INT NULL,
  `area_net` INT NULL,
  `building_age` VARCHAR(50) NULL,
  `heating_type` VARCHAR(120) NULL,
  `is_furnished` TINYINT(1) NOT NULL DEFAULT 0,
  `has_balcony` TINYINT(1) NOT NULL DEFAULT 0,
  `floor_location` VARCHAR(50) NULL,
  `features` JSON NULL,
  `sahibinden_link` VARCHAR(255) NULL,
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `rejection_reason` TEXT NULL,
  `approved_by` BIGINT UNSIGNED NULL,
  `approved_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_properties_advisor` (`advisor_id`),
  KEY `idx_properties_status` (`listing_status`),
  KEY `idx_properties_state` (`listing_state`),
  CONSTRAINT `fk_properties_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `offices` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `city` VARCHAR(120) NOT NULL,
  `district` VARCHAR(120) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `phone2` VARCHAR(50) NULL,
  `whatsapp` VARCHAR(50) NULL,
  `working_hours` VARCHAR(150) NULL,
  `location_url` VARCHAR(255) NULL,
  `is_headquarters` TINYINT(1) NOT NULL DEFAULT 0,
  `image` VARCHAR(255) NULL,
  `gallery` JSON NULL,
  `description` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `applications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `type` ENUM('advisor','office') NOT NULL,
  `first_name` VARCHAR(150) NOT NULL,
  `last_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(180) NOT NULL,
  `phone` VARCHAR(80) NOT NULL,
  `city` VARCHAR(120) NULL,
  `status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `details` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_password_resets_token` (`token_hash`),
  CONSTRAINT `fk_password_resets_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
