"""Data compartida para los seeds de candidatos ficticios (Diputados/Alcaldes).

Contiene:
- Nombres y apellidos chilenos comunes.
- Mapping partido -> posturas base (8 valores 1-5).
- Generador deterministico de candidatos por (semilla_int, partido).

La determinacion via `random.Random(seed)` garantiza que correr el seed dos
veces produzca los mismos nombres para el mismo distrito/comuna, lo que
mantiene el seed idempotente.
"""

import random

# --- Nombres chilenos comunes -----------------------------------------------
NOMBRES_M = [
    "Jose", "Juan", "Luis", "Miguel", "Carlos", "Pedro", "Manuel", "Francisco",
    "Jorge", "Andres", "Sebastian", "Ricardo", "Fernando", "Rodrigo", "Cristian",
    "Diego", "Nicolas", "Matias", "Felipe", "Gabriel", "Alejandro", "Daniel",
    "Rafael", "Roberto", "Mario", "Patricio", "Marcelo", "Gustavo", "Ignacio",
    "Vicente", "Camilo", "Tomas", "Benjamin", "Joaquin", "Emilio", "Ruben",
    "Oscar", "Alvaro", "Cristobal", "Renato", "Fabian", "Julio", "Victor",
    "Hugo", "Marcos", "Enrique", "Eduardo", "Claudio", "Sergio", "Rene",
]

NOMBRES_F = [
    "Maria", "Ana", "Carmen", "Isabel", "Rosa", "Francisca", "Camila", "Constanza",
    "Fernanda", "Valentina", "Antonia", "Javiera", "Catalina", "Sofia", "Martina",
    "Emilia", "Florencia", "Amanda", "Josefa", "Trinidad", "Renata", "Josefina",
    "Barbara", "Millaray", "Colomba", "Magdalena", "Ignacia", "Rocio", "Estefania",
    "Paula", "Loreto", "Andrea", "Veronica", "Patricia", "Marcela", "Ximena",
    "Alejandra", "Daniela", "Natalia", "Karina", "Karla", "Solange", "Yasna",
    "Denise", "Nicole", "Pamela", "Monica", "Roxana", "Beatriz", "Claudia",
]

APELLIDOS = [
    "Gonzalez", "Rodriguez", "Munoz", "Rojas", "Diaz", "Perez", "Soto", "Silva",
    "Contreras", "Lopez", "Morales", "Martinez", "Sanchez", "Reyes", "Vargas",
    "Alvarez", "Fuentes", "Espinoza", "Torres", "Castillo", "Gutierrez", "Fernandez",
    "Flores", "Ramirez", "Molina", "Nunez", "Guzman", "Bravo", "Vera", "Vega",
    "Pizarro", "Sepulveda", "Cortes", "Alvarado", "Ortiz", "Riquelme", "Vidal",
    "Herrera", "Salazar", "Godoy", "Cardenas", "Rios", "Sandoval", "Avila",
    "Poblete", "Toro", "Aravena", "Miranda", "Aguilera", "Escobar", "Cofre",
    "Palacios", "Concha", "Villalobos", "Zuniga", "Pena", "Retamal", "Salinas",
    "Andrade", "Leiva", "Cerda", "Mella", "Palma", "Farias", "Yanez", "Bahamondes",
    "Beltran", "Bustos", "Cifuentes", "Cornejo", "Donoso", "Farfan", "Guerrero",
    "Jerez", "Lagos", "Lobos", "Lucero", "Maldonado", "Meza", "Mora", "Moreno",
    "Nova", "Ojeda", "Ortega", "Osorio", "Paredes", "Pasten", "Pino", "Pinto",
    "Ponce", "Quezada", "Quintana", "Salgado", "Tapia", "Ugarte", "Valdes",
    "Valenzuela", "Valle", "Zamorano", "Zapata",
]

# --- Mapping partido -> posturas base ---------------------------------------
# Orden de posturas segun seed_preguntas_base:
# 1: Estado interviene economia  | 2: Impuestos progresivos
# 3: Aborto libre                | 4: Matrimonio igualitario
# 5: Mano dura                   | 6: Ambiente > crecimiento
# 7: Descentralizacion           | 8: Migracion restrictiva
POSTURAS_POR_PARTIDO = {
    # Izquierda
    "Partido Comunista":              [5, 5, 5, 5, 1, 5, 4, 1],
    "Frente Amplio":                  [5, 5, 5, 5, 2, 5, 4, 2],
    "Convergencia Social":            [5, 5, 5, 5, 2, 5, 4, 2],
    "Federacion Regionalista Verde":  [4, 4, 5, 5, 2, 5, 5, 2],
    # Centro-izquierda
    "Partido Socialista":             [4, 4, 5, 5, 2, 4, 3, 2],
    "PPD":                            [4, 4, 5, 5, 3, 4, 4, 3],
    "Partido Radical":                [4, 4, 4, 4, 3, 4, 4, 3],
    "Democracia Cristiana":           [4, 4, 2, 3, 3, 4, 4, 3],
    # Centro
    "Amarillos por Chile":            [3, 4, 3, 4, 4, 3, 4, 3],
    "Democratas":                     [3, 4, 3, 4, 4, 3, 4, 3],
    "Independiente":                  [3, 3, 3, 3, 3, 3, 3, 3],
    "Independiente Regional":         [3, 4, 3, 3, 3, 4, 5, 3],
    # Populista
    "Partido de la Gente":            [2, 3, 3, 4, 4, 2, 5, 5],
    # Centro-derecha
    "Evopoli":                        [2, 3, 3, 4, 4, 3, 4, 4],
    "Renovacion Nacional":            [2, 3, 3, 3, 4, 3, 3, 4],
    # Derecha
    "UDI":                            [1, 2, 2, 2, 5, 3, 2, 5],
    "Partido Republicano":            [1, 2, 1, 1, 5, 2, 3, 5],
    "Partido Nacional Libertario":    [1, 2, 2, 2, 5, 1, 3, 5],
}

# Distribucion tipica de un distrito parlamentario chileno.
# Cada tupla: (partido, peso). Se usan pesos como probabilidad relativa.
DISTRIBUCION_DIPUTADOS = [
    ("Partido Comunista", 1),
    ("Frente Amplio", 1),
    ("Partido Socialista", 1),
    ("PPD", 1),
    ("Democracia Cristiana", 1),
    ("Amarillos por Chile", 1),
    ("Independiente", 1),
    ("Partido de la Gente", 1),
    ("Evopoli", 1),
    ("Renovacion Nacional", 2),
    ("UDI", 2),
    ("Partido Republicano", 2),
    ("Partido Nacional Libertario", 1),
]

# Distribucion tipica de comunas para candidaturas a alcalde.
# Mas equilibrada, un poco menos polarizada que diputados.
DISTRIBUCION_ALCALDES = [
    ("Partido Comunista", 1),
    ("Frente Amplio", 1),
    ("Partido Socialista", 1),
    ("PPD", 1),
    ("Democracia Cristiana", 1),
    ("Independiente", 3),           # muchos alcaldes van como independientes
    ("Independiente Regional", 2),
    ("Renovacion Nacional", 2),
    ("UDI", 2),
    ("Partido Republicano", 1),
]


def generar_candidato(seed_int: int, indice: int, partido: str) -> dict:
    """Genera nombre/apellido/bio deterministicos para un candidato ficticio.

    seed_int: entero unico por territorio (ej. codigo comuna, numero distrito).
    indice:   posicion del candidato dentro del territorio (0..N).
    partido:  nombre del partido asignado.
    """
    rng = random.Random(seed_int * 1000 + indice)
    genero = rng.choice(["m", "f"])
    nombre = rng.choice(NOMBRES_M if genero == "m" else NOMBRES_F)
    apellido = rng.choice(APELLIDOS)
    apellido2 = rng.choice(APELLIDOS)
    return {
        "nombre": nombre,
        "apellido": f"{apellido} {apellido2}",
        "partido": partido,
        "posturas": POSTURAS_POR_PARTIDO[partido],
    }


def elegir_partidos(seed_int: int, cantidad: int, distribucion: list) -> list[str]:
    """Elige `cantidad` partidos para un territorio segun la distribucion.

    Deterministico via seed. Muestrea sin reemplazo por peso.
    """
    rng = random.Random(seed_int)
    partidos = [p for p, _ in distribucion]
    pesos = [w for _, w in distribucion]
    # random.choices con weights (con reemplazo) esta bien: en un distrito
    # puede haber 2 candidatos del mismo partido si es un partido grande.
    return rng.choices(partidos, weights=pesos, k=cantidad)
