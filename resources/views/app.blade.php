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
    <link rel="icon" href="/brand/favicon-32.png" type="image/png" sizes="32x32">
    <link rel="icon" href="/brand/icon-192.png" type="image/png" sizes="192x192">
    <link rel="apple-touch-icon" href="/brand/icon-180.png">

    @if ($tbcaDir === 'rtl')
        {{-- Arabic web font, loaded only for right-to-left languages (the client adds it on a switch). --}}
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link id="tbca-font-rtl" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap">
    @endif

    @routes
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="min-h-screen bg-parchment-200 font-sans">
    @inertia
</body>
</html>
