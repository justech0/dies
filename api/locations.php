<?php
header('Content-Type: application/json');

// Minimal province/district set to drive the form; can be expanded from DB later.
$locations = [
    'İstanbul' => [
        'Kadıköy' => ['Moda', 'Fenerbahçe', 'Kozyatağı'],
        'Beşiktaş' => ['Etiler', 'Arnavutköy', 'Ortaköy'],
    ],
    'Ankara' => [
        'Çankaya' => ['Kızılay', 'Bahçelievler'],
        'Yenimahalle' => ['Şentepe', 'İvedik'],
    ],
];

echo json_encode($locations);
?>
