<?php
require_once __DIR__ . '/../includes/auth.php';
require_admin();
$pdo = get_db_connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $address = $_POST['address'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $imagePath = $_POST['image_path'] ?? '';
    $id = $_POST['id'] ?? '';

    if ($id) {
        $stmt = $pdo->prepare('UPDATE offices SET name=?, description=?, address=?, phone=?, image_path=?, updated_at=NOW() WHERE id=?');
        $stmt->execute([$name, $description, $address, $phone, $imagePath, $id]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO offices (name, description, address, phone, image_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
        $stmt->execute([$name, $description, $address, $phone, $imagePath]);
    }
    log_activity(current_user()['id'], 'admin', 'office_saved');
    header('Location: offices.php');
    exit();
}

$offices = $pdo->query('SELECT * FROM offices ORDER BY created_at DESC')->fetchAll();
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Ofis Yönetimi</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css">
</head>
<body class="bg-gray-50">
<div class="max-w-5xl mx-auto p-6 space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Ofisler</h1>
        <a href="/admin/index.php" class="text-sm text-gray-600">Geri</a>
    </div>

    <div class="bg-white p-6 rounded shadow">
        <h2 class="font-semibold mb-4">Yeni Ofis</h2>
        <form method="POST" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input class="border p-2 rounded" name="name" placeholder="Ofis Adı" required />
            <input class="border p-2 rounded" name="phone" placeholder="Telefon" />
            <input class="border p-2 rounded md:col-span-2" name="address" placeholder="Adres" />
            <input class="border p-2 rounded md:col-span-2" name="image_path" placeholder="Görsel yolu (uploads/...)">
            <textarea class="border p-2 rounded md:col-span-2" name="description" placeholder="Açıklama"></textarea>
            <button class="bg-red-600 text-white px-4 py-2 rounded md:col-span-2">Kaydet</button>
        </form>
    </div>

    <div class="bg-white p-6 rounded shadow">
        <h3 class="font-semibold mb-4">Kayıtlı Ofisler</h3>
        <table class="min-w-full text-sm">
            <thead class="bg-gray-100">
                <tr>
                    <th class="p-2 text-left">Ad</th>
                    <th class="p-2 text-left">Telefon</th>
                    <th class="p-2 text-left">Adres</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($offices as $office): ?>
                    <tr class="border-b">
                        <td class="p-2 font-semibold"><?php echo sanitize($office['name']); ?></td>
                        <td class="p-2"><?php echo sanitize($office['phone']); ?></td>
                        <td class="p-2 text-sm"><?php echo sanitize($office['address']); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
</body>
</html>
