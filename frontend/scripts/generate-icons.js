/**
 * generate-icons.js
 *
 * Regenera todos los assets PNG de la app desde el SVG fuente.
 * Requiere: @resvg/resvg-js (devDependency)
 *
 * Uso:
 *   node scripts/generate-icons.js
 */

"use strict";

const { Resvg } = require("@resvg/resvg-js");
const fs   = require("fs");
const path = require("path");

const ROOT    = path.join(__dirname, "..");
const ASSETS  = path.join(ROOT, "assets");
const BRAND   = path.join(ASSETS, "branding");

// ── SVG sources (hardcoded colors, no CSS vars) ──────────────────────────────

// Light-mode colors baked in (resvg does not support prefers-color-scheme)
const LIGHT_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="76" y1="66" x2="438" y2="410" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#5A87A5"/>
      <stop offset="55%"  stop-color="#2E5F7E"/>
      <stop offset="100%" stop-color="#7BA098"/>
    </linearGradient>
    <linearGradient id="g2" x1="76" y1="66" x2="438" y2="410" gradientUnits="userSpaceOnUse">
      <stop offset="0%"   stop-color="#82A6BF"/>
      <stop offset="100%" stop-color="#9BC0B5"/>
    </linearGradient>
    <mask id="mp">
      <rect width="512" height="512" fill="white"/>
      <circle cx="256" cy="224" r="42" fill="black"/>
      <path d="M 196,306 C 196,254 316,254 316,306 Z" fill="black"/>
    </mask>
  </defs>
  <g mask="url(#mp)" stroke="url(#g2)" stroke-width="5" stroke-linecap="round" opacity="0.45">
    <line x1="256" y1="256" x2="256"   y2="66"/>
    <line x1="256" y1="256" x2="436.7" y2="197.3"/>
    <line x1="256" y1="256" x2="367.7" y2="409.7"/>
    <line x1="256" y1="256" x2="144.3" y2="409.7"/>
    <line x1="256" y1="256" x2="75.3"  y2="197.3"/>
  </g>
  <polygon mask="url(#mp)" points="256,189.5 319.2,235.5 295.1,309.8 216.9,309.8 192.8,235.5"
    fill="none" stroke="url(#g2)" stroke-width="4" stroke-linejoin="round" opacity="0.40"/>
  <polygon mask="url(#mp)" points="256,142 364.4,220.8 323,348.2 189,348.2 147.6,220.8"
    fill="none" stroke="url(#g2)" stroke-width="5" stroke-linejoin="round" opacity="0.55"/>
  <polygon points="256,94.5 391.5,212 356.5,394.3 183.4,355.9 111.4,209"
    fill="none" stroke="url(#g)" stroke-width="12" stroke-linejoin="round"/>
  <polygon points="256,66 436.7,197.3 367.7,409.7 144.3,409.7 75.3,197.3"
    fill="none" stroke="url(#g)" stroke-width="15" stroke-linejoin="round"/>
  <g fill="url(#g)">
    <circle cx="256"   cy="94.5"  r="10"/>
    <circle cx="391.5" cy="212"   r="10"/>
    <circle cx="356.5" cy="394.3" r="10"/>
    <circle cx="183.4" cy="355.9" r="10"/>
    <circle cx="111.4" cy="209"   r="10"/>
  </g>
  <g fill="none" stroke="#2E5F7E" stroke-linecap="round" stroke-linejoin="round" stroke-width="13">
    <circle cx="256" cy="224" r="28"/>
    <path d="M 208,294 C 208,270 304,270 304,294"/>
  </g>
</svg>`;

// icon.png needs a white background (Expo requirement)
const LIGHT_ON_WHITE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#FFFFFF"/>
  ${LIGHT_SVG.replace(/<svg[^>]*>/, "").replace("</svg>", "")}
</svg>`;

// Monochrome: single-color version for Android themed icons
const MONO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <mask id="mp">
      <rect width="512" height="512" fill="white"/>
      <circle cx="256" cy="224" r="42" fill="black"/>
      <path d="M 196,306 C 196,254 316,254 316,306 Z" fill="black"/>
    </mask>
  </defs>
  <g mask="url(#mp)" stroke="#000000" stroke-width="5" stroke-linecap="round" opacity="0.45">
    <line x1="256" y1="256" x2="256"   y2="66"/>
    <line x1="256" y1="256" x2="436.7" y2="197.3"/>
    <line x1="256" y1="256" x2="367.7" y2="409.7"/>
    <line x1="256" y1="256" x2="144.3" y2="409.7"/>
    <line x1="256" y1="256" x2="75.3"  y2="197.3"/>
  </g>
  <polygon mask="url(#mp)" points="256,189.5 319.2,235.5 295.1,309.8 216.9,309.8 192.8,235.5"
    fill="none" stroke="#000000" stroke-width="4" stroke-linejoin="round" opacity="0.40"/>
  <polygon mask="url(#mp)" points="256,142 364.4,220.8 323,348.2 189,348.2 147.6,220.8"
    fill="none" stroke="#000000" stroke-width="5" stroke-linejoin="round" opacity="0.55"/>
  <polygon points="256,94.5 391.5,212 356.5,394.3 183.4,355.9 111.4,209"
    fill="none" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <polygon points="256,66 436.7,197.3 367.7,409.7 144.3,409.7 75.3,197.3"
    fill="none" stroke="#000000" stroke-width="15" stroke-linejoin="round"/>
  <g fill="#000000">
    <circle cx="256"   cy="94.5"  r="10"/>
    <circle cx="391.5" cy="212"   r="10"/>
    <circle cx="356.5" cy="394.3" r="10"/>
    <circle cx="183.4" cy="355.9" r="10"/>
    <circle cx="111.4" cy="209"   r="10"/>
  </g>
  <g fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="13">
    <circle cx="256" cy="224" r="28"/>
    <path d="M 208,294 C 208,270 304,270 304,294"/>
  </g>
</svg>`;

// ── Generator ────────────────────────────────────────────────────────────────

function renderPng(svgString, widthPx) {
  const resvg = new Resvg(svgString, { fitTo: { mode: "width", value: widthPx } });
  return resvg.render().asPng();
}

function write(buffer, dest) {
  fs.writeFileSync(dest, buffer);
  const kb = (buffer.length / 1024).toFixed(1);
  console.log(`  OK  ${path.relative(ROOT, dest)}  (${kb} KB)`);
}

console.log("\nGenerating app icons...\n");

// icon.png — 1024x1024 on white (Expo main icon)
write(renderPng(LIGHT_ON_WHITE_SVG, 1024), path.join(ASSETS, "icon.png"));

// favicon.png — 48x48 transparent
write(renderPng(LIGHT_SVG, 48), path.join(ASSETS, "favicon.png"));

// android-icon-foreground.png — 1024x1024 transparent (centered at 66%)
// Per Android guidelines, artwork should occupy ~66% of the safe zone
const ANDROID_FG_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g transform="scale(0.66) translate(${Math.round(512*0.17)}, ${Math.round(512*0.17)})">
    ${LIGHT_SVG.replace(/<svg[^>]*>/, "").replace("</svg>", "")}
  </g>
</svg>`;
write(renderPng(ANDROID_FG_SVG, 1024), path.join(ASSETS, "android-icon-foreground.png"));

// android-icon-background.png — 1024x1024 solid design-system bg (#F5F7F5)
const BG_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#F5F7F5"/>
</svg>`;
write(renderPng(BG_SVG, 1024), path.join(ASSETS, "android-icon-background.png"));

// android-icon-monochrome.png — 1024x1024 black/alpha
write(renderPng(MONO_SVG, 1024), path.join(ASSETS, "android-icon-monochrome.png"));

// splash-icon.png — 200x200 on transparent (Expo splash)
write(renderPng(LIGHT_SVG, 200), path.join(ASSETS, "splash-icon.png"));

// Branding copies (higher-res SVG renders for design use)
write(renderPng(LIGHT_SVG, 512), path.join(BRAND, "app-icon-512.png"));

console.log("\nAll icons generated successfully.\n");
