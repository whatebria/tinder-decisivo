"""
Audita el contraste WCAG 2.2 AA/AAA de las combinaciones foreground/background
que usa el design system de tinder-decisivo (Paleta A) en ambos temas.

Uso:
    python audit_wcag.py

Genera wcag-audit.html en la misma carpeta y lo abre en el browser.
"""
from __future__ import annotations

import html
import os
import webbrowser
from dataclasses import dataclass
from pathlib import Path


# --------------------------------------------------------------------------- #
# Tokens (deben coincidir con :root del design-system.html)
# --------------------------------------------------------------------------- #

LIGHT = {
    "bg":         "#F5F7F5",
    "card":       "#FFFFFF",
    "primary":    "#2E5F7E",
    "primary-h":  "#24506C",
    "secondary":  "#7BA098",
    "accent":     "#A8C5B5",
    "accent-2":   "#D4E4DB",
    "text":       "#1A2B33",
    "text-2":     "#5A6B73",
    "text-3":     "#8A9199",
    "border":     "#DDE4E1",
    "border-2":   "#EEF2EF",
    "success":    "#6B9B7A",
    "warning":    "#C89B5C",
    "danger":     "#B85C5C",
    "info":       "#5C8AB8",
    "gray-50":    "#F7F8F7",
    "gray-100":   "#EEF0EE",
    "gray-200":   "#E1E5E2",
    "gray-300":   "#CBD1CD",
    "gray-400":   "#A8B0AA",
    "gray-500":   "#7C8580",
    "gray-600":   "#5C6560",
    "gray-700":   "#444C47",
    "gray-800":   "#2E3532",
    "gray-900":   "#1A1F1C",
    "success-700": "#42654D",
    "warning-700": "#816339",
    "danger-700":  "#763838",
    "info-700":    "#395978",
    "primary-800": "#1B3D53",
    "primary-100": "#D6E2EB",
    "success-100": "#DAE8DE",
    "warning-100": "#F5E8D0",
    "danger-100":  "#F1D0D0",
    "info-100":    "#D3E0EE",
    "white":       "#FFFFFF",
}

DARK = {
    "bg":         "#0B1418",
    "card":       "#1B2830",
    "primary":    "#7BB5D4",
    "primary-h":  "#9BC7DF",
    "secondary":  "#9BC0B5",
    "accent":     "#3D5A4E",
    "accent-2":   "#2A3E36",
    "text":       "#E8EEEA",
    "text-2":     "#A8B5AC",
    "text-3":     "#7C8A80",
    "border":     "#3A4C55",
    "border-2":   "#2A3B44",
    "success":    "#8FB89A",
    "warning":    "#D9B378",
    "danger":     "#D07777",
    "info":       "#7DA4CB",
    # En dark la escala de grises se invierte semanticamente
    "gray-50":    "#1A1F1C",
    "gray-100":   "#2E3532",
    "gray-200":   "#444C47",
    "gray-300":   "#5C6560",
    "gray-400":   "#7C8580",
    "gray-500":   "#A8B0AA",
    "gray-600":   "#CBD1CD",
    "gray-700":   "#E1E5E2",
    "gray-800":   "#EEF0EE",
    "gray-900":   "#F7F8F7",
    # Overrides dark para feedback
    "success-fg-on-tint": "#B7D2C0",
    "warning-fg-on-tint": "#EBD1A0",
    "danger-fg-on-tint":  "#E1A0A0",
    "info-fg-on-tint":    "#A6C2DD",
    "white":       "#FFFFFF",
}


# --------------------------------------------------------------------------- #
# WCAG contrast math
# --------------------------------------------------------------------------- #

def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _channel_luminance(c: int) -> float:
    s = c / 255.0
    return s / 12.92 if s <= 0.03928 else ((s + 0.055) / 1.055) ** 2.4


def relative_luminance(hex_color: str) -> float:
    r, g, b = hex_to_rgb(hex_color)
    return 0.2126 * _channel_luminance(r) + 0.7152 * _channel_luminance(g) + 0.0722 * _channel_luminance(b)


def contrast_ratio(fg: str, bg: str) -> float:
    l1 = relative_luminance(fg)
    l2 = relative_luminance(bg)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


# --------------------------------------------------------------------------- #
# Check catalog: cada tupla = (categoria, uso, fg_key, bg_key, tipo)
#   tipo: 'text-normal' | 'text-large' | 'ui'
# --------------------------------------------------------------------------- #

CHECKS: list[tuple[str, str, str, str, str]] = [
    # --- Texto principal ---
    ("Texto",  "Body sobre fondo pagina",         "text",      "bg",       "text-normal"),
    ("Texto",  "Body sobre card",                 "text",      "card",     "text-normal"),
    ("Texto",  "Texto secundario sobre pagina",   "text-2",    "bg",       "text-normal"),
    ("Texto",  "Texto secundario sobre card",     "text-2",    "card",     "text-normal"),
    ("Texto",  "Texto terciario sobre card",      "text-3",    "card",     "text-normal"),
    ("Texto",  "Placeholder gray-400 sobre card", "gray-400",  "card",     "text-normal"),
    # --- Headings / brand ---
    ("Brand",  "Primary como texto sobre card",   "primary",   "card",     "text-normal"),
    ("Brand",  "Primary como texto sobre pagina", "primary",   "bg",       "text-normal"),
    ("Brand",  "Secondary como texto sobre card", "secondary", "card",     "text-normal"),
    # --- CTAs / Buttons ---
    ("Botones","Boton primario (white sobre primary)", "white", "primary", "text-normal"),
    ("Botones","Boton primary-h hover",                 "white", "primary-h", "text-normal"),
    ("Botones","Boton secundario (primary sobre card)", "primary", "card",  "text-normal"),
    ("Botones","Boton ghost (text-2 sobre card)",       "text-2",  "card",  "text-normal"),
    ("Botones","Boton danger (white sobre danger)",     "white",   "danger","text-normal"),
    # --- Bordes/UI (regla 3:1) ---
    ("UI",     "Border sobre card",               "border",    "card",     "ui"),
    ("UI",     "Border sobre pagina",             "border",    "bg",       "ui"),
    ("UI",     "Accent sobre card",               "accent",    "card",     "ui"),
    # --- Feedback badges ---
    ("Badges", "Success-700 sobre success-100",   "success-700", "success-100", "text-normal"),
    ("Badges", "Warning-700 sobre warning-100",   "warning-700", "warning-100", "text-normal"),
    ("Badges", "Danger-700 sobre danger-100",     "danger-700",  "danger-100",  "text-normal"),
    ("Badges", "Info-700 sobre info-100",         "info-700",    "info-100",    "text-normal"),
    ("Badges", "Primary-800 sobre primary-100",   "primary-800", "primary-100", "text-normal"),
    # --- Match tiers ---
    ("Match",  "Success-700 sobre bg pagina",     "success-700", "bg",     "text-normal"),
    ("Match",  "Info-700 sobre bg pagina",        "info-700",    "bg",     "text-normal"),
    ("Match",  "Warning-700 sobre bg pagina",     "warning-700", "bg",     "text-normal"),
    # --- Grises escala ---
    ("Grises", "Gray-700 sobre gray-50",          "gray-700",  "gray-50",  "text-normal"),
    ("Grises", "Gray-800 sobre gray-100",         "gray-800",  "gray-100", "text-normal"),
    ("Grises", "Gray-500 sobre card (iconos)",    "gray-500",  "card",     "ui"),
    # --- Focus ring ---
    # (el shadow es semi-transparente, esta chequeo es indicativo del color base)
    ("Focus",  "Primary como ring sobre card",    "primary",   "card",     "ui"),
]


# Sobre-escritura de fg para badges en dark (usan tints claros sobre bg oscuro)
DARK_FG_OVERRIDES = {
    ("Badges", "Success-700 sobre success-100"): ("success-fg-on-tint", "card"),
    ("Badges", "Warning-700 sobre warning-100"): ("warning-fg-on-tint", "card"),
    ("Badges", "Danger-700 sobre danger-100"):   ("danger-fg-on-tint",  "card"),
    ("Badges", "Info-700 sobre info-100"):       ("info-fg-on-tint",    "card"),
    ("Badges", "Primary-800 sobre primary-100"): ("text",               "card"),
    ("Match",  "Success-700 sobre bg pagina"):   ("success-fg-on-tint", "bg"),
    ("Match",  "Info-700 sobre bg pagina"):      ("info-fg-on-tint",    "bg"),
    ("Match",  "Warning-700 sobre bg pagina"):   ("warning-fg-on-tint", "bg"),
}


# --------------------------------------------------------------------------- #
# Thresholds
# --------------------------------------------------------------------------- #

THRESHOLDS = {
    "text-normal": {"AA": 4.5, "AAA": 7.0},
    "text-large":  {"AA": 3.0, "AAA": 4.5},
    "ui":          {"AA": 3.0, "AAA": 3.0},  # WCAG no define AAA para UI
}


@dataclass
class Result:
    categoria: str
    uso: str
    fg_key: str
    bg_key: str
    fg_hex: str
    bg_hex: str
    tipo: str
    ratio: float

    @property
    def aa(self) -> bool:
        return self.ratio >= THRESHOLDS[self.tipo]["AA"]

    @property
    def aaa(self) -> bool:
        return self.ratio >= THRESHOLDS[self.tipo]["AAA"]

    @property
    def status(self) -> str:
        if self.aaa:
            return "AAA"
        if self.aa:
            return "AA"
        return "FAIL"


def run(theme_name: str, tokens: dict[str, str]) -> list[Result]:
    results: list[Result] = []
    for cat, uso, fg_k, bg_k, tipo in CHECKS:
        if theme_name == "dark":
            override = DARK_FG_OVERRIDES.get((cat, uso))
            if override:
                fg_k, bg_k = override
        fg_hex = tokens[fg_k]
        bg_hex = tokens[bg_k]
        ratio = contrast_ratio(fg_hex, bg_hex)
        results.append(Result(cat, uso, fg_k, bg_k, fg_hex, bg_hex, tipo, ratio))
    return results


# --------------------------------------------------------------------------- #
# HTML report
# --------------------------------------------------------------------------- #

def render_status_pill(status: str) -> str:
    palette = {
        "AAA":  ("#DAE8DE", "#42654D", "AAA"),
        "AA":   ("#D3E0EE", "#395978", "AA"),
        "FAIL": ("#F1D0D0", "#763838", "FAIL"),
    }
    bg, fg, txt = palette[status]
    return (
        f'<span style="background:{bg};color:{fg};padding:2px 10px;'
        f'border-radius:999px;font-size:11px;font-weight:600;'
        f'letter-spacing:.04em">{txt}</span>'
    )


def render_swatch(hex_color: str) -> str:
    return (
        f'<span style="display:inline-block;width:14px;height:14px;'
        f'border-radius:3px;background:{hex_color};border:1px solid rgba(0,0,0,.1);'
        f'vertical-align:middle;margin-right:6px"></span>'
        f'<code style="font-size:11px;color:#5A6B73">{hex_color}</code>'
    )


def render_theme_table(theme_name: str, results: list[Result]) -> str:
    rows_html = []
    by_cat: dict[str, list[Result]] = {}
    for r in results:
        by_cat.setdefault(r.categoria, []).append(r)

    for cat, items in by_cat.items():
        rows_html.append(
            f'<tr class="bg-slate-50"><td colspan="6" class="px-4 py-2 text-xs '
            f'font-semibold uppercase tracking-wider text-slate-500">{html.escape(cat)}</td></tr>'
        )
        for r in items:
            preview = (
                f'<div style="background:{r.bg_hex};color:{r.fg_hex};'
                f'padding:6px 10px;border-radius:6px;border:1px solid rgba(0,0,0,.08);'
                f'font-size:13px;font-weight:500;display:inline-block">Ejemplo</div>'
            )
            rows_html.append(
                "<tr class='border-b border-slate-100'>"
                f"<td class='px-4 py-3 text-sm text-slate-800'>{html.escape(r.uso)}</td>"
                f"<td class='px-4 py-3 text-sm text-slate-600'>{render_swatch(r.fg_hex)}<span class='ml-1 text-xs text-slate-400'>{r.fg_key}</span></td>"
                f"<td class='px-4 py-3 text-sm text-slate-600'>{render_swatch(r.bg_hex)}<span class='ml-1 text-xs text-slate-400'>{r.bg_key}</span></td>"
                f"<td class='px-4 py-3 text-sm text-center'>{preview}</td>"
                f"<td class='px-4 py-3 text-sm font-mono text-right text-slate-700'>{r.ratio:.2f}:1</td>"
                f"<td class='px-4 py-3 text-center'>{render_status_pill(r.status)}</td>"
                "</tr>"
            )

    stats_pass_aa = sum(1 for r in results if r.aa)
    stats_pass_aaa = sum(1 for r in results if r.aaa)
    stats_fail = sum(1 for r in results if not r.aa)
    total = len(results)

    theme_label = "Modo claro" if theme_name == "light" else "Modo oscuro"

    return f"""
    <section class="mb-12">
      <h2 class="text-2xl font-bold text-slate-900 mb-1">{theme_label}</h2>
      <div class="flex gap-3 mb-4 text-sm">
        <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">{stats_pass_aaa} pasan AAA</span>
        <span class="px-3 py-1 rounded-full bg-sky-100 text-sky-800 font-medium">{stats_pass_aa - stats_pass_aaa} solo AA</span>
        <span class="px-3 py-1 rounded-full {'bg-red-100 text-red-800' if stats_fail else 'bg-slate-100 text-slate-600'} font-medium">{stats_fail} fallan</span>
        <span class="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{total} chequeos</span>
      </div>
      <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr class="text-xs uppercase tracking-wider text-slate-500">
              <th class="px-4 py-3 text-left font-semibold">Uso</th>
              <th class="px-4 py-3 text-left font-semibold">Foreground</th>
              <th class="px-4 py-3 text-left font-semibold">Background</th>
              <th class="px-4 py-3 text-center font-semibold">Preview</th>
              <th class="px-4 py-3 text-right font-semibold">Ratio</th>
              <th class="px-4 py-3 text-center font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {''.join(rows_html)}
          </tbody>
        </table>
      </div>
    </section>
    """


def build_report(light_results: list[Result], dark_results: list[Result]) -> str:
    total = len(light_results) + len(dark_results)
    all_fail = [
        (r, "Modo claro") for r in light_results if not r.aa
    ] + [
        (r, "Modo oscuro") for r in dark_results if not r.aa
    ]

    exec_top = (
        f'<p class="text-slate-700">Se auditaron <b>{total}</b> combinaciones de foreground/background '
        f'entre modo claro y modo oscuro contra los umbrales de contraste WCAG 2.2 '
        f'(AA texto normal 4.5:1 · AA texto grande / UI 3.0:1 · AAA texto normal 7.0:1).</p>'
    )

    if not all_fail:
        exec_top += (
            '<p class="mt-3 text-emerald-700 font-medium">Todas las combinaciones auditadas '
            'cumplen al menos WCAG 2.2 AA. No hay ajustes obligatorios pendientes.</p>'
        )
    else:
        rows = ''.join(
            f'<li><b>{html.escape(theme)}</b> — {html.escape(r.uso)} '
            f'(<code>{r.fg_key}</code> sobre <code>{r.bg_key}</code>) '
            f'da <b>{r.ratio:.2f}:1</b>, necesita '
            f'<b>{THRESHOLDS[r.tipo]["AA"]}:1</b>.</li>'
            for r, theme in all_fail
        )
        exec_top += (
            f'<p class="mt-3 text-red-700 font-medium">Se detectaron '
            f'{len(all_fail)} combinaciones que NO alcanzan AA:</p>'
            f'<ul class="mt-2 list-disc pl-6 text-sm text-slate-700 space-y-1">{rows}</ul>'
        )

    exec_bottom = (
        '<h3 class="text-lg font-semibold text-slate-900 mb-2">Recomendaciones</h3>'
        '<ul class="list-disc pl-6 text-sm text-slate-700 space-y-2">'
        '<li>Priorizar los pares que fallan AA antes de cualquier release. '
        'Todo texto por debajo de 4.5:1 es ilegible para gente con baja visión.</li>'
        '<li>Los pares en AA (no AAA) son aceptables pero conviene revisarlos '
        'si se van a usar en superficies con mucho texto largo.</li>'
        '<li>Cuando se agreguen tokens nuevos, correr este script antes de mergear. '
        'Está pensado para vivir en el repo como parte del pipeline de diseño.</li>'
        '</ul>'
    )

    body = f"""<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Auditoría WCAG — Design System tinder-decisivo</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body {{ font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }}
  code {{ font-family: ui-monospace, "SF Mono", Consolas, monospace; font-size: 11px; background: #F1F5F9; padding: 1px 5px; border-radius: 3px; }}
  table td {{ vertical-align: middle; }}
</style>
</head>
<body class="bg-slate-100 min-h-screen">

<header class="bg-white border-b border-slate-200">
  <div class="max-w-6xl mx-auto px-6 py-6">
    <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Auditoría</div>
    <h1 class="text-2xl font-bold text-slate-900">Contraste WCAG 2.2 — Design System</h1>
    <p class="text-slate-600 mt-1">Paleta A · tinder-decisivo · modos claro y oscuro</p>
  </div>
</header>

<main class="max-w-6xl mx-auto p-6">

  <section class="bg-white rounded-lg border border-slate-200 p-6 mb-8">
    <h2 class="text-lg font-semibold text-slate-900 mb-3">Resumen ejecutivo</h2>
    {exec_top}
  </section>

  {render_theme_table("light", light_results)}
  {render_theme_table("dark", dark_results)}

  <section class="bg-white rounded-lg border border-slate-200 p-6 mb-8">
    {exec_bottom}
  </section>

</main>

<footer class="max-w-6xl mx-auto px-6 py-8 text-xs text-slate-500">
  Generado por audit_wcag.py — WCAG 2.2 SC 1.4.3 (texto), 1.4.11 (UI components).
</footer>

</body>
</html>
"""
    return body


def main() -> None:
    here = Path(__file__).parent
    light = run("light", LIGHT)
    dark = run("dark", DARK)

    report = build_report(light, dark)
    out_path = here / "wcag-audit.html"
    out_path.write_text(report, encoding="utf-8")

    print(f"Reporte generado: {out_path}")
    print(f"Modo claro:  {sum(1 for r in light if r.aa)}/{len(light)} pasan AA")
    print(f"Modo oscuro: {sum(1 for r in dark if r.aa)}/{len(dark)} pasan AA")

    webbrowser.open(f"file://{out_path.resolve()}")


if __name__ == "__main__":
    main()
