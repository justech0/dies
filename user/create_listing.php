<?php
require_once __DIR__ . '/../includes/auth.php';
require_user();
$pdo = get_db_connection();
$user = current_user();
$offices = $pdo->query('SELECT id, name FROM offices ORDER BY name')->fetchAll();
$consultants = $pdo->query("SELECT id, name FROM users WHERE role = 'consultant' ORDER BY name")->fetchAll();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $type = $_POST['type'] ?? '';
    $price = (float)($_POST['price'] ?? 0);
    $officeId = !empty($_POST['office_id']) ? (int)$_POST['office_id'] : null;
    $consultantId = !empty($_POST['consultant_id']) ? (int)$_POST['consultant_id'] : null;
    $requestConsultant = !empty($_POST['request_consultant']) ? 1 : 0;

    $stmt = $pdo->prepare('INSERT INTO listings (title, description, type, price, status, owner_user_id, consultant_id, office_id, request_consultant, created_at, updated_at) VALUES (?, ?, ?, ?, "pending", ?, ?, ?, ?, NOW(), NOW())');
    $stmt->execute([$title, $description, $type, $price, $user['id'], $consultantId, $officeId, $requestConsultant]);
    log_activity($user['id'], 'user', 'listing_created_pending');
    $success = true;
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>İlan Ver</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-3xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Yeni İlan</h1>
        <a href="/user/index.php" class="text-sm text-gray-600">Geri</a>
    </div>
    <?php if (!empty($success)): ?>
        <div class="bg-green-100 text-green-700 p-3 rounded">İlanınız oluşturuldu. Onay sonrası yayınlanacaktır.</div>
    <?php endif; ?>
    <form method="POST" class="bg-white p-6 rounded shadow space-y-3">
        <input class="border p-2 rounded w-full" name="title" placeholder="Başlık" required />
        <textarea class="border p-2 rounded w-full" name="description" placeholder="Açıklama" required></textarea>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="type" class="border p-2 rounded">
                <option value="Satılık">Satılık</option>
                <option value="Kiralık">Kiralık</option>
            </select>
            <input class="border p-2 rounded" type="number" name="price" placeholder="Fiyat" required />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select name="office_id" class="border p-2 rounded">
                <option value="">Ofis seç</option>
                <?php foreach ($offices as $office): ?>
                    <option value="<?php echo $office['id']; ?>"><?php echo sanitize($office['name']); ?></option>
                <?php endforeach; ?>
            </select>
            <select name="consultant_id" class="border p-2 rounded">
                <option value="">İsteğe bağlı danışman</option>
                <?php foreach ($consultants as $c): ?>
                    <option value="<?php echo $c['id']; ?>"><?php echo sanitize($c['name']); ?></option>
                <?php endforeach; ?>
            </select>
        </div>
        <label class="flex items-center space-x-2">
            <input type="checkbox" name="request_consultant" value="1" />
            <span>DİES satsın/kiralasın (admin onayı ile danışman atanır)</span>
        </label>
        <p class="text-sm text-gray-600">İlanlarınız admin onayından sonra yayımlanacaktır.</p>
        <button class="bg-red-600 text-white px-4 py-2 rounded">Gönder</button>
    </form>
</div>
</body>
</html>
