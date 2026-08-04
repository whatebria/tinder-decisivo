"""Script maestro: genera las 4 presentaciones VotoAfin en PPTX."""
import os, sys

# Run from the presentaciones/ directory
os.chdir(os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(__file__))

from gen_ppt1 import build as b1
from gen_ppt2 import build as b2
from gen_ppt3 import build as b3
from gen_ppt4 import build as b4

FILES = [
    ("01_Problema_Investigacion_y_Contexto.pptx", b1),
    ("02_Evolucion_de_la_Idea.pptx", b2),
    ("03_Solucion_Diseno_y_Producto.pptx", b3),
    ("04_Ingenieria_Arquitectura_y_Resultados.pptx", b4),
]

if __name__ == "__main__":
    print("Generando presentaciones VotoAfin...\n")
    for filename, builder in FILES:
        try:
            builder(filename)
        except Exception as e:
            print(f"[ERROR] {filename}: {e}")
            raise
    print("\nListo. Archivos generados:")
    for filename, _ in FILES:
        path = os.path.abspath(filename)
        size = os.path.getsize(path) // 1024
        print(f"  {filename}  ({size} KB)")
