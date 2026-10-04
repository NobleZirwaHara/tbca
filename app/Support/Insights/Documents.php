<?php

namespace App\Support\Insights;

use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Generates small, valid single-page PDF documents (resource downloads,
 * disclosures, engagement letters) and ICS calendars without extra packages.
 */
class Documents
{
    /** @param list<string> $lines */
    public static function pdf(string $filename, string $title, array $lines): StreamedResponse
    {
        $esc = fn (string $s) => str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], preg_replace('/[^\x20-\x7E]/', '-', $s));

        $wrapped = [];
        foreach ($lines as $line) {
            foreach (explode("\n", wordwrap($line, 92, "\n", true)) as $l) {
                $wrapped[] = $l;
            }
        }
        $wrapped = array_slice($wrapped, 0, 52);

        $stream = "BT /F1 18 Tf 50 790 Td (".$esc($title).") Tj ET\n";
        $stream .= "BT /F1 9 Tf 50 772 Td (The Business Clinic.Africa - controlled document - generated ".date('d M Y H:i').") Tj ET\n";
        $y = 745;
        foreach ($wrapped as $l) {
            $stream .= "BT /F1 10 Tf 50 {$y} Td (".$esc($l).") Tj ET\n";
            $y -= 14;
        }

        $objects = [
            '<< /Type /Catalog /Pages 2 0 R >>',
            '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
            '<< /Length '.strlen($stream)." >>\nstream\n".$stream."endstream",
            '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
        ];

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        foreach ($objects as $i => $obj) {
            $offsets[] = strlen($pdf);
            $pdf .= ($i + 1)." 0 obj\n".$obj."\nendobj\n";
        }
        $xref = strlen($pdf);
        $pdf .= "xref\n0 ".(count($objects) + 1)."\n0000000000 65535 f \n";
        foreach ($offsets as $o) {
            $pdf .= sprintf("%010d 00000 n \n", $o);
        }
        $pdf .= "trailer\n<< /Size ".(count($objects) + 1)." /Root 1 0 R >>\nstartxref\n{$xref}\n%%EOF";

        return response()->streamDownload(fn () => print ($pdf), $filename, ['Content-Type' => 'application/pdf']);
    }

    /** @param list<array{title:string,date:\DateTimeInterface,description?:string}> $events */
    public static function ics(string $filename, array $events): StreamedResponse
    {
        $out = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TBCA//Sector Compliance Calendar//EN\r\n";
        foreach ($events as $i => $e) {
            $d = $e['date']->format('Ymd');
            $out .= "BEGIN:VEVENT\r\nUID:tbca-{$i}-{$d}@thebusinessclinic.africa\r\nDTSTAMP:".gmdate('Ymd\THis\Z')."\r\nDTSTART;VALUE=DATE:{$d}\r\nSUMMARY:".addcslashes($e['title'], ',;')."\r\nDESCRIPTION:".addcslashes($e['description'] ?? '', ',;')."\r\nEND:VEVENT\r\n";
        }
        $out .= "END:VCALENDAR\r\n";

        return response()->streamDownload(fn () => print ($out), $filename, ['Content-Type' => 'text/calendar']);
    }

    /** @param list<array<string, scalar|null>> $rows */
    public static function csv(string $filename, array $rows): StreamedResponse
    {
        return response()->streamDownload(function () use ($rows) {
            $h = fopen('php://output', 'w');
            if ($rows) {
                fputcsv($h, array_keys($rows[0]));
            }
            foreach ($rows as $r) {
                fputcsv($h, array_values($r));
            }
            fclose($h);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
