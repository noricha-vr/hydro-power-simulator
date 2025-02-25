<script>
  import "../app.css";
  import { page } from '$app/stores';
</script>

<svelte:head>
  <!-- 基本的なメタタグ -->
  <title>マイクロ・小水力発電シミュレータ | 水流量・落差から発電量を簡単計算</title>
  <meta name="description" content="水流量(L/秒)と落差(m)から発電出力、年間発電量、経済性、CO2削減量を計算できる無料シミュレータ。ピコ水力からマイクロ水力まで、最適な水車タイプの選定や発電効率の可視化も可能です。再生可能エネルギー導入計画に最適なツールです。" />
  <meta name="keywords" content="マイクロ水力発電,小水力発電,ピコ水力発電,水力発電シミュレータ,再生可能エネルギー,発電量計算,水車効率,経済性分析,リットル毎秒,CO2削減" />
  
  <!-- OGP（Open Graph Protocol）メタタグ -->
  <meta property="og:title" content="マイクロ・小水力発電シミュレータ | 水流量・落差から発電量を簡単計算" />
  <meta property="og:description" content="水流量(L/秒)と落差(m)から発電出力、年間発電量、経済性、CO2削減量を計算。ピコ水力からマイクロ水力まで、最適な水車タイプの選定や発電効率の可視化も可能な無料シミュレータ。" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={$page.url.href} />
  <meta property="og:image" content={$page.url.origin + '/hydro-power-og.png'} />
  <meta property="og:site_name" content="マイクロ・小水力発電シミュレータ" />
  
  <!-- Twitter Card メタタグ -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="マイクロ・小水力発電シミュレータ | 水流量・落差から発電量を簡単計算" />
  <meta name="twitter:description" content="水流量(L/秒)と落差(m)から発電出力、年間発電量、経済性、CO2削減量を計算。ピコ水力からマイクロ水力まで、最適な水車タイプの選定や発電効率の可視化も可能な無料シミュレータ。" />
  <meta name="twitter:image" content={$page.url.origin + '/hydro-power-og.png'} />
  
  <!-- 構造化データ（JSON-LD） -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "マイクロ・小水力発電シミュレータ",
    "description": "水流量(L/秒)と落差(m)から発電出力、年間発電量、経済性、CO2削減量を計算できる無料シミュレータ。ピコ水力からマイクロ水力まで、最適な水車タイプの選定や発電効率の可視化も可能です。再生可能エネルギー導入計画に最適なツールです。",
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
