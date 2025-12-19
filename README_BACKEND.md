# Dies Gayrimenkul PHP API

Bu klasör, Vite/React frontend'i bozmadan `/api` altında çalışan PHP 8 + MySQL API uygulamasıdır.

## Kurulum
1. `cd api`
2. `cp .env.example .env` dosyasını doldurun (DB_HOST/DB_NAME/DB_USER/DB_PASS/JWT_SECRET zorunlu).
3. Üretim kurulumu için vendor oluşturun:
   ```bash
   composer install --no-dev --optimize-autoloader
   ```
   > `vendor` yoksa API 500 döner; kurulumu tamamlamadan deploy etmeyin.
4. Tek SQL dosyasını içeri aktarın: `dies_full_schema_with_locations.sql` (veya proje ile gelen tam şema dosyası). Ek/ikincil lokasyon tablosu yaratmayın.
5. `uploads` klasörünün yazılabilir olduğundan emin olun; yoksa uygulama ilk açılışta otomatik oluşturur.
6. Web sunucusunda `.htaccess` ile tüm istekleri `/api/index.php`'ye yönlendirin.

## Önemli Yol Notu
Frontend `VITE_API_URL + /api` kullanır. Router şu sırayla davranır:
- `REQUEST_URI` içindeki query string temizlenir.
- Başındaki `/api` prefix'i çıkarılır.
- Kalan path router'a verilir. Yanlış strip işlemi 404/500 hatalarına yol açar.

## CORS
`FRONTEND_URL` tanımlıysa sadece o origin'e izin verilir; yoksa `*` döner. Preflight istekler 200 döner.

## Loglama
Hatalar `api/error.txt` dosyasına `[timestamp] request_id method path user_id message stack` formatında yazılır. Token gibi hassas veriler maskeleme ile korunur.

## Varsayılan Yönetici
SQL seed içerisinde `admin@dies.local / admin123` kullanıcısı bulunur. Üretimde bu şifreyi mutlaka değiştirin.
