
# DİES GAYRİMENKUL - BACKEND IMPLEMENTATION SPEC (V3.3)

This document serves as the single source of truth for the PHP backend / API implementation.

---

## 1. DATABASE SCHEMA (MySQL)
**Collation:** `utf8mb4_unicode_ci` | **Engine:** `InnoDB`

### Users & Advisors
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    role ENUM('admin', 'advisor', 'user') DEFAULT 'user',
    image VARCHAR(255) DEFAULT NULL,
    instagram VARCHAR(255) DEFAULT NULL,
    facebook VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

CREATE TABLE advisors (
    user_id INT PRIMARY KEY,
    is_founder BOOLEAN DEFAULT FALSE,
    about TEXT DEFAULT NULL,
    specializations JSON DEFAULT NULL, -- Array of strings
    sahibinden_link VARCHAR(255) DEFAULT NULL,
    experience_years INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Properties (Listings)
```sql
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advisor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    currency ENUM('TL', 'USD', 'EUR') DEFAULT 'TL',
    province VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    neighborhood VARCHAR(50) NOT NULL,
    category ENUM('Konut', 'Ticari', 'Arsa') NOT NULL,
    listing_intent ENUM('sale', 'rent') NOT NULL,
    listing_status ENUM('pending', 'approved', 'rejected', 'archived') DEFAULT 'pending',
    listing_state ENUM('active', 'sold', 'rented') DEFAULT 'active',
    image VARCHAR(255) NOT NULL, -- Cover image URL
    images JSON NOT NULL, -- Array of URLs
    bedrooms VARCHAR(20) DEFAULT NULL,
    bathrooms INT DEFAULT NULL,
    area_gross INT NOT NULL,
    area_net INT DEFAULT NULL,
    building_age VARCHAR(20) DEFAULT NULL,
    heating_type VARCHAR(50) DEFAULT NULL,
    is_furnished BOOLEAN DEFAULT FALSE,
    features JSON DEFAULT NULL, -- Array of strings
    sahibinden_link VARCHAR(255) DEFAULT NULL,
    rejection_reason TEXT DEFAULT NULL,
    approved_by INT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### Offices & Applications
```sql
CREATE TABLE offices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL,
    phone2 VARCHAR(20) DEFAULT NULL,
    whatsapp VARCHAR(20) DEFAULT NULL,
    image VARCHAR(255) NOT NULL,
    gallery JSON DEFAULT NULL,
    location_url VARCHAR(255) DEFAULT NULL,
    working_hours VARCHAR(100) DEFAULT NULL,
    is_headquarters BOOLEAN DEFAULT FALSE,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    description TEXT DEFAULT NULL
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('advisor', 'office') NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(50) DEFAULT NULL,
    profession VARCHAR(100) DEFAULT NULL,
    budget VARCHAR(100) DEFAULT NULL,
    details TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Location Lookup tables (Cities/Districts/Neighborhoods)
*To be populated with standard Turkey data.*

---

## 2. API ENDPOINTS

### Auth
- **POST `/api/auth/login`**: {email, password} -> {user, token}
- **POST `/api/auth/register`**: {name, email, phone, password} -> {user, token} (Role=user)
- **GET `/api/auth/me`**: Returns current user (with advisor details if applicable)
- **POST `/api/auth/update-profile`**: {name, phone, instagram, about, ...} -> updated user
- **POST `/api/auth/forgot-password`**: {email} -> Generates token in DB. Dev: returns token. Prod: sends mail.
- **POST `/api/auth/reset-password`**: {token, new_password} -> Updates password.

### Properties
- **GET `/api/properties`**: Filters: `listing_intent`, `category`, `district`, `minPrice`, `maxPrice`, `advisorId`.
- **GET `/api/properties/{id}`**: Returns single property.
- **POST `/api/properties`**: Create new (Status=pending if user, approved if admin/advisor).
- **POST `/api/properties/{id}`**: Update existing.
- **DELETE `/api/properties/{id}`**: Soft delete (set `deleted_at`).

### Media
- **POST `/api/upload`**: Expects `files[]`. Saves to `/public/uploads/YYYY/MM/`. Returns URLs.

### Admin
- **GET `/api/admin/stats`**: Aggregated numbers.
- **GET `/api/admin/users`**: List all users.
- **POST `/api/admin/users/{id}/change-role`**: {role}.
- **POST `/api/admin/users/{id}/reset-password`**: Generates a random 8-char string, updates DB, returns it once.
- **GET `/api/admin/properties/pending`**: List properties with `listing_status='pending'`.
- **POST `/api/admin/properties/{id}/approve`**: Approve.
- **POST `/api/admin/properties/{id}/reject`**: {reason}.

---

## 3. RESPONSE STANDARD
```json
// Success
{ "success": true, "data": { ... } }

// Error
{ "success": false, "error": { "code": 400, "message": "User not found" } }
```

---

## 4. SECURITY REQUIREMENTS
1. **JWT Authentication**: Use `Authorization: Bearer <token>` for all protected routes.
2. **WebP Only**: Reject non-image files. Upload folder must not have PHP execution permissions.
3. **Prepared Statements**: Use PDO with named parameters for all queries.
4. **Soft Delete**: Never actually delete users or properties from DB, use `deleted_at`.
