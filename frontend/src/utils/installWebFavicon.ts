/**
 * installWebFavicon: inyecta los <link rel="icon"> en el <head> del browser.
 *
 * Motivacion:
 *   Expo Metro web genera el HTML de forma dinamica y NO incluye ningun
 *   <link rel="icon"> en el documento. Sin esto, el browser solo hace
 *   auto-discovery de /favicon.ico (sin dark mode, sin SVG moderno).
 *
 *   El lugar correcto para hacerlo es un util aislado llamado UNA vez al
 *   montar la app, siguiendo el mismo patron que installAriaHiddenFocusGuard.
 *   NO va inline en App.tsx para no mezclar concerns del shell de la app con
 *   preocupaciones del browser.
 *
 * Stack de favicon:
 *   1. SVG (Chrome 80+, Firefox 41+, Safari 9.1+) con prefers-color-scheme
 *      interno — el browser cambia el icono automaticamente con el OS.
 *   2. PNG 48px como fallback para browsers sin soporte SVG favicon.
 *
 * Archivos servidos desde public/ (Metro sirve esta carpeta en la raiz):
 *   /favicon.svg  <- fuente: assets/favicon.svg (generado por generate-icons.js)
 *   /favicon.png  <- fuente: assets/favicon.png (generado por generate-icons.js)
 *
 * Guards:
 *   - Corre una sola vez (flag en document.head)
 *   - Solo en web (el caller verifica Platform.OS)
 *   - Idempotente: si los links ya existen, no los duplica
 */

const INSTALLED_FLAG = "data-appicon-installed";

export function installWebFavicon(): void {
  if (typeof document === "undefined") return;
  if (document.head.hasAttribute(INSTALLED_FLAG)) return;
  document.head.setAttribute(INSTALLED_FLAG, "1");

  // SVG primario — soporta prefers-color-scheme para dark mode automatico
  const svgLink = document.createElement("link");
  svgLink.rel  = "icon";
  svgLink.type = "image/svg+xml";
  svgLink.href = "/favicon.svg";
  document.head.appendChild(svgLink);

  // PNG fallback — browsers sin soporte SVG favicon (IE, algunos Safari viejos)
  const pngLink = document.createElement("link");
  pngLink.rel  = "icon";
  pngLink.type = "image/png";
  pngLink.setAttribute("sizes", "48x48");
  pngLink.href = "/favicon.png";
  document.head.appendChild(pngLink);
}
