// netlify/functions/og-offers-default.js
// Returns a branded SVG as a PNG-like image for OG sharing
// Deploy as: /og-offers-default.png via _redirects

exports.handler = async function() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1733"/>
      <stop offset="100%" style="stop-color:#1a2d5a"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ECB344"/>
      <stop offset="100%" style="stop-color:#F5C355"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative circle top right -->
  <circle cx="1050" cy="-80" r="320" fill="rgba(236,179,68,0.06)"/>
  <circle cx="1100" cy="700" r="250" fill="rgba(40,69,160,0.1)"/>

  <!-- Gold accent bar -->
  <rect x="80" y="200" width="60" height="4" rx="2" fill="url(#gold)"/>

  <!-- Label -->
  <text x="80" y="185" font-family="Georgia, serif" font-size="18" fill="#ECB344" letter-spacing="4" opacity="0.9">COMMUNITY MARKETPLACE · LIVE</text>

  <!-- Main headline -->
  <text x="80" y="270" font-family="Georgia, serif" font-size="68" font-weight="bold" fill="white">Deals from the</text>
  <text x="80" y="355" font-family="Georgia, serif" font-size="68" font-weight="bold" font-style="italic" fill="#ECB344">First Connections</text>
  <text x="80" y="440" font-family="Georgia, serif" font-size="68" font-weight="bold" fill="white">community</text>

  <!-- Subtext -->
  <text x="80" y="510" font-family="Arial, sans-serif" font-size="24" fill="rgba(255,255,255,0.6)">Exclusive offers from North East businesses — free to browse, free to list.</text>

  <!-- Domain badge -->
  <rect x="80" y="555" width="320" height="44" rx="22" fill="rgba(236,179,68,0.15)" stroke="#ECB344" stroke-width="1.5" opacity="0.8"/>
  <text x="240" y="582" font-family="Arial, sans-serif" font-size="18" fill="#ECB344" text-anchor="middle" font-weight="bold">first-connections.co.uk/fc-offers</text>

  <!-- FC logo text top right -->
  <text x="1120" y="60" font-family="Georgia, serif" font-size="22" fill="white" text-anchor="end" font-weight="bold" opacity="0.7">First <tspan font-style="italic" fill="#ECB344">Connections</tspan></text>
</svg>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    },
    body: svg
  };
};
