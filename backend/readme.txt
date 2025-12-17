
# DİES GAYRİMENKUL - BACKEND SPESİFİKASYONU VE ENTEGRASYON KILAVUZU (V3.3)

Bu doküman, Dies Gayrimenkul projesinin **PHP Backend** mimarisi için nihai teknik gereksinimleri içerir. Bu sürümde (V3.3) Şifre Sıfırlama akışı eklenmiş, mülk durumları 3 ana kolona bölünmüş ve API yanıt formatı tüm sistem için standardize edilmiştir.

---

## 1. GENEL STANDARTLAR

### A. API Yanıt Formatı (Response Envelope)
Tüm yanıtlar **kesinlikle** bu formatta olmalıdır:

**Başarılı Yanıt (HTTP 200/201):**
```json
{
  "success": true,
  "data": { ... } 
}
```

**Hatalı Yanıt (HTTP 400/401/403/404/422/500):**
```json
{
  "success": false,
  "error": {
    "code": 401,
    "message": "Oturum süresi doldu veya geçersiz.",
    "details": null
  }
}
```

### B. URL Standardı
Tüm istekler `api_*.php?action=*` yapısını izlemelidir:
*   `/api/api_auth.php?action=...`
*   `/api/api_properties.php?action=...`
*   `/api/api_upload.php` (POST Multipart)

---

## 2. VERİTABANI TASARIMI (MySQL Schema)

**Collation:** `utf8mb4_unicode_ci` | **Engine:** `InnoDB`

### 1. Tablo: `users`
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
    deleted_at DATETIME DEFAULT NULL, -- Soft Delete
    INDEX idx_role (role),
    INDEX idx_email (email)
);
```

### 2. Tablo: `advisors`
```sql
CREATE TABLE advisors (
    user_id INT PRIMARY KEY,
    is_founder BOOLEAN DEFAULT FALSE,
    about TEXT DEFAULT NULL,
    specializations JSON DEFAULT NULL,
    sahibinden_link VARCHAR(255) DEFAULT NULL,
    experience_years INT DEFAULT 0,
    total_sales INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 3. Tablo: `properties`
Mülk durumları netleştirilmiştir.
```sql
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    advisor_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    currency ENUM('TL', 'USD', 'EUR') DEFAULT 'TL',
    
    -- Konum (Lookup IDs)
    province_id INT NOT NULL,
    district_id INT NOT NULL,
    neighborhood_id INT NOT NULL,
    location_display VARCHAR(255) DEFAULT NULL,

    category ENUM('Konut', 'Ticari', 'Arsa') NOT NULL,

    -- DURUM YÖNETİMİ (V3.3)
    listing_intent ENUM('sale', 'rent') NOT NULL, -- sale: Satılık, rent: Kiralık
    listing_status ENUM('pending', 'approved', 'rejected', 'archived') DEFAULT 'pending', -- Onay Akışı
    listing_state ENUM('active', 'sold', 'rented') DEFAULT 'active', -- Nihai Durum (Satıldı/Kiralandı)
    
    -- Reddetme Bilgisi
    rejection_reason TEXT DEFAULT NULL,
    approved_at DATETIME DEFAULT NULL,
    approved_by INT DEFAULT NULL,

    -- Detaylar
    bedrooms VARCHAR(20) DEFAULT NULL,
    bathrooms INT DEFAULT NULL,
    area_gross INT NOT NULL,
    area_net INT DEFAULT NULL,
    building_age VARCHAR(20) DEFAULT NULL,
    heating_type VARCHAR(50) DEFAULT NULL,
    floor_location VARCHAR(20) DEFAULT NULL,
    total_floors INT DEFAULT NULL,
    balcony_count INT DEFAULT 0,
    is_furnished BOOLEAN DEFAULT FALSE,
    is_in_complex BOOLEAN DEFAULT FALSE,
    
    -- Medya
    image VARCHAR(255) NOT NULL,
    images JSON NOT NULL,
    sahibinden_link VARCHAR(255) DEFAULT NULL,
    features JSON DEFAULT NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,

    FOREIGN KEY (advisor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_filter (listing_status, listing_state, listing_intent, category),
    INDEX idx_price (price),
    INDEX idx_created (created_at)
);
```

### 4. Tablo: `password_resets`
```sql
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_expiry (expires_at)
);
```

### 5. Tablo: `locations`
```sql
CREATE TABLE location_cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE location_districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    FOREIGN KEY (city_id) REFERENCES location_cities(id) ON DELETE CASCADE,
    INDEX idx_city (city_id)
);

CREATE TABLE location_neighborhoods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    district_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    FOREIGN KEY (district_id) REFERENCES location_districts(id) ON DELETE CASCADE,
    INDEX idx_district (district_id)
);
```

### 6. Tablo: `offices` & `applications`
*V3.1 sürümündeki alanlar korunmalı ancak `id` AUTO_INCREMENT ve PK olmalı.*

---

## 3. API ENDPOINT TABLOSU

### Auth Modülü (`api_auth.php`)
| Action | Method | Role | Açıklama |
|---|---|---|---|
| `login` | POST | Public | Email/Sifre ile giriş |
| `register` | POST | Public | Yeni kullanıcı kaydı |
| `me` | GET | Auth | Token ile user+advisor verisi |
| `update_profile` | POST | Auth | Profil/Biyografi güncelleme |
| `forgot_password` | POST | Public | Şifre sıfırlama emaili tetikle |
| `reset_password` | POST | Public | Yeni şifre belirle (Token ile) |

### Properties Modülü (`api_properties.php`)
| Action | Method | Role | Açıklama |
|---|---|---|---|
| `list` | GET | Public | İlanları listele (Pagination: page, limit) |
| `detail` | GET | Public | Tekil ilan detayı |
| `create` | POST | Auth | İlan ekle (Default: pending) |
| `update` | POST | Owner/Admin | İlan güncelle veya state (Satıldı) değiştir |
| `delete` | POST | Owner/Admin | İlanı sil (Soft delete önerilir) |

**List Parametreleri:** `page`, `limit`, `sort_by` (price, created_at), `sort_dir` (asc, desc), `intent` (sale, rent), `category`, `status`, `state`, `city_id`, `district_id`.

---

## 4. ŞİFRE SIFIRLAMA (Forgot Password) AKIŞI

1.  **Talep (`forgot_password`):**
    *   Input: `{ "email": "..." }`
    *   Backend: Kullanıcı varsa 32 karakterlik random bir `token` üretir.
    *   Token'ı `sha256` ile hash'leyip `password_resets` tablosuna (1 saat expiry ile) kaydeder.
    *   E-posta gönderir (Dev modunda token'ı response'a basabilir).
    *   Response: Daima `{ "success": true, "message": "E-posta gönderildi (Varsa)." }` (Güvenlik için).

2.  **Sıfırlama (`reset_password`):**
    *   Input: `{ "token": "...", "new_password": "..." }`
    *   Backend: Token hash'ini DB'de arar. Geçerli/Süresi dolmamış/Kullanılmamış ise kullanıcının `password_hash` alanını günceller.
    *   Token'ı `used_at = NOW()` olarak işaretler.

---

## 5. DOSYA YÜKLEME (Production Kuralları)

*   **Endpoint:** `POST /api_upload.php`
*   **Güvenlik:**
    *   Max Size: 5MB
    *   Max Count: 10 Dosya
    *   Allowed Mime: `image/jpeg`, `image/png`, `image/webp`
    *   İsimlendirme: UUID veya Random (Asla orijinal isim değil)
    *   Dizin: `public/uploads/YYYY/MM/`
*   **Response:** `{ "success": true, "data": { "urls": ["..."] } }`

---

## 6. FRONTEND ENTEGRASYON NOTLARI (Label Mapping)

| DB Value (Enum) | Frontend Label (Turkish) |
|---|---|
| `listing_status: pending` | Onay Bekliyor |
| `listing_status: approved` | Yayında |
| `listing_status: rejected` | Reddedildi |
| `listing_intent: sale` | Satılık |
| `listing_intent: rent` | Kiralık |
| `listing_state: active` | Aktif |
| `listing_state: sold` | Satıldı |
| `listing_state: rented` | Kiralandı |

---

## 7. DONE CHECKLIST

*   [ ] Tüm endpointler `success/data/error` zarfını kullanıyor mu?
*   [ ] Password Reset tokenları hashlenerek saklanıyor mu?
*   [ ] Dosya yüklemede PHP scripti yükleme koruması var mı?
*   [ ] Properties tablosu 3-kolon yapısına (status/intent/state) uygun mu?
*   [ ] Locations tablolarında FK ve Indexler tanımlı mı?
*   [ ] Soft delete (deleted_at) aktif mi?
