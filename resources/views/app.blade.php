<!DOCTYPE html>
@php
    $tbcaLanguage = session('tbca.language', 'en');
    $tbcaLanguageMeta = collect(config('tbca.languages'))->firstWhere('code', $tbcaLanguage);
    $tbcaHtmlLang = $tbcaLanguageMeta['html'] ?? 'en';
    $tbcaDir = $tbcaLanguageMeta['dir'] ?? 'ltr';
@endphp
<html lang="{{ $tbcaHtmlLang }}" dir="{{ $tbcaDir }}" class="antialiased">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#0d0d11">

    <title inertia>{{ config('tbca.brand.name') }}</title>

    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" href="/brand/tbca-mark.png" type="image/png">
    <link rel="apple-touch-icon" href="/brand/icon-180.png">

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="min-h-screen bg-parchment-200 font-sans">
    @inertia
</body>
</html>
