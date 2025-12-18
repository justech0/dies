<?php

namespace App\Controllers;

use PDO;

abstract class BaseController
{
    protected PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }
}
