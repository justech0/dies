<?php

namespace App\Utils;

class Validator
{
    public static function sanitizeString(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }
        $trimmed = trim($value);
        return $trimmed === '' ? null : $trimmed;
    }

    public static function toBool($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        if (is_string($value)) {
            return in_array(strtolower($value), ['1', 'true', 'yes', 'evet', 'on'], true);
        }
        return (bool)$value;
    }

    public static function toFloat($value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }
        return (float)$value;
    }

    public static function toInt($value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        return (int)$value;
    }
}
