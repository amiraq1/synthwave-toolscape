import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

serve((req) => {
  const url = new URL(req.url);
  const title = escapeXml(url.searchParams.get("title") || "نبض AI");
  const category = escapeXml(
    url.searchParams.get("category") || "دليل أدوات الذكاء الاصطناعي",
  );

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f0f1a" />
      <stop offset="100%" stop-color="#1a1a2e" />
    </linearGradient>
    <linearGradient id="title" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#a78bfa" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <circle cx="160" cy="120" r="140" fill="#7c3aed" fill-opacity="0.10" />
  <circle cx="1060" cy="520" r="180" fill="#22d3ee" fill-opacity="0.08" />
  <rect x="60" y="60" width="1080" height="510" rx="36" fill="none" stroke="rgba(167,139,250,0.35)" />
  <text x="600" y="160" text-anchor="middle" font-family="'Cairo', 'Segoe UI', sans-serif" font-size="34" font-weight="700" fill="#c4b5fd">
    نبض AI
  </text>
  <foreignObject x="120" y="190" width="960" height="220">
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;height:100%;align-items:center;justify-content:center;text-align:center;color:white;font-family:Cairo,Segoe UI,sans-serif;font-size:68px;font-weight:800;line-height:1.15;">
      <span style="background:linear-gradient(90deg,#ffffff,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent;">${title}</span>
    </div>
  </foreignObject>
  <foreignObject x="180" y="455" width="840" height="90">
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;height:100%;align-items:center;justify-content:center;text-align:center;color:#d1d5db;font-family:Cairo,Segoe UI,sans-serif;font-size:30px;line-height:1.35;padding:0 24px;border:1px solid rgba(167,139,250,0.35);border-radius:999px;background:rgba(124,58,237,0.10);">
      ${category}
    </div>
  </foreignObject>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
