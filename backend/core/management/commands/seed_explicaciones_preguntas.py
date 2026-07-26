"""
Puebla los campos `explicacion` y `repercusiones` de las 12 preguntas seed.

Textos EDUCATIVOS y NEUTROS (no partidistas): describen que esta en juego
y como distintas politicas publicas afectan cada dimension. NO recomiendan
una postura.

DISCLAIMER: los textos son borrador de referencia. Antes de ir a produccion,
revisar con especialistas en politica publica y ciencia politica chilenas.

Uso:
    python manage.py seed_explicaciones_preguntas
    python manage.py seed_explicaciones_preguntas --dry-run
"""
from __future__ import annotations

from django.core.management.base import BaseCommand
from django.db import transaction

from core.models import Pregunta

DIMENSIONES = ("economico", "social", "cultural", "ambiental", "institucional")

# Data: dict indexado por `orden` de la pregunta.
# Cada entrada tiene "explicacion" + "repercusiones" (con las 5 dims).
DATA: dict[int, dict] = {
    1: {  # Ingreso minimo universal
        "explicacion": (
            "Un Ingreso Minimo Universal (IMU) es una transferencia monetaria que el Estado "
            "entregaria de forma regular a todas las personas, sin condiciones de trabajo ni "
            "ingreso. Existen versiones parciales (solo adultos, solo bajo cierto umbral)."
        ),
        "repercusiones": {
            "economico": (
                "Requiere aumentar el gasto publico (financiado via impuestos, deuda o "
                "reasignacion). Puede reducir la oferta de trabajo poco calificado, aunque "
                "estudios pilotos internacionales muestran efectos modestos."
            ),
            "social": (
                "Reduce pobreza extrema y da colchon a personas con trabajos intermitentes. "
                "Criticos argumentan que fomenta dependencia; defensores dicen que libera "
                "para emprender, estudiar o cuidar familia."
            ),
            "cultural": (
                "Cuestiona la idea de que el ingreso deba estar ligado al empleo formal. "
                "Puede transformar el valor social del trabajo y la relacion Estado-ciudadano."
            ),
            "ambiental": (
                "Efecto indirecto. Personas con ingreso basico podrian consumir mas, "
                "aumentando huella de carbono; o menos, si reducen trabajos precarios "
                "vinculados a industrias extractivas."
            ),
            "institucional": (
                "Implica reformas tributarias y un aparato administrativo permanente. "
                "Necesita blindaje contra vaivenes politicos para ser predecible."
            ),
        },
    },
    2: {  # Reducir impuestos empresas
        "explicacion": (
            "Chile grava a las empresas via impuesto a la renta corporativa (actualmente ~27%). "
            "La pregunta es si bajar ese porcentaje incentivaria mas inversion privada y empleo, "
            "o si reduciria recaudacion sin beneficios claros."
        ),
        "repercusiones": {
            "economico": (
                "Reduce recaudacion fiscal (menos ingresos para gasto publico). Puede atraer "
                "inversion extranjera y estimular expansion de empresas locales. Evidencia "
                "internacional es mixta: no siempre se traduce en mas empleo."
            ),
            "social": (
                "Menos recaudacion puede significar menos gasto en salud, educacion o "
                "pensiones. Si genera empleo, mejora ingresos de trabajadores. El efecto neto "
                "depende de en que se gasta lo que se recauda."
            ),
            "cultural": (
                "Refuerza vision pro-mercado del rol del Estado. Puede tensionar con demandas "
                "ciudadanas de mayor gasto social post-estallido 2019."
            ),
            "ambiental": (
                "Sin regulacion adicional, mayor inversion puede acelerar extraccion de "
                "recursos naturales. Si se acompana de impuestos verdes, puede orientar "
                "inversion hacia sectores mas limpios."
            ),
            "institucional": (
                "Requiere reforma tributaria via Congreso. Cambios frecuentes generan "
                "incertidumbre para empresas. Estabilidad tributaria es un debate en si mismo."
            ),
        },
    },
    3: {  # Educacion superior gratuita
        "explicacion": (
            "Actualmente Chile tiene gratuidad universitaria focalizada en los 6 primeros "
            "deciles de ingreso. La pregunta es si extender la gratuidad a todos los "
            "estudiantes, incluidos los de mayores ingresos."
        ),
        "repercusiones": {
            "economico": (
                "Aumenta el gasto publico significativamente. Argumentos a favor: retorno de "
                "largo plazo via mayor productividad y recaudacion. Argumentos en contra: "
                "subsidia a quienes pueden pagar, dinero mejor usado en primera infancia."
            ),
            "social": (
                "Elimina barrera de entrada para clase media. Puede reducir endeudamiento "
                "juvenil (CAE). No garantiza que las universidades absorban la demanda o "
                "que mejore calidad."
            ),
            "cultural": (
                "Refuerza la vision de la educacion como derecho social versus servicio. "
                "Puede aumentar prestigio de universidades publicas versus privadas."
            ),
            "ambiental": (
                "Impacto indirecto: mas profesionales pueden acelerar innovacion en energias "
                "limpias y sostenibilidad, si hay orientacion vocacional en esa direccion."
            ),
            "institucional": (
                "Requiere ley aprobada por Congreso y presupuesto anual. Historicamente ha "
                "generado tension entre Ministerio de Hacienda y Ministerio de Educacion."
            ),
        },
    },
    4: {  # Aborto libre hasta 14 semanas
        "explicacion": (
            "Chile despenalizo el aborto en 3 causales (2017): riesgo vital, inviabilidad "
            "fetal, violacion. La pregunta es si extender a aborto libre (sin causal requerida) "
            "hasta las 14 semanas de gestacion, similar a Argentina, Espana o Uruguay."
        ),
        "repercusiones": {
            "economico": (
                "Impacto menor. Puede reducir gasto en atencion de complicaciones por "
                "abortos clandestinos. Requiere capacitacion de personal medico."
            ),
            "social": (
                "Reduce muertes por abortos clandestinos, especialmente en sectores pobres. "
                "Criticos argumentan valor de vida en gestacion; defensores destacan autonomia "
                "reproductiva y salud publica."
            ),
            "cultural": (
                "Toca valores religiosos (Chile mayoritariamente catolico/evangelico), roles "
                "de genero y concepcion de familia. Uno de los debates mas polarizados."
            ),
            "ambiental": (
                "No aplica directamente. Debate sobre planificacion familiar puede tener "
                "efectos demograficos de largo plazo."
            ),
            "institucional": (
                "Requiere ley aprobada por Congreso. Puede enfrentar recursos ante el "
                "Tribunal Constitucional. Implementacion involucra objecion de conciencia "
                "medica."
            ),
        },
    },
    5: {  # Cerrar termoelectricas carbon 2030
        "explicacion": (
            "Chile tiene 21 centrales termoelectricas a carbon que generan ~19% de la "
            "electricidad. El calendario oficial de retiro es 2040. La pregunta es si "
            "adelantar el cierre total a 2030, forzando transicion mas rapida."
        ),
        "repercusiones": {
            "economico": (
                "Costos altos de corto plazo (subsidios de transicion, reemplazo con energias "
                "renovables + almacenamiento). Genera empleo en sector renovable. Riesgo de "
                "alza tarifaria si no hay suficiente capacidad instalada."
            ),
            "social": (
                "Reduce contaminacion en 'zonas de sacrificio' (Quintero, Puchuncavi, "
                "Huasco, Tocopilla, Mejillones) donde viven ~50.000 personas afectadas. "
                "Desafio: reconversion laboral de trabajadores del carbon."
            ),
            "cultural": (
                "Consolida identidad de Chile como pionero regional en renovables (ya lider "
                "en solar). Puede reducir cultura industrial de zonas historicamente "
                "vinculadas al carbon."
            ),
            "ambiental": (
                "Es el eje central. Reduce emisiones de CO2 (Chile es responsable del 0.3% "
                "global), material particulado fino (PM2.5) y contaminacion de aguas locales. "
                "Aporta a compromisos climaticos Paris/COP."
            ),
            "institucional": (
                "Requiere ley o acuerdos vinculantes con generadoras. Ya existe hoja de ruta "
                "voluntaria hasta 2040. Acelerarla requiere consenso politico y financiero."
            ),
        },
    },
    6: {  # Mineria en glaciares con regulacion
        "explicacion": (
            "Chile es el mayor productor mundial de cobre y tiene glaciares clave para "
            "reserva de agua dulce (Andes). Actualmente no hay ley que proteja explicitamente "
            "los glaciares. La pregunta es si permitir mineria en zonas glaciares bajo "
            "regulacion estricta."
        ),
        "repercusiones": {
            "economico": (
                "Mineria del cobre es ~10% del PIB. Permitir extraccion en glaciares puede "
                "aumentar produccion. Costo: proyectos con historia de conflictos judiciales "
                "prolongados (Pascua Lama, Los Bronces)."
            ),
            "social": (
                "Comunidades andinas dependen del agua de glaciares para consumo y "
                "agricultura. Impacto directo en pueblos originarios y localidades rurales."
            ),
            "cultural": (
                "Glaciares tienen valor simbolico y espiritual para comunidades andinas. "
                "Debate sobre modelo de desarrollo: Chile minero versus Chile sostenible."
            ),
            "ambiental": (
                "Los glaciares almacenan y regulan agua dulce. Su intervencion acelera "
                "derretimiento (ya en retroceso por cambio climatico), afectando cuencas "
                "y ecosistemas de alta montana de forma irreversible."
            ),
            "institucional": (
                "Ley de Proteccion de Glaciares esta en tramite legislativo desde 2018 sin "
                "acuerdo. Depende de definiciones tecnicas (que cuenta como glaciar, buffer)."
            ),
        },
    },
    7: {  # Militar Araucania
        "explicacion": (
            "La 'Macrozona Sur' (Araucania, Bio Bio, Los Rios) vive conflicto ligado a "
            "reivindicaciones territoriales mapuche y grupos armados. Desde 2021 hay Estado "
            "de Excepcion Constitucional con militares en carreteras. La pregunta es si "
            "aumentar esa presencia."
        ),
        "repercusiones": {
            "economico": (
                "Mayor seguridad puede proteger inversion forestal y transporte. Costo: "
                "presupuesto militar aumenta, y conflicto prolongado desincentiva inversion "
                "productiva y turismo en la zona."
            ),
            "social": (
                "Reduce ataques y quemas segun cifras oficiales, pero aumenta tension con "
                "comunidades mapuche no involucradas. Riesgo de violencia policial/militar "
                "sobre poblacion civil."
            ),
            "cultural": (
                "Militarizacion tensiona relacion Estado-pueblo mapuche. Historicamente "
                "asociada a Pacificacion de la Araucania (siglo XIX), cargada simbolicamente."
            ),
            "ambiental": (
                "Efecto indirecto: presencia militar puede reducir quemas de bosques y "
                "faenas forestales, pero no aborda causas de fondo (uso de suelo, plantaciones "
                "de pino/eucalipto)."
            ),
            "institucional": (
                "Estado de Excepcion requiere renovacion cada 15 dias por decreto y validacion "
                "del Congreso. Uso prolongado erosiona el concepto de excepcionalidad."
            ),
        },
    },
    8: {  # Penas mas duras robo con violencia
        "explicacion": (
            "El robo con violencia o intimidacion tiene penas de 5 a 20 anos en Chile "
            "(Codigo Penal). El debate es si aumentar penas minimas, reducir beneficios "
            "penitenciarios o endurecer regimen de cumplimiento."
        ),
        "repercusiones": {
            "economico": (
                "Requiere ampliar sistema penitenciario (Chile tiene sobrepoblacion carcelaria "
                "cronica). Costo por interno es alto. Efecto en actividad economica depende "
                "de si reduce delitos que afectan comercio."
            ),
            "social": (
                "Percepcion de seguridad puede mejorar. Evidencia criminologica es debatida: "
                "penas altas no siempre reducen delincuencia si no hay certeza de captura. "
                "Reinsercion post-carcel es factor clave y hoy debil."
            ),
            "cultural": (
                "Fortalece vision punitivista. Puede afectar percepcion de justicia como "
                "sancion versus como reparacion. Tension con enfoque de rehabilitacion."
            ),
            "ambiental": (
                "No aplica directamente."
            ),
            "institucional": (
                "Requiere reforma al Codigo Penal via Congreso. Puede saturar tribunales y "
                "Gendarmeria. Coordinacion con Ministerio Publico y Poder Judicial es critica."
            ),
        },
    },
    9: {  # Reconocimiento constitucional pueblos originarios
        "explicacion": (
            "Chile es el unico pais de America Latina cuya Constitucion no reconoce "
            "explicitamente a los pueblos originarios (10% de la poblacion). La pregunta "
            "es si incluir ese reconocimiento (que puede ser simbolico, con derechos "
            "colectivos, o pluralista con autonomias)."
        ),
        "repercusiones": {
            "economico": (
                "Impacto directo bajo. Puede generar litigios en concesiones mineras, "
                "forestales o de agua sobre territorios ancestrales. A largo plazo puede "
                "requerir compensaciones o mecanismos de consulta vinculante."
            ),
            "social": (
                "Puede reducir brechas historicas de pobreza y acceso a servicios en "
                "comunidades indigenas. Reconocimiento simbolico versus derechos "
                "efectivos hace diferencia sustancial."
            ),
            "cultural": (
                "Impacto profundo. Reconoce diversidad cultural chilena, protege lenguas "
                "y tradiciones. Puede transformar la narrativa oficial de identidad nacional."
            ),
            "ambiental": (
                "Derechos territoriales de pueblos originarios historicamente se asocian con "
                "practicas de menor impacto ambiental. Puede fortalecer proteccion de "
                "ecosistemas ancestrales."
            ),
            "institucional": (
                "Requiere reforma constitucional (2/3 del Congreso). Puede implicar creacion "
                "de escanos reservados, autonomias territoriales o consulta previa vinculante "
                "(Convenio 169 OIT)."
            ),
        },
    },
    10: {  # Migrantes procedimientos regularizados
        "explicacion": (
            "Chile ha recibido ~1.5 millones de migrantes en la ultima decada (venezolanos, "
            "haitianos, colombianos, peruanos). Ley de Migracion 2021 endurecio requisitos. "
            "La pregunta es si privilegiar regularizacion via procedimientos administrativos "
            "versus expulsiones o entrada bloqueada."
        ),
        "repercusiones": {
            "economico": (
                "Regularizacion permite tributar y acceder a empleo formal (mayor recaudacion, "
                "menor informalidad). Expulsion tiene costos operativos altos. Impacto en "
                "mercado laboral local depende del tamano y sector."
            ),
            "social": (
                "Regularizacion facilita acceso a salud, educacion y vivienda para migrantes. "
                "Puede reducir explotacion laboral. Tension con percepcion de saturacion de "
                "servicios publicos en algunas zonas."
            ),
            "cultural": (
                "Cambia composicion cultural de Chile (historicamente pais con baja migracion "
                "extranjera). Puede enriquecer diversidad o generar friccion, segun politicas "
                "de integracion."
            ),
            "ambiental": (
                "Impacto indirecto en presion sobre servicios urbanos (agua, transporte, "
                "residuos) en zonas de alta concentracion migrante."
            ),
            "institucional": (
                "Requiere capacidad administrativa (Servicio Nacional de Migraciones). "
                "Coordinacion con Chile y paises de origen. Tratados internacionales "
                "(Refugiados 1951, Nueva York 2016) fijan minimos."
            ),
        },
    },
    11: {  # Salir Alianza del Pacifico
        "explicacion": (
            "La Alianza del Pacifico es un bloque de integracion economica entre Chile, "
            "Peru, Colombia y Mexico (2011). Elimina aranceles y facilita movilidad. "
            "La pregunta es si Chile debe retirarse de este acuerdo."
        ),
        "repercusiones": {
            "economico": (
                "Salir implica volver a aranceles con esos 3 paises (representan ~15% del "
                "comercio chileno). Puede afectar exportaciones agroindustriales y de "
                "servicios. Chile tiene TLCs bilaterales que suavizarian el impacto."
            ),
            "social": (
                "Afecta movilidad estudiantil y laboral (visa AP simplificada). Impacto "
                "en empleo depende de si empresas relocalizan produccion."
            ),
            "cultural": (
                "AP facilita intercambio cultural via becas, ferias y programas artisticos. "
                "Salir reduce esas plataformas."
            ),
            "ambiental": (
                "AP tiene compromisos de sostenibilidad y bonos verdes. Salir podria "
                "debilitar coordinacion regional en cambio climatico."
            ),
            "institucional": (
                "Requiere decision del Ejecutivo con validacion del Congreso. Puede alterar "
                "posicion de Chile en foros regionales (OEA, CELAC, APEC)."
            ),
        },
    },
    12: {  # Nueva Constitucion
        "explicacion": (
            "Chile realizo dos procesos constituyentes recientes (Convencion 2022: rechazada "
            "62-38; Consejo Constitucional 2023: rechazada 55-44). La actual Constitucion es "
            "de 1980, reformada multiples veces. La pregunta es si insistir con un nuevo "
            "proceso constituyente."
        ),
        "repercusiones": {
            "economico": (
                "Incertidumbre constitucional puede afectar inversion. Constitucion nueva "
                "puede consagrar (o eliminar) derechos economicos (huelga, negociacion "
                "ramal, propiedad del agua) con impacto en sectores productivos."
            ),
            "social": (
                "Puede consagrar derechos sociales (salud, pensiones, vivienda) al nivel "
                "constitucional versus dejarlos a ley. Debate sobre 'Estado social de "
                "derecho' versus principio de subsidiariedad."
            ),
            "cultural": (
                "Un proceso constituyente moviliza debate publico masivo. Puede fortalecer "
                "identidad democratica o desgastarla si fracasa reiteradamente."
            ),
            "ambiental": (
                "Puede consagrar derecho a medio ambiente sano, proteccion de glaciares, "
                "estatus de la naturaleza. Definiciones sobre propiedad del agua son "
                "especialmente relevantes."
            ),
            "institucional": (
                "Requiere ley de convocatoria a plebiscito, disenio del organo constituyente, "
                "quorum de aprobacion. Dos rechazos consecutivos generan escepticismo sobre "
                "un tercer intento."
            ),
        },
    },
}


class Command(BaseCommand):
    help = "Puebla explicacion + repercusiones de las 12 preguntas seed."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    @transaction.atomic
    def handle(self, *args, **opts):
        dry = opts["dry_run"]
        actualizadas = 0
        no_encontradas = []
        for orden, contenido in DATA.items():
            preguntas = Pregunta.objects.filter(orden=orden)
            if not preguntas.exists():
                no_encontradas.append(orden)
                continue
            # Puede haber la misma pregunta en varios tipos_eleccion; actualizamos todas
            for p in preguntas:
                # Valida que las 5 dimensiones esten presentes
                faltantes = set(DIMENSIONES) - set(contenido["repercusiones"].keys())
                if faltantes:
                    self.stdout.write(self.style.ERROR(
                        f"Pregunta orden={orden}: faltan dimensiones {faltantes}"
                    ))
                    continue
                p.explicacion = contenido["explicacion"]
                p.repercusiones = contenido["repercusiones"]
                if not dry:
                    p.save(update_fields=["explicacion", "repercusiones"])
                actualizadas += 1

        if no_encontradas:
            self.stdout.write(self.style.WARNING(
                f"Preguntas no encontradas (orden): {no_encontradas}"
            ))

        self.stdout.write(self.style.SUCCESS(f"Actualizadas: {actualizadas} preguntas"))
        if dry:
            self.stdout.write(self.style.WARNING("Dry-run: no se guardo nada."))
