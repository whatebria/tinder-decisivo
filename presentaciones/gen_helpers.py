"""Helpers visuales compartidos para todas las presentaciones VotoAFin."""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

# ── Brand Colors ─────────────────────────────────────────────────────────────
HERO = RGBColor(0x1C, 0x3A, 0x52)       # #1C3A52 – fondo oscuro hero
PRIMARY = RGBColor(0x2E, 0x5F, 0x7E)    # #2E5F7E – azul principal
PRI_LIGHT = RGBColor(0x4A, 0x9B, 0xBF)  # #4A9BBF – acento azul claro
SECONDARY = RGBColor(0x7B, 0xA0, 0x98)  # #7BA098 – verde-gris
ACCENT = RGBColor(0x3A, 0x9E, 0x7A)     # #3A9E7A – verde acento
SURFACE = RGBColor(0xF7, 0xF8, 0xF7)    # #F7F8F7 – fondo claro
TEXT = RGBColor(0x1F, 0x2A, 0x35)       # texto oscuro en fondos claros
TEXT2 = RGBColor(0x4A, 0x55, 0x68)      # texto secundario
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
DANGER = RGBColor(0xDC, 0x26, 0x26)     # rojo para énfasis
AMBER = RGBColor(0xD9, 0x77, 0x06)      # ámbar
MID_BG = RGBColor(0x24, 0x4A, 0x63)     # hero ligeramente más claro

# ── Dimensiones 16:9 ─────────────────────────────────────────────────────────
W = Inches(13.333)
H = Inches(7.5)

MARGIN = Inches(0.7)
SAFE_W = W - 2 * MARGIN
SAFE_H = H - 2 * MARGIN


def new_prs() -> Presentation:
    prs = Presentation()
    prs.slide_width = W
    prs.slide_height = H
    return prs


def blank_slide(prs: Presentation):
    layout = prs.slide_layouts[6]  # blank
    return prs.slides.add_slide(layout)


def _set_bg(slide, color: RGBColor):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def _txb(slide, left, top, width, height):
    return slide.shapes.add_textbox(left, top, width, height)


def _para(tf, text: str, size: int, bold: bool, color: RGBColor,
          align=PP_ALIGN.LEFT, italic=False, space_before=0):
    p = tf.add_paragraph()
    p.text = text
    p.alignment = align
    run = p.runs[0]
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    run.font.italic = italic
    if space_before:
        p.space_before = Pt(space_before)
    return p


def _notes(slide, text: str):
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = text


# ── Slide templates ──────────────────────────────────────────────────────────

def dark_cover(prs, title: str, subtitle: str, label: str = "",
               notes: str = "") -> None:
    """Portada oscura estilo hero con título grande."""
    sl = blank_slide(prs)
    _set_bg(sl, HERO)

    # accent bar left
    bar = sl.shapes.add_shape(1, MARGIN, Inches(2.2), Inches(0.06), Inches(2.5))
    bar.fill.solid(); bar.fill.fore_color.rgb = ACCENT
    bar.line.fill.background()

    if label:
        tb = _txb(sl, MARGIN, Inches(1.6), SAFE_W, Inches(0.5))
        tf = tb.text_frame; tf.word_wrap = True
        p = tf.paragraphs[0]; p.text = label.upper()
        p.alignment = PP_ALIGN.LEFT
        r = p.runs[0]; r.font.size = Pt(11); r.font.bold = True
        r.font.color.rgb = ACCENT; r.font.italic = False

    tb = _txb(sl, MARGIN, Inches(2.4), SAFE_W, Inches(2.5))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = title
    p.alignment = PP_ALIGN.LEFT
    r = p.runs[0]; r.font.size = Pt(44); r.font.bold = True
    r.font.color.rgb = WHITE

    tb2 = _txb(sl, MARGIN, Inches(4.9), SAFE_W, Inches(1.2))
    tf2 = tb2.text_frame; tf2.word_wrap = True
    p2 = tf2.paragraphs[0]; p2.text = subtitle
    p2.alignment = PP_ALIGN.LEFT
    r2 = p2.runs[0]; r2.font.size = Pt(18); r2.font.bold = False
    r2.font.color.rgb = PRI_LIGHT

    # footer
    tb3 = _txb(sl, MARGIN, Inches(6.8), SAFE_W, Inches(0.4))
    tf3 = tb3.text_frame
    p3 = tf3.paragraphs[0]; p3.text = "VotoAFin · UTFSM · Jenifer Castillo · 2026"
    p3.alignment = PP_ALIGN.RIGHT
    r3 = p3.runs[0]; r3.font.size = Pt(9); r3.font.color.rgb = SECONDARY

    if notes:
        _notes(sl, notes)


def section_break(prs, number: str, title: str, subtitle: str = "",
                  notes: str = "") -> None:
    """Diapositiva de quiebre de sección."""
    sl = blank_slide(prs)
    _set_bg(sl, PRIMARY)

    # number big
    tb = _txb(sl, MARGIN, Inches(1.5), Inches(2), Inches(2))
    tf = tb.text_frame
    p = tf.paragraphs[0]; p.text = number
    r = p.runs[0]; r.font.size = Pt(96); r.font.bold = True
    r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF); r.font.italic = False
    # 30% opacity-like: use a lighter color to simulate
    r.font.color.rgb = RGBColor(0x6E, 0xA2, 0xC0)

    tb2 = _txb(sl, MARGIN, Inches(3.5), SAFE_W, Inches(1.5))
    tf2 = tb2.text_frame; tf2.word_wrap = True
    p2 = tf2.paragraphs[0]; p2.text = title
    r2 = p2.runs[0]; r2.font.size = Pt(36); r2.font.bold = True
    r2.font.color.rgb = WHITE

    if subtitle:
        tb3 = _txb(sl, MARGIN, Inches(5.0), SAFE_W, Inches(1.0))
        tf3 = tb3.text_frame; tf3.word_wrap = True
        p3 = tf3.paragraphs[0]; p3.text = subtitle
        r3 = p3.runs[0]; r3.font.size = Pt(16)
        r3.font.color.rgb = PRI_LIGHT; r3.font.bold = False

    if notes:
        _notes(sl, notes)


def light_slide(prs, title: str, body_lines: list[str], notes: str = "",
                accent_line: str = "") -> None:
    """Diapositiva de contenido sobre fondo claro."""
    sl = blank_slide(prs)
    _set_bg(sl, SURFACE)

    # top bar
    bar = sl.shapes.add_shape(1, 0, 0, W, Inches(0.08))
    bar.fill.solid(); bar.fill.fore_color.rgb = PRIMARY
    bar.line.fill.background()

    # title
    tb = _txb(sl, MARGIN, Inches(0.35), SAFE_W, Inches(0.85))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = title
    r = p.runs[0]; r.font.size = Pt(28); r.font.bold = True
    r.font.color.rgb = HERO

    # divider
    div = sl.shapes.add_shape(1, MARGIN, Inches(1.25), Inches(1.5), Inches(0.04))
    div.fill.solid(); div.fill.fore_color.rgb = ACCENT
    div.line.fill.background()

    top_start = Inches(1.5)
    if accent_line:
        tb2 = _txb(sl, MARGIN, top_start, SAFE_W, Inches(0.7))
        tf2 = tb2.text_frame; tf2.word_wrap = True
        p2 = tf2.paragraphs[0]; p2.text = accent_line
        r2 = p2.runs[0]; r2.font.size = Pt(17); r2.font.bold = True
        r2.font.color.rgb = PRIMARY
        top_start = Inches(2.2)

    if body_lines:
        content = "\n".join(body_lines)
        tb3 = _txb(sl, MARGIN, top_start, SAFE_W, H - top_start - Inches(0.5))
        tf3 = tb3.text_frame; tf3.word_wrap = True
        tf3.text = content
        for para in tf3.paragraphs:
            para.space_before = Pt(4)
            for run in para.runs:
                run.font.size = Pt(16)
                run.font.color.rgb = TEXT

    if notes:
        _notes(sl, notes)


def stat_slide(prs, title: str, stats: list[tuple], notes: str = "") -> None:
    """Diapositiva de estadísticas con números grandes."""
    sl = blank_slide(prs)
    _set_bg(sl, HERO)

    bar = sl.shapes.add_shape(1, 0, 0, W, Inches(0.06))
    bar.fill.solid(); bar.fill.fore_color.rgb = ACCENT
    bar.line.fill.background()

    tb = _txb(sl, MARGIN, Inches(0.25), SAFE_W, Inches(0.75))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = title
    r = p.runs[0]; r.font.size = Pt(24); r.font.bold = True
    r.font.color.rgb = WHITE

    # stats layout: up to 4 side by side
    n = len(stats)
    cell_w = SAFE_W / n
    for i, (number, label, color) in enumerate(stats):
        x = MARGIN + i * cell_w
        # number
        tb_n = _txb(sl, x, Inches(1.4), cell_w, Inches(2.5))
        tf_n = tb_n.text_frame; tf_n.word_wrap = True
        p_n = tf_n.paragraphs[0]; p_n.text = number
        p_n.alignment = PP_ALIGN.CENTER
        r_n = p_n.runs[0]; r_n.font.size = Pt(60); r_n.font.bold = True
        r_n.font.color.rgb = color
        # label
        tb_l = _txb(sl, x, Inches(3.9), cell_w, Inches(1.8))
        tf_l = tb_l.text_frame; tf_l.word_wrap = True
        p_l = tf_l.paragraphs[0]; p_l.text = label
        p_l.alignment = PP_ALIGN.CENTER
        r_l = p_l.runs[0]; r_l.font.size = Pt(14); r_l.font.bold = False
        r_l.font.color.rgb = PRI_LIGHT

    if notes:
        _notes(sl, notes)


def quote_slide(prs, quote: str, author: str, notes: str = "") -> None:
    """Diapositiva de cita destacada."""
    sl = blank_slide(prs)
    _set_bg(sl, MID_BG)

    # big quote mark
    tb_q = _txb(sl, MARGIN, Inches(0.5), Inches(1.5), Inches(1.5))
    tf_q = tb_q.text_frame
    p_q = tf_q.paragraphs[0]; p_q.text = "\u201c"
    r_q = p_q.runs[0]; r_q.font.size = Pt(96); r_q.font.bold = True
    r_q.font.color.rgb = ACCENT

    tb = _txb(sl, MARGIN, Inches(1.5), SAFE_W, Inches(4.0))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = quote
    p.alignment = PP_ALIGN.LEFT
    r = p.runs[0]; r.font.size = Pt(22); r.font.bold = False
    r.font.color.rgb = WHITE; r.font.italic = True

    tb2 = _txb(sl, MARGIN, Inches(5.6), SAFE_W, Inches(0.6))
    tf2 = tb2.text_frame
    p2 = tf2.paragraphs[0]; p2.text = f"— {author}"
    p2.alignment = PP_ALIGN.RIGHT
    r2 = p2.runs[0]; r2.font.size = Pt(13); r2.font.bold = True
    r2.font.color.rgb = SECONDARY

    if notes:
        _notes(sl, notes)


def two_col_slide(prs, title: str, left_title: str, left_lines: list[str],
                  right_title: str, right_lines: list[str],
                  notes: str = "") -> None:
    """Dos columnas de contenido."""
    sl = blank_slide(prs)
    _set_bg(sl, SURFACE)

    bar = sl.shapes.add_shape(1, 0, 0, W, Inches(0.08))
    bar.fill.solid(); bar.fill.fore_color.rgb = PRIMARY
    bar.line.fill.background()

    tb = _txb(sl, MARGIN, Inches(0.3), SAFE_W, Inches(0.8))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = title
    r = p.runs[0]; r.font.size = Pt(26); r.font.bold = True
    r.font.color.rgb = HERO

    col_w = (SAFE_W - Inches(0.4)) / 2
    sep_x = MARGIN + col_w + Inches(0.2)
    sep = sl.shapes.add_shape(1, sep_x, Inches(1.3), Inches(0.02), Inches(5.8))
    sep.fill.solid(); sep.fill.fore_color.rgb = RGBColor(0xCB, 0xD1, 0xCD)
    sep.line.fill.background()

    for i, (t_title, lines, x) in enumerate([
        (left_title, left_lines, MARGIN),
        (right_title, right_lines, sep_x + Inches(0.22))
    ]):
        tb_h = _txb(sl, x, Inches(1.2), col_w, Inches(0.5))
        tf_h = tb_h.text_frame
        p_h = tf_h.paragraphs[0]; p_h.text = t_title
        r_h = p_h.runs[0]; r_h.font.size = Pt(14); r_h.font.bold = True
        r_h.font.color.rgb = PRIMARY

        acc = sl.shapes.add_shape(1, x, Inches(1.7), Inches(0.8), Inches(0.04))
        acc.fill.solid(); acc.fill.fore_color.rgb = ACCENT
        acc.line.fill.background()

        tb_b = _txb(sl, x, Inches(1.85), col_w, Inches(5.1))
        tf_b = tb_b.text_frame; tf_b.word_wrap = True
        tf_b.text = "\n".join(lines)
        for para in tf_b.paragraphs:
            para.space_before = Pt(5)
            for run in para.runs:
                run.font.size = Pt(14)
                run.font.color.rgb = TEXT

    if notes:
        _notes(sl, notes)


def dark_text_slide(prs, title: str, body: str, highlight: str = "",
                    notes: str = "") -> None:
    """Slide oscuro con texto grande y highlight opcional."""
    sl = blank_slide(prs)
    _set_bg(sl, HERO)

    bar = sl.shapes.add_shape(1, 0, 0, W, Inches(0.06))
    bar.fill.solid(); bar.fill.fore_color.rgb = ACCENT
    bar.line.fill.background()

    tb = _txb(sl, MARGIN, Inches(0.3), SAFE_W, Inches(0.8))
    tf = tb.text_frame; tf.word_wrap = True
    p = tf.paragraphs[0]; p.text = title
    r = p.runs[0]; r.font.size = Pt(24); r.font.bold = True
    r.font.color.rgb = PRI_LIGHT

    if highlight:
        tb_hl = _txb(sl, MARGIN, Inches(1.3), SAFE_W, Inches(1.5))
        tf_hl = tb_hl.text_frame; tf_hl.word_wrap = True
        p_hl = tf_hl.paragraphs[0]; p_hl.text = highlight
        r_hl = p_hl.runs[0]; r_hl.font.size = Pt(34); r_hl.font.bold = True
        r_hl.font.color.rgb = WHITE
        body_top = Inches(2.9)
    else:
        body_top = Inches(1.3)

    tb2 = _txb(sl, MARGIN, body_top, SAFE_W, H - body_top - Inches(0.4))
    tf2 = tb2.text_frame; tf2.word_wrap = True
    tf2.text = body
    for para in tf2.paragraphs:
        para.space_before = Pt(4)
        for run in para.runs:
            run.font.size = Pt(16)
            run.font.color.rgb = PRI_LIGHT

    if notes:
        _notes(sl, notes)
