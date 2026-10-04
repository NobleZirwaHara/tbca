<?php

namespace App\Support\Portal;

/**
 * RFC 6238 time-based one-time passwords (30 s step, 6 digits, HMAC-SHA1),
 * used for MFA enrolment and step-up verification. Works with any standard
 * authenticator app; the portal also shows a demo code because no SMS gateway
 * is connected in this environment.
 */
class Totp
{
    private const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    public static function secret(int $length = 16): string
    {
        $secret = '';
        for ($i = 0; $i < $length; $i++) {
            $secret .= self::ALPHABET[random_int(0, 31)];
        }

        return $secret;
    }

    public static function code(string $secret, ?int $timestamp = null): string
    {
        $counter = intdiv($timestamp ?? time(), 30);
        $key = self::base32Decode($secret);
        $binary = pack('N*', 0).pack('N*', $counter);
        $hash = hash_hmac('sha1', $binary, $key, true);
        $offset = ord($hash[19]) & 0x0F;
        $value = ((ord($hash[$offset]) & 0x7F) << 24)
            | ((ord($hash[$offset + 1]) & 0xFF) << 16)
            | ((ord($hash[$offset + 2]) & 0xFF) << 8)
            | (ord($hash[$offset + 3]) & 0xFF);

        return str_pad((string) ($value % 1000000), 6, '0', STR_PAD_LEFT);
    }

    /** Accepts the current code and one step either side for clock drift. */
    public static function verify(string $secret, string $code): bool
    {
        $code = preg_replace('/\D/', '', $code);
        foreach ([-1, 0, 1] as $drift) {
            if (hash_equals(self::code($secret, time() + $drift * 30), (string) $code)) {
                return true;
            }
        }

        return false;
    }

    public static function uri(string $secret, string $email): string
    {
        return 'otpauth://totp/'.rawurlencode('TBCA Client Portal:'.$email).'?secret='.$secret.'&issuer=TBCA';
    }

    private static function base32Decode(string $secret): string
    {
        $bits = '';
        foreach (str_split(strtoupper($secret)) as $char) {
            $pos = strpos(self::ALPHABET, $char);
            if ($pos === false) {
                continue;
            }
            $bits .= str_pad(decbin($pos), 5, '0', STR_PAD_LEFT);
        }
        $out = '';
        foreach (str_split($bits, 8) as $byte) {
            if (strlen($byte) === 8) {
                $out .= chr(bindec($byte));
            }
        }

        return $out;
    }
}
