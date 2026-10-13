<?php

namespace App\Support\DueDiligence\Identity;

use RuntimeException;

class IdentityProviderException extends RuntimeException
{
    public function __construct(string $message, public readonly ?int $status = null)
    {
        parent::__construct($message);
    }
}
