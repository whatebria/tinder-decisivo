"""Matriz base de posturas por lista electoral (Parlamentaria Chile 2025).

Cada lista tiene un vector de 15 valores (1..5) correspondientes a las 15
preguntas de preguntas_diputados_2025.csv. Es la unidad basica de inferencia:
todos los candidatos de una lista heredan este vector como default.

Los OVERRIDES_POR_PARTIDO permiten ajustar preguntas puntuales donde un
partido componente diverge notoriamente del promedio de su lista.

Escala:
    1 = Muy en desacuerdo
    2 = En desacuerdo
    3 = Neutral / postura ambigua o dividida
    4 = De acuerdo
    5 = Muy de acuerdo

Preguntas (orden 1-15) de preguntas_diputados_2025.csv:
    1  Reforma tributaria: subir impuestos a empresas grandes
    2  Reforma previsional: mas capitalizacion individual (rechazar reparto)
    3  Aborto libre hasta 14 semanas
    4  Desmunicipalizacion total (SLEP)
    5  Prohibir mineria en glaciares
    6  Endurecer penas violentos (linea Ley Nain-Retamal)
    7  Mantener Estado de Excepcion Macrozona Sur
    8  Plurinacionalidad constitucional
    9  Endurecer control fronterizo migrantes irregulares
    10 Limitar reeleccion 2 periodos maximo
    11 Nuevo proceso constituyente
    12 Ampliar matrimonio igualitario con adopcion plena
    13 Reducir diputados de 155 a 120 (racionalizar gasto legislativo)
    14 Royalty al agua para agroexportacion en zonas de escasez
    15 Escanos reservados pueblos originarios en Camara de Diputados

Fuentes generales consultadas para armar los vectores:
    - Programas oficiales de los pactos 2025
    - Votaciones nominales Congreso 2022-2025 (camara.cl, senado.cl)
    - Declaraciones publicas conocidas de partidos madre
    - Historial de Convencion Constitucional 2021-2022 y Consejo 2023

Todas las posturas son INFERIDAS por afiliacion, no verificadas por
candidato individual. Ver README.md.
"""
from __future__ import annotations

# =============================================================================
# VECTOR BASE POR LISTA - DIPUTADOS 2025
# =============================================================================
# Cada tupla son los 15 valores en orden (preguntas 1-15). Comentarios
# explican la logica ideologica de la coalicion en cada eje.

VECTOR_BASE_POR_LISTA: dict[str, tuple[int, ...]] = {
    # -------------------------------------------------------------------------
    # A. Partido Ecologista Verde - Izquierda verde ambientalista humanista
    # -------------------------------------------------------------------------
    # Pro-impuestos altos, pro-reparto, pro-derechos sociales, anti-punitivismo,
    # bandera ambiental y plurinacional, pro-nueva constitucion.
    # 13-15: ambivalente reduccion escanos, pro-royalty agua, pro-escanos etnicos.
    "A. Partido Ecologista Verde": (5, 1, 5, 4, 5, 2, 2, 5, 2, 4, 5, 5, 3, 5, 5),

    # -------------------------------------------------------------------------
    # B. Verdes, Regionalistas y Humanistas - Centro-izq verde regionalista
    # -------------------------------------------------------------------------
    # FRVS + Accion Humanista. Similar a A pero mas moderado en tributaria,
    # y mas escepticos del centralismo SLEP por su enfoque regionalista.
    "B. Verdes, Regionalistas y Humanistas": (4, 1, 5, 3, 5, 2, 2, 5, 2, 5, 5, 5, 3, 4, 5),

    # -------------------------------------------------------------------------
    # C. Unidad por Chile - Coalicion oficialista amplia
    # -------------------------------------------------------------------------
    # FA + PC + PS + PPD + DC + Radical + Liberal. Promedio moderado que
    # refleja el gobierno. DC baja el promedio en temas valoricos.
    # 13: contra reducir escanos (oficialismo los usa); 14-15: pro-royalty y pro-etnicos.
    "C. Unidad por Chile": (5, 1, 4, 4, 4, 3, 3, 4, 3, 3, 4, 4, 2, 4, 4),

    # -------------------------------------------------------------------------
    # D. Izquierda Ecologista Popular Animalista y Humanista
    # -------------------------------------------------------------------------
    # Similar a A pero mas radical en anti-punitivismo y pro-migrante.
    "D. Izquierda Ecologista Popular Animalista y Humanista": (
        5, 1, 5, 4, 5, 1, 1, 5, 1, 5, 5, 5, 2, 5, 5,
    ),

    # -------------------------------------------------------------------------
    # E. Movimiento Amarillos por Chile - Centro liberal ex-Concertacion
    # -------------------------------------------------------------------------
    # Anti-extremos, pro-institucionalidad, moderados en casi todo excepto
    # anti-plurinacionalidad y anti-nuevo proceso constituyente.
    # 13: pro-reducir escanos (anti-casta politica).
    "E. Movimiento Amarillos por Chile": (3, 3, 3, 3, 3, 4, 4, 2, 4, 5, 2, 3, 4, 3, 3),

    # -------------------------------------------------------------------------
    # F. Partido de Trabajadores Revolucionarios - Extrema izquierda trotskista
    # -------------------------------------------------------------------------
    # Radical en todo, anti-Estado burgues pero pro-derechos sociales.
    "F. Partido de Trabajadores Revolucionarios": (
        5, 1, 5, 3, 5, 1, 1, 5, 1, 5, 5, 5, 2, 5, 5,
    ),

    # -------------------------------------------------------------------------
    # G. Partido Alianza Verde Popular - Verde con enfoque popular
    # -------------------------------------------------------------------------
    # Similar a A pero mas cercano al mundo popular, menos elitista.
    "G. Partido Alianza Verde Popular": (4, 1, 4, 3, 5, 2, 2, 4, 2, 4, 4, 4, 3, 5, 4),

    # -------------------------------------------------------------------------
    # H. Popular - Populismo social ambiguo
    # -------------------------------------------------------------------------
    # Pro-clases populares chilenas, ambivalente en temas valoricos,
    # pro-mano-dura tipico del populismo. Populismo -> pro reducir escanos.
    "H. Popular": (4, 2, 3, 3, 3, 4, 3, 3, 3, 4, 3, 3, 4, 3, 3),

    # -------------------------------------------------------------------------
    # I. Partido de la Gente - Populismo liberal-economico (Parisi)
    # -------------------------------------------------------------------------
    # Anti-establishment, pro-mercado, mano-dura, anti-migracion irregular.
    # 13: bandera reducir escanos (muy pro). 14-15: anti-royalty, anti-escanos etnicos.
    "I. Partido de la Gente": (1, 4, 3, 2, 2, 5, 4, 2, 5, 5, 2, 3, 5, 2, 2),

    # -------------------------------------------------------------------------
    # J. Chile Grande y Unido - Centro-derecha tradicional
    # -------------------------------------------------------------------------
    # RN + UDI + Evopoli + Democratas. Anti-tributaria, pro-seguridad,
    # anti-plurinacionalidad, anti-constituyente. Evopoli baja levemente el
    # promedio en temas valoricos (aborto/matrimonio).
    # 13: neutral (mantener escanos actuales sirve al bloque). 14-15: anti.
    "J. Chile Grande y Unido": (2, 4, 2, 2, 2, 5, 5, 1, 5, 3, 1, 2, 3, 2, 1),

    # -------------------------------------------------------------------------
    # K. Cambio por Chile - Derecha dura
    # -------------------------------------------------------------------------
    # Republicano + Social Cristiano + Nacional Libertario. Rechazo total a
    # agenda progresista, pro-mano-dura maxima, pro-mercado, anti-migrante.
    # 13: pro-reducir escanos (populismo anti-elite). 14-15: muy anti.
    "K. Cambio por Chile": (1, 5, 1, 1, 1, 5, 5, 1, 5, 4, 1, 1, 4, 1, 1),

    # -------------------------------------------------------------------------
    # Candidatura Independiente - Sin coalicion definida
    # -------------------------------------------------------------------------
    "Candidatura Independiente": (3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3),
}

# =============================================================================
# PROBABILIDAD DE OMISION POR PREGUNTA
# =============================================================================
# Simula el caso realista de "candidato no quiso opinar" sobre temas hot.
# Preguntas valoricas controversiales tienen mas ausencias que tecnicas.
# Se aplica de forma deterministica: hash(seed_candidato, pregunta_orden).

PROB_OMISION_POR_PREGUNTA: dict[int, float] = {
    1: 0.05,   # tributaria - tecnica
    2: 0.05,   # previsional - tecnica
    3: 0.18,   # aborto - VALORICA HOT
    4: 0.08,   # SLEP
    5: 0.10,   # glaciares
    6: 0.08,   # penas
    7: 0.10,   # estado excepcion
    8: 0.18,   # plurinacionalidad - VALORICA HOT
    9: 0.10,   # frontera
    10: 0.07,  # limitar reeleccion
    11: 0.12,  # nueva constitucion
    12: 0.18,  # matrimonio igualitario - VALORICA HOT
    13: 0.08,  # reducir escanos
    14: 0.10,  # royalty agua
    15: 0.18,  # escanos etnicos - VALORICA HOT
}

# Alias explicito para claridad post-agregar senadores
PROB_OMISION_DIPUTADOS = PROB_OMISION_POR_PREGUNTA

# =============================================================================
# VECTOR BASE POR LISTA - SENADORES 2025
# =============================================================================
# Preguntas de preguntas_senadores_2025.csv (orden 1-15):
#   1  Mantener bicameralismo (rechazar unicameral)
#   2  Endurecer nombramientos Fiscal Nacional / CS
#   3  Limitar reeleccion senadores/diputados a 2 periodos
#   4  Restaurar quorum 2/3 reformas constitucionales
#   5  Reducir senadores de 50 a 43
#   6  Retiro de Chile del TPP-11
#   7  Reconocer Estado de Palestina
#   8  Mantener Chile dentro del TIAR
#   9  Reforma previsional con mas reparto
#   10 Aumentar royalty minero sobre 4.7%
#   11 Fin de las isapres (seguro unico)
#   12 Eutanasia activa voluntaria
#   13 Zonas de sacrificio como areas de reparacion prioritaria
#   14 Modernizar Ley Antiterrorista (ampliar conductas)
#   15 Escanos reservados pueblos originarios en Senado

VECTOR_BASE_SENADORES_POR_LISTA: dict[str, tuple[int, ...]] = {
    # A. Ecologista Verde - Izq verde
    "A. Partido Ecologista Verde": (3, 5, 4, 2, 3, 5, 5, 1, 5, 5, 5, 5, 5, 1, 5),

    # B. Verdes, Regionalistas y Humanistas - Centro-izq verde
    "B. Verdes, Regionalistas y Humanistas": (3, 5, 5, 2, 3, 4, 5, 1, 4, 4, 4, 5, 5, 1, 5),

    # C. Unidad por Chile - Oficialismo (mantener bicameralismo y escanos, contra 2/3)
    "C. Unidad por Chile": (4, 4, 3, 2, 2, 3, 4, 2, 5, 4, 4, 4, 4, 2, 4),

    # D. Izq Ecologista Popular Animalista Humanista - Extrema izq
    "D. Izquierda Ecologista Popular Animalista y Humanista": (
        2, 5, 5, 1, 4, 5, 5, 1, 5, 5, 5, 5, 5, 1, 5,
    ),

    # E. Amarillos - Centro liberal pro-institucionalidad
    "E. Movimiento Amarillos por Chile": (5, 5, 5, 4, 4, 2, 3, 4, 3, 3, 2, 3, 3, 3, 3),

    # F. PTR - Extrema izq trotskista
    "F. Partido de Trabajadores Revolucionarios": (
        2, 3, 5, 1, 5, 5, 5, 1, 5, 5, 5, 5, 5, 1, 5,
    ),

    # G. Alianza Verde Popular - Verde popular
    "G. Partido Alianza Verde Popular": (3, 4, 4, 2, 3, 4, 4, 1, 4, 5, 4, 4, 5, 2, 4),

    # H. Popular - Populismo ambiguo mano-dura
    "H. Popular": (3, 4, 4, 3, 4, 3, 3, 3, 3, 3, 3, 3, 3, 4, 3),

    # I. Partido de la Gente - Populismo liberal-economico (Parisi)
    # Bandera reducir escanos (5), anti-progresista y anti-tratados progresistas.
    "I. Partido de la Gente": (3, 5, 5, 3, 5, 3, 3, 4, 2, 2, 2, 3, 2, 5, 2),

    # J. Chile Grande y Unido - Centro-derecha institucional
    # Pro-bicameralismo, pro-2/3, pro-mano-dura, anti-progresista.
    "J. Chile Grande y Unido": (5, 3, 3, 5, 2, 2, 2, 5, 2, 2, 2, 2, 2, 5, 1),

    # K. Cambio por Chile - Derecha dura
    # Anti-progresista total, pro-mano-dura maxima, pro-mercado, pro-reduccion.
    "K. Cambio por Chile": (5, 3, 4, 5, 4, 1, 1, 5, 1, 1, 1, 1, 1, 5, 1),

    # Candidatura Independiente - Sin coalicion
    "Candidatura Independiente": (3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3),
}

# Probabilidad de omision para senadores (preguntas 1-15 de su cuestionario).
PROB_OMISION_SENADORES: dict[int, float] = {
    1: 0.08,   # bicameralismo - institucional
    2: 0.05,   # nombramientos - tecnica
    3: 0.07,   # limitar reeleccion
    4: 0.10,   # quorum 2/3 - institucional media
    5: 0.08,   # reducir escanos
    6: 0.10,   # TPP-11
    7: 0.15,   # Palestina - internacional sensible
    8: 0.12,   # TIAR - internacional
    9: 0.05,   # previsional - tecnica
    10: 0.06,  # royalty - tecnica
    11: 0.18,  # fin isapres - VALORICA HOT
    12: 0.18,  # eutanasia - VALORICA HOT
    13: 0.10,  # zonas sacrificio
    14: 0.12,  # ley antiterrorista - sensible
    15: 0.18,  # escanos etnicos - VALORICA HOT
}

# =============================================================================
# OVERRIDES POR PARTIDO (dentro de la lista)
# =============================================================================
# Formato: (partido_lower_stripped, pregunta_1_to_15) -> valor_override
# Solo se aplican donde el partido diverge notoriamente del promedio de su
# lista. La clave del partido se normaliza a lowercase para matching robusto.

OVERRIDES_POR_PARTIDO: dict[tuple[str, int], int] = {
    # -------- Dentro de Lista C (Unidad por Chile) --------
    # DC es mas conservadora que el promedio de la coalicion en temas valoricos.
    ("democrata cristiano", 3): 2,        # aborto: baja de 4 a 2
    ("democrata cristiano", 8): 3,        # plurinacionalidad: baja de 4 a 3
    ("democrata cristiano", 12): 3,       # matrimonio: baja de 4 a 3
    ("independiente democrata cristiano", 3): 2,
    ("independiente democrata cristiano", 8): 3,
    ("independiente democrata cristiano", 12): 3,

    # Comunista de Chile: mas radical anti-punitivismo, mas pro-plurinacional.
    ("comunista de chile", 6): 2,         # penas duras: baja de 3 a 2
    ("comunista de chile", 7): 2,         # estado excepcion: baja de 3 a 2
    ("independiente comunista de chile", 6): 2,
    ("independiente comunista de chile", 7): 2,

    # Frente Amplio: mas pro-nueva constitucion y anti-punitivismo que promedio C.
    ("frente amplio", 6): 2,
    ("frente amplio", 11): 5,
    ("independiente frente amplio", 6): 2,
    ("independiente frente amplio", 11): 5,

    # -------- Dentro de Lista J (Chile Grande y Unido) --------
    # Evopoli es mas liberal en temas valoricos que UDI/RN.
    ("evolucion politica", 3): 4,         # aborto: sube de 2 a 4
    ("evolucion politica", 12): 4,        # matrimonio: sube de 2 a 4
    ("independiente evolucion politica", 3): 4,
    ("independiente evolucion politica", 12): 4,

    # UDI: mas conservadora dura, refuerza el vector J en direccion K.
    ("union democrata independiente", 3): 1,
    ("union democrata independiente", 12): 1,
    ("independiente union democrata independiente", 3): 1,
    ("independiente union democrata independiente", 12): 1,

    # -------- Dentro de Lista K (Cambio por Chile) --------
    # Nacional Libertario mas anti-elite, mas pro-reeleccion limitada.
    ("nacional libertario", 10): 5,       # limitar reeleccion: sube de 4 a 5
    ("independiente nacional libertario", 10): 5,
}

# Alias explicito
OVERRIDES_DIPUTADOS = OVERRIDES_POR_PARTIDO

# =============================================================================
# OVERRIDES POR PARTIDO - SENADORES 2025
# =============================================================================
# Formato: (partido_lower_stripped, pregunta_1_to_15) -> valor_override
# Preguntas de senadores (1-15) definidas en preguntas_senadores_2025.csv.

OVERRIDES_SENADORES: dict[tuple[str, int], int] = {
    # -------- Dentro de Lista C (Unidad por Chile) --------
    # DC mas conservadora en temas valoricos y pro-mercado en salud.
    ("democrata cristiano", 11): 3,       # fin isapres: baja de 4 a 3
    ("democrata cristiano", 12): 2,       # eutanasia: baja de 4 a 2
    ("democrata cristiano", 15): 3,       # escanos etnicos: baja de 4 a 3
    ("independiente democrata cristiano", 11): 3,
    ("independiente democrata cristiano", 12): 2,
    ("independiente democrata cristiano", 15): 3,

    # PC: mas radical anti-punitivista.
    ("comunista de chile", 14): 1,        # antiterrorista: baja de 2 a 1
    ("independiente comunista de chile", 14): 1,

    # FA: contra 2/3 (bandera anti-veto), pro-nuevo proceso institucional.
    ("frente amplio", 4): 1,              # quorum 2/3: baja de 2 a 1
    ("independiente frente amplio", 4): 1,

    # -------- Dentro de Lista J (Chile Grande y Unido) --------
    # Evopoli mas liberal en valoricos.
    ("evolucion politica", 12): 4,        # eutanasia: sube de 2 a 4
    ("evolucion politica", 15): 3,        # escanos etnicos: sube de 1 a 3
    ("independiente evolucion politica", 12): 4,
    ("independiente evolucion politica", 15): 3,

    # UDI mas conservadora dura.
    ("union democrata independiente", 11): 1,   # fin isapres: baja de 2 a 1
    ("union democrata independiente", 12): 1,   # eutanasia: baja de 2 a 1
    ("independiente union democrata independiente", 11): 1,
    ("independiente union democrata independiente", 12): 1,
}


# =============================================================================
# FUENTES URL POR LISTA
# =============================================================================
# URL publica navegable de la coalicion / partido componente principal.
# Se usa como fuente_url para todas las posturas de esa lista.

FUENTES_URL_POR_LISTA: dict[str, str] = {
    "A. Partido Ecologista Verde": "https://es.wikipedia.org/wiki/Partido_Ecologista_Verde_(Chile)",
    "B. Verdes, Regionalistas y Humanistas": "https://es.wikipedia.org/wiki/Federaci%C3%B3n_Regionalista_Verde_Social",
    "C. Unidad por Chile": "https://es.wikipedia.org/wiki/Unidad_por_Chile",
    "D. Izquierda Ecologista Popular Animalista y Humanista": "https://es.wikipedia.org/wiki/Partido_Humanista_(Chile)",
    "E. Movimiento Amarillos por Chile": "https://amarillos.cl/",
    "F. Partido de Trabajadores Revolucionarios": "https://es.wikipedia.org/wiki/Partido_de_Trabajadores_Revolucionarios_(Chile)",
    "G. Partido Alianza Verde Popular": "https://es.wikipedia.org/wiki/Partido_Comunes",
    "H. Popular": "https://es.wikipedia.org/wiki/Partido_Popular_(Chile)",
    "I. Partido de la Gente": "https://es.wikipedia.org/wiki/Partido_de_la_Gente_(Chile)",
    "J. Chile Grande y Unido": "https://es.wikipedia.org/wiki/Chile_Vamos",
    "K. Cambio por Chile": "https://es.wikipedia.org/wiki/Partido_Republicano_de_Chile",
    "Candidatura Independiente": "https://www.servel.cl/",
}

# =============================================================================
# VECTOR POR CANDIDATO - PRESIDENCIAL 2025
# =============================================================================
# A diferencia de diputados/senadores (vector por lista), los 8 candidatos
# presidenciales son individuos publicamente identificables con perfil propio.
# La matriz es por APELLIDO NORMALIZADO (lowercase, sin acentos, primer token
# del apellido). Cada tupla son los 15 valores para las 15 preguntas de
# preguntas_presidencial_2025.csv.
#
# Preguntas (orden 1-15):
#   1  Reforma tributaria empresas grandes
#   2  Previsional con mas capitalizacion individual
#   3  Aumentar royalty minero cobre
#   4  Jornada 40 horas sin reduccion salarial
#   5  Copago cero universal Fonasa
#   6  Gratuidad universal educacion superior
#   7  Cierre termoelectricas carbon 2030
#   8  Prohibir salmoneras en Areas Marinas Protegidas
#   9  FFAA permanentes frontera norte
#   10 Carceles maxima seguridad narcos
#   11 Nuevo proceso constituyente
#   12 Retiro Chile del TPP-11
#   13 Reconocer Estado de Palestina
#   14 Eliminar Senado (unicameralismo)
#   15 Aborto libre 14 semanas (proyecto presidencial)
#   16 PUEBLOS_ORIGINARIOS: Restitucion tierras mapuche via CONADI
#   17 DISCAPACIDAD: Pension invalidez universal no contributiva

VECTOR_PRESIDENCIAL_POR_CANDIDATO: dict[str, tuple[int, ...]] = {
    # Kast (Republicano) - derecha dura. Bandera: seguridad y anti-progresismo.
    "kast":              (1, 5, 1, 2, 1, 1, 1, 2, 5, 5, 1, 1, 1, 1, 1, 1, 2),
    # Jara (PC, oficialismo) - izquierda. Autora Ley 40 horas y reforma previsional.
    "jara":              (5, 1, 5, 5, 5, 5, 4, 5, 3, 4, 3, 4, 5, 3, 5, 4, 5),
    # Matthei (UDI) - centro-derecha tradicional, pragmatica tecnocratica.
    "matthei":           (2, 5, 2, 3, 2, 1, 2, 2, 5, 5, 1, 1, 2, 1, 1, 2, 2),
    # Parisi (PDG) - populismo economico-liberal anti-elite.
    "parisi":            (2, 4, 3, 3, 3, 3, 2, 2, 5, 5, 2, 2, 3, 4, 3, 2, 4),
    # Kaiser (Nacional Libertario) - extrema derecha libertaria.
    "kaiser":            (1, 5, 1, 1, 1, 1, 1, 1, 5, 5, 1, 1, 1, 1, 1, 1, 1),
    # Mayne-Nicholls (Amarillos / Independiente) - centro tecnocratico.
    "mayne-nicholls":    (3, 3, 3, 3, 3, 2, 3, 3, 4, 4, 2, 2, 3, 2, 3, 3, 4),
    # Enriquez-Ominami (PRO) - centro-izq progresista. Bandera nueva Constitucion.
    "enriquez-ominami":  (4, 2, 4, 4, 4, 4, 4, 4, 2, 3, 5, 4, 5, 4, 5, 5, 5),
    # Artes (UP) - extrema izquierda marxista, anti-imperialista.
    "artes":             (5, 1, 5, 5, 5, 5, 5, 5, 1, 2, 5, 5, 5, 5, 5, 5, 5),
}

# Probabilidad de omision para presidenciales.
# Los presidenciales se pronuncian mas que parlamentarios (menos omisiones),
# pero temas hot (aborto, Palestina, unicameral) siguen teniendo algo de omision.
PROB_OMISION_PRESIDENCIAL: dict[int, float] = {
    1: 0.03,   # tributaria
    2: 0.03,   # previsional
    3: 0.05,   # royalty
    4: 0.03,   # 40 horas (ya es ley)
    5: 0.05,   # copago cero
    6: 0.05,   # gratuidad
    7: 0.06,   # termoelectricas
    8: 0.08,   # salmoneras
    9: 0.05,   # FFAA frontera
    10: 0.03,  # carceles
    11: 0.08,  # nuevo constituyente
    12: 0.10,  # TPP-11
    13: 0.12,  # Palestina (sensible)
    14: 0.10,  # eliminar Senado
    15: 0.12,  # aborto 14 sem
    16: 0.10,  # restitucion tierras mapuche (sensible)
    17: 0.06,  # pension invalidez (poco controversial)
}

# URL fuente por candidato. Wikipedia o sitio de campana si existe.
FUENTES_URL_POR_CANDIDATO_PRES: dict[str, str] = {
    "kast":              "https://es.wikipedia.org/wiki/Jos%C3%A9_Antonio_Kast",
    "jara":              "https://es.wikipedia.org/wiki/Jeannette_Jara",
    "matthei":           "https://es.wikipedia.org/wiki/Evelyn_Matthei",
    "parisi":            "https://es.wikipedia.org/wiki/Franco_Parisi",
    "kaiser":            "https://es.wikipedia.org/wiki/Johannes_Kaiser",
    "mayne-nicholls":    "https://es.wikipedia.org/wiki/Harold_Mayne-Nicholls",
    "enriquez-ominami":  "https://es.wikipedia.org/wiki/Marco_Enr%C3%ADquez-Ominami",
    "artes":             "https://es.wikipedia.org/wiki/Eduardo_Art%C3%A9s",
}
