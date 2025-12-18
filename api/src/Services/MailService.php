<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MailService
{
    private bool $enabled;

    public function __construct()
    {
        $this->enabled = ($_ENV['MAIL_ENABLED'] ?? '0') === '1';
    }

    public function send(string $to, string $subject, string $body): bool
    {
        if (!$this->enabled) {
            return false;
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host = $_ENV['MAIL_HOST'] ?? '';
            $mail->Port = (int)($_ENV['MAIL_PORT'] ?? 587);
            $mail->SMTPAuth = true;
            $mail->Username = $_ENV['MAIL_USER'] ?? '';
            $mail->Password = $_ENV['MAIL_PASS'] ?? '';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

            $from = $_ENV['MAIL_FROM'] ?? 'no-reply@example.com';
            $mail->setFrom($from, 'Dies');
            $mail->addAddress($to);

            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $body;

            $mail->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
