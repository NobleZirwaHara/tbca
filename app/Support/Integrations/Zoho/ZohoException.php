<?php

namespace App\Support\Integrations\Zoho;

use RuntimeException;

/** A failed Zoho call. Retryable errors (rate limit, server error, timeout) are retried with backoff; others need correction. */
class ZohoException extends RuntimeException
{
    public function __construct(string $message, public readonly bool $retryable = true, public readonly ?int $status = null)
    {
        parent::__construct($message);
    }
}
