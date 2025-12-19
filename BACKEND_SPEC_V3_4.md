
# DİES GAYRİMENKUL - BACKEND IMPLEMENTATION SPEC (V3.4)

Bu döküman Dies Gayrimenkul PHP API'si için tek kaynak noktasıdır. 

---

## 1. VERİTABANI ŞEMASI (MySQL)

**Charset:** `utf8mb4_unicode_ci` | **Engine:** `InnoDB`

### A. Kullanıcı & Danışman
- **users**: `id, name, email, password_hash, phone, role (admin|advisor|user), image, instagram, facebook, created_at, updated_at, deleted_at`
- **advisors**: `user_id (PK/FK), is_founder (bool), about (text), specializations (json), sahibinden_link, experience_years, total_sales`
- **password_resets**: `id, user_id, token_hash, expires_at, used_at, created_at`

### B. İlanlar (Properties)
- **properties**:
  - `id, advisor_id (FK)`
  - `title, description, price (decimal 15,2), currency (TL|USD|EUR)`
  - `province, district, neighborhood (Bu alan Mahalle veya Köy bilgisini tutar)`
  - `category (Konut|Ticari|Arsa)`
  - `listing_intent (sale|rent)`
  - `listing_status (pending|approved|rejected|archived)`
  - `listing_state (active|sold|rented)`
  - `image (string - cover), images (json - array)`
  - `bedrooms (v20), bathrooms (int), area_gross (int), area_net (int)`
  - `heating_type, building_age, is_furnished (bool), has_balcony (bool), floor_location (string), features (json - array)`
  - `sahibinden_link, is_featured (bool), rejection_reason (text), approved_by (FK), approved_at, deleted_at, created_at, updated_at`

---

## 2. API ENDPOINTLERİ VE MAPPING

Tüm yanıtlar `{ "success": true, "data": ... }` zarfında dönmelidir.

### 1. Özellik Listeleme (GET /api/properties)
Backend, frontend'den gelen şu parametreleri KABUL ETMELİ ve iç kolonlara map etmelidir:
- `status`: "Satılık" -> intent=sale, "Kiralık" -> intent=rent, "Satıldı" -> state=sold, "Kiralandı" -> state=rented
- `type`: "Konut"|"Ticari"|"Arsa" -> category
- `minPrice / maxPrice`: price aralığı (Pozitif değer kontrolü)
- `minArea / maxArea`: area_gross aralığı (Pozitif değer kontrolü)
- `roomCount`: bedrooms kolonu
- `isFurnished`: "Evet" -> is_furnished=1
- `hasBalcony`: "Evet" -> has_balcony=1
- `floorLocation`: floor_location kolonu
- `province / district / neighborhood`: Konum filtreleri (neighborhood parametresi hem mahalleleri hem de köyleri kapsamalıdır)

**Response Data:** Her property objesi mutlaka `"type"` alanını içermelidir (Örn: "Satılık", "Satıldı").

### 2. Lokasyon Servisi
- `GET /api/locations/cities`: Tüm iller.
- `GET /api/locations/districts?city_id={id}`: İle ait ilçeler.
- `GET /api/locations/neighborhoods?district_id={id}`: İlçeye ait mahalleler ve köyler.

### 3. Danışmanlar & Ofisler
- `GET /api/advisors`: Onaylı danışman listesi.
- `GET /api/advisors/{id}`: Danışman detay + istatistikler.
- `GET /api/offices`: Aktif ofis listesi.

### 4. Başvurular
- `POST /api/applications/advisor`: Danışmanlık başvurusu.
- `POST /api/applications/office`: Ofis (Bayilik) başvurusu.

### 5. Admin İşlemleri
- `GET /api/admin/stats`: Özet rakamlar.
- `GET /api/admin/users`: Kullanıcı listesi.
- `POST /api/admin/users/{id}/role`: Rol güncelleme.
- `POST /api/admin/users/{id}/reset-password`: Rastgele 8 haneli şifre üret, DB güncelle ve `{ "generatedPassword": "..." }` olarak dön.
- `GET /api/admin/applications?type=advisor|office`: Başvuru listesi.
- `POST /api/admin/applications/{id}`: `{ "status": "approved|rejected" }` güncelleme.

---

## 3. GÜVENLİK
- **JWT**: Tüm korumalı yollarda zorunludur.
- **WebP**: Resimler frontend'de sıkıştırılsa bile backend mime-type kontrolü yapmalıdır.
- **Ownership**: Bir danışman sadece kendi ilanını güncelleyebilir/silebilir.
