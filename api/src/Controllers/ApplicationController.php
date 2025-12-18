<?php

namespace App\Controllers;

use App\Http\Response;
use App\Utils\Validator;
use PDO;

class ApplicationController extends BaseController
{
    public function advisor(array $request): void
    {
        $body = $request['body'] ?? [];
        $firstName = Validator::sanitizeString($body['firstName'] ?? null);
        $lastName = Validator::sanitizeString($body['lastName'] ?? null);
        $email = Validator::sanitizeString($body['email'] ?? null);
        $phone = Validator::sanitizeString($body['phone'] ?? null);
        $birthDate = Validator::sanitizeString($body['birthDate'] ?? null);
        $education = Validator::sanitizeString($body['education'] ?? null);
        $experience = Validator::sanitizeString($body['experience'] ?? null);

        if (!$firstName || !$lastName || !$email || !$phone) {
            Response::error('Zorunlu alanlar eksik', 422);
        }

        $details = [
            'birthDate' => $birthDate,
            'education' => $education,
            'experience' => $experience,
        ];

        $stmt = $this->db->prepare('INSERT INTO applications (type, first_name, last_name, email, phone, city, status, details, created_at) VALUES ("advisor", ?, ?, ?, ?, ?, "pending", ?, NOW())');
        $stmt->execute([$firstName, $lastName, $email, $phone, null, json_encode($details)]);

        Response::success(['message' => 'Başvurunuz alındı'], 201);
    }

    public function office(array $request): void
    {
        $body = $request['body'] ?? [];
        $firstName = Validator::sanitizeString($body['firstName'] ?? null);
        $lastName = Validator::sanitizeString($body['lastName'] ?? null);
        $email = Validator::sanitizeString($body['email'] ?? null);
        $phone = Validator::sanitizeString($body['phone'] ?? null);
        $city = Validator::sanitizeString($body['city'] ?? null);
        $details = [
            'profession' => Validator::sanitizeString($body['profession'] ?? null),
            'education' => Validator::sanitizeString($body['education'] ?? null),
            'budget' => Validator::sanitizeString($body['budget'] ?? null),
            'details' => Validator::sanitizeString($body['details'] ?? null),
        ];

        if (!$firstName || !$lastName || !$email || !$phone || !$city) {
            Response::error('Zorunlu alanlar eksik', 422);
        }

        $stmt = $this->db->prepare('INSERT INTO applications (type, first_name, last_name, email, phone, city, status, details, created_at) VALUES ("office", ?, ?, ?, ?, ?, "pending", ?, NOW())');
        $stmt->execute([$firstName, $lastName, $email, $phone, $city, json_encode($details)]);

        Response::success(['message' => 'Başvurunuz alındı'], 201);
    }
}
