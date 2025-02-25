<script>
  import "../app.css";
  import { page } from '$app/stores';
</script>

<svelte:head>
  <!-- 基本的なメタタグ -->
  <title>マイクロ・小水力発電シミュレータ | 水力発電の可能性を計算</title>
  <meta name="description" content="マイクロ・小水力発電シミュレータは、流量、有効落差、水車タイプに基づいて発電量、年間発電量、経済性、CO2削減量を計算します。持続可能なエネルギー計画のための無料ツールです。" />
  <meta name="keywords" content="マイクロ水力発電,小水力発電,水力発電シミュレータ,再生可能エネルギー,発電量計算,水車効率,経済性分析" />
  
  <!-- OGP（Open Graph Protocol）メタタグ -->
  <meta property="og:title" content="マイクロ・小水力発電シミュレータ | 水力発電の可能性を計算" />
  <meta property="og:description" content="流量、有効落差、水車タイプに基づいて発電量、年間発電量、経済性、CO2削減量を計算する無料シミュレータ" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.href} />
  <meta property="og:image" content={$page.url.origin + '/hydro-power-og.png'} />
  <meta property="og:site_name" content="マイクロ・小水力発電シミュレータ" />
  
  <!-- Twitter Card メタタグ -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="マイクロ・小水力発電シミュレータ | 水力発電の可能性を計算" />
  <meta name="twitter:description" content="流量、有効落差、水車タイプに基づいて発電量、年間発電量、経済性、CO2削減量を計算する無料シミュレータ" />
  <meta name="twitter:image" content={$page.url.origin + '/hydro-power-og.png'} />
  
  <!-- 構造化データ（JSON-LD） -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "マイクロ・小水力発電シミュレータ",
    "description": "マイクロ・小水力発電シミュレータは、流量、有効落差、水車タイプに基づいて発電量、年間発電量、経済性、CO2削減量を計算します。持続可能なエネルギー計画のための無料ツールです。",
    "applicationCategory": "CalculatorApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "JPY"
    }
  }
  </script>
</svelte:head>

<slot></slot>
