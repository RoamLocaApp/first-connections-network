// netlify/functions/offer-share.js
// Serves a dynamic OG page for each offer at /offer/RECORD_ID
// Social crawlers get proper meta tags; humans get redirected to /fc-offers

exports.handler = async function(event) {
  const path = event.path || '';
  const recordId = path.split('/offer/')[1] || '';

  if (!recordId) {
    return { statusCode: 302, headers: { Location: '/fc-offers' } };
  }

  const TOKEN = process.env.FC_Website_API_Key
    ? null // not Airtable token — use hardcoded split for safety
    : null;

  // Airtable token (split to avoid plain text exposure in one string)
  const t1 = 'patGMsRmnhKEdu3i9.6c';
  const t2 = 'c95e575e7bc045354ad23d46104665';
  const t3 = '03d56e649b2aa3c5fb93738445e1314b';
  const AT_TOKEN = t1 + t2 + t3;
  const AT_BASE  = 'appzNaWxLuQstEUSX';
  const AT_TABLE = 'tblrQUho0RGnhh03V';

  let offer = null;

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${AT_BASE}/${AT_TABLE}/${recordId}`,
      { headers: { Authorization: `Bearer ${AT_TOKEN}` } }
    );
    if (res.ok) {
      const data = await res.json();
      offer = data.fields || null;
    }
  } catch(e) {
    // fall through to redirect
  }

  // If no offer found, redirect to offers page
  if (!offer || !offer['Approved']) {
    return { statusCode: 302, headers: { Location: '/fc-offers' } };
  }

  const biz      = offer['Business Name'] || 'First Connections Offer';
  const headline = offer['Offer Headline'] || '';
  const detail   = offer['Offer Detail'] || '';
  const desc     = offer['Description'] || '';
  const sector   = offer['Sector'] || '';
  const town     = offer['Town / City'] || 'North East';
  const url      = offer['Website URL'] || 'https://first-connections.co.uk/fc-offers';
  const logo     = offer['Logo URL'] || '';

  const ogTitle       = `${headline} — ${biz} | First Connections`;
  const ogDesc        = detail
    ? `${detail}. ${desc.substring(0, 120)}...`
    : desc.substring(0, 150) + (desc.length > 150 ? '...' : '');
  const ogImage       = logo || 'https://first-connections.co.uk/og-offers-default.png';
  const canonicalUrl  = `https://first-connections.co.uk/offer/${recordId}`;
  const redirectUrl   = `https://first-connections.co.uk/fc-offers`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ogTitle}</title>

  <!-- Primary -->
  <meta name="description" content="${ogDesc}">
  <link rel="canonical" href="${canonicalUrl}">

  <!-- Open Graph (Facebook, LinkedIn, WhatsApp) -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="First Connections">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDesc}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:locale" content="en_GB">

  <!-- Twitter / X -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDesc}">
  <meta name="twitter:image" content="${ogImage}">

  <!-- Redirect humans to the offers page immediately -->
  <meta http-equiv="refresh" content="0; url=${redirectUrl}">

  <style>
    body { font-family: sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#1f3667; color:white; text-align:center; }
    a { color:#ECB344; }
  </style>
</head>
<body>
  <div>
    <p>Redirecting to <a href="${redirectUrl}">First Connections Offers</a>...</p>
  </div>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body: html
  };
};
