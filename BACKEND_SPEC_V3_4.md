# DİES GAYRİMENKUL - BACKEND IMPLEMENTATION SPEC (V3.4)

Bu döküman Dies Gayrimenkul PHP (Laravel veya Raw PHP) API'si için tek kaynak noktasıdır. Codex bu dökümana sadık kalarak backend'i inşa etmelidir.

---

## 1. VERİTABANI ŞEMASI (MySQL)

**Charset:** `utf8mb4_unicode_ci` | **Engine:** `InnoDB`

### A. Kullanıcı Yönetimi
- **users**: `id, name, email, password_hash, phone, role (admin|advisor|user), image, instagram, facebook, created_at, updated_at, deleted_at`
- **advisors**: `user_id (PK/FK), is_founder (bool), about (text), specializations (json), sahibinden_link, experience_years, total_sales`
- **password_resets**: `id, user_id, token_hash, expires_at, used_at, created_at`

### B. İlanlar (Properties)
- **properties**:
  - `id, advisor_id (FK)`
  - `title, description, price (decimal 15,2), currency (TL|USD|EUR)`
  - `province, district, neighborhood`
  - `category (Konut|Ticari|Arsa)`
  - `listing_intent (sale|rent)`
  - `listing_status (pending|approved|rejected|archived)`
  - `listing_state (active|sold|rented)`
  - `image (string - cover), images (json - array)`
  - `bedrooms (v20), bathrooms (int), area_gross (int), area_net (int)`
  - `heating_type, building_age, floor_location, total_floors, balcony_count`
  - `is_furnished, is_in_complex, has_balcony (bool)`
  - `features (json - array of tags)`
  - `sahibinden_link, is_featured (bool)`
  - `rejection_reason (text), approved_by (FK), approved_at, deleted_at`
  - `created_at, updated_at`

### C. Kurumsal & Destek
- **offices**: `id, name, address, phone, phone2, whatsapp, image, gallery (json), location_url, working_hours, is_headquarters (bool), city, district, description`
- **applications**: `id, type (advisor|office), firstName, lastName, email, phone, city, profession, budget, details, status (pending|approved|rejected), date`
- **location_cities**: `id, name`
- **location_districts**: `id, city_id, name`
- **location_neighborhoods**: `id, district_id, name`

---

## 2. API STANDARTLARI

### Response Envelope
```json
{
  "success": true,
  "data": { ... }, 
  "error": null
}
```

### Endpoints (Hiyerarşi)

#### Auth
- `POST /api/auth/login` (email, password)
- `POST /api/auth/register` (name, email, password) -> Default role: user
- `GET  /api/auth/me` -> User + Advisor details
- `POST /api/auth/update-profile` (JSON)
- `POST /api/auth/forgot-password` (email) -> Her zaman true döner (güvenlik).
- `POST /api/auth/reset-password` (token, new_password)

#### Properties (Public)
- `GET /api/properties`: Default public filtre -> `status=approved` & `state=active`.
  - Desteklenen paramlar: `intent, category, district, min_price, max_price, page, limit, sort_by, sort_dir`.
- `GET /api/properties/{id}`: Detay.

#### Properties (Protected)
- `POST /api/properties`: Yeni ilan. Rol `user` ise otomatik `status=pending`.
- `POST /api/properties/{id}`: Güncelleme (Ownership check zorunlu).
- `DELETE /api/properties/{id}`: Soft delete.

#### Admin
- `GET /api/admin/stats`: Toplam ilan, kullanıcı, bekleyen başvuru sayıları.
- `GET /api/admin/users`: Tüm kullanıcılar listesi.
- `POST /api/admin/users/{id}/role`: {role} - Rol değiştirme.
- `POST /api/admin/users/{id}/reset-password`: Backend rastgele 8 haneli şifre üretir, DB günceller ve JSON içinde döner.
- `GET /api/admin/properties/pending`: Onay bekleyenler.
- `POST /api/admin/properties/{id}/approve`: İlanı yayına al.
- `POST /api/admin/properties/{id}/reject`: {reason} - Reddet.

#### Media
- `POST /api/upload`: Multipart `files[]`. Kayıt yolu: `/public/uploads/YYYY/MM/`.

---

## 3. GÜVENLİK VE BUSINESS LOGIC
1. **JWT**: `Authorization: Bearer <token>` zorunluluğu.
2. **WebP**: Backend gelen tüm resimlerin geçerli bir image formatı olduğunu doğrulamalıdır.
3. **Mail**: Opsiyonel. Ücretli servis yoksa admin manuel şifre sıfırlama akışı esastır.
4. **CORS**: Frontend domainine izin verilmelidir.
