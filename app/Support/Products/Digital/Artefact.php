<?php

namespace App\Support\Products\Digital;

use App\Models\Products\Digital\DpEntitlement;
use App\Models\Products\Digital\DpVersion;

/**
 * Builds the delivered artefact for a download. The demo platform has no file
 * store, so each download is a rights-stamped PDF edition generated on the fly.
 * The visible rights notice is identification only (Blueprint 7.2: watermarking
 * is not DRM and does not prove who shared a file).
 */
class Artefact
{
    public static function fileName(DpEntitlement $e, DpVersion $v, string $format, string $language): string
    {
        $base = sprintf('%s_%s_%s', $e->product->name, $v->label(), $language);

        return strtolower($format) === 'pdf' ? "{$base}.pdf" : "{$base}_{$format}-edition.pdf";
    }

    public static function displayName(DpEntitlement $e, DpVersion $v, string $format, string $language): string
    {
        return sprintf('%s_%s_%s.%s', $e->product->name, $v->label(), $language, strtolower($format));
    }

    public static function pdf(DpEntitlement $e, DpVersion $v, string $format, string $language): string
    {
        $p = $e->product;
        $lines = [
            ['F2', 20, $p->name],
            ['F1', 11, $p->tagline ?? ''],
            ['F1', 10, ''],
            ['F2', 11, 'CURRENT EDITION'],
            ['F1', 10, sprintf('Version %s | Intended-use jurisdiction: %s | Verified as at %s', $v->label(), $p->jurisdiction, $v->verified_at?->format('d M Y') ?? '-')],
            ['F1', 10, sprintf('Format: %s | Language: %s | Maintenance: %s | Updates: %s', $format, $language, $p->maintenance_class, $p->update_class)],
            ['F1', 10, 'Requirements can change; check the Client Portal for current status before new reliance.'],
            ['F1', 10, ''],
            ['F2', 11, 'WHAT YOU RECEIVE'],
            ...array_map(fn ($r) => ['F1', 10, '- '.$r], array_slice($p->receive ?? [], 0, 12)),
            ['F1', 10, ''],
            ['F2', 11, 'LICENCE AND RIGHTS NOTICE'],
            ['F1', 9, sprintf('Licensed to: %s (%s)', $e->holder_name ?? 'Holder', $e->authorised_entity ?? 'individual')],
            ['F1', 9, sprintf('Licence class: %s | Entitlement: %s | Order: %s', Licences::label($e->licence_class), $e->reference, $e->order_reference ?? '-')],
            ['F1', 9, sprintf('Product ID: %s | SKU: %s | Terms version: %s', $p->code, $p->sku, $e->terms_version)],
            ['F1', 9, 'You are licensing this product, not buying ownership of TBCA intellectual property.'],
            ['F1', 9, 'You may not share, resell or distribute beyond your granted rights.'],
            ['F1', 9, '(c) The Business Clinic.Africa - generated '.now()->format('d M Y H:i').' SAST'],
        ];

        return self::render($lines);
    }

    /** Tax-invoice style receipt for a paid digital-products order. */
    public static function receipt(\App\Models\Order $order): string
    {
        $lines = [
            ['F2', 18, 'The Business Clinic.Africa - Receipt'],
            ['F1', 10, 'Order reference: '.$order->reference],
            ['F1', 10, 'Status: '.strtoupper($order->status).' | Paid: '.($order->paid_at?->format('d M Y H:i') ?? '-').' SAST'],
            ['F1', 10, 'Billed to: '.($order->billing['name'] ?? '-').' <'.($order->billing['email'] ?? '-').'>'],
            ['F1', 10, ''],
            ['F2', 11, 'ITEMS'],
            ...$order->items->map(fn ($i) => ['F1', 10, sprintf('%s (%s) x%d  R %s', $i->name, $i->variant ?? '-', $i->quantity, number_format($i->line_zar, 2))])->all(),
            ['F1', 10, ''],
            ['F1', 10, 'Source price (ex VAT): R '.number_format($order->subtotal_zar, 2)],
            ['F1', 10, 'VAT (15%): R '.number_format($order->vat_zar, 2)],
            ['F1', 10, 'Platform and bank charges: R '.number_format($order->fees_zar, 2)],
            ['F2', 12, 'Amount paid: R '.number_format($order->total_zar, 2)],
            ['F1', 10, ''],
            ['F1', 9, 'Refunds are assessed under the Consumer Protection Act and the TBCA Refund & Download Policy.'],
        ];

        return self::render($lines);
    }

    /** @param  list<array{0: string, 1: int, 2: string}>  $lines */
    public static function render(array $lines): string
    {
        $y = 790;
        $stream = '';
        foreach ($lines as [$font, $size, $text]) {
            $text = str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], iconv('UTF-8', 'Windows-1252//TRANSLIT', (string) $text) ?: '');
            $stream .= sprintf("BT /%s %d Tf 50 %d Td (%s) Tj ET\n", $font, $size, $y, $text);
            $y -= $size + 8;
        }

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
            sprintf("<< /Length %d >>\nstream\n%sendstream", strlen($stream), $stream),
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $obj) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n{$obj}\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= 'xref'."\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach ($offsets as $o) {
            $pdf .= sprintf("%010d 00000 n \n", $o);
        }
        $pdf .= 'trailer'."\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        return $pdf;
    }
}
