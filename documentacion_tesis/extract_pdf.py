import fitz, os, sys

base = os.path.dirname(os.path.abspath(__file__))
bibliog = os.path.join(base, "Bibliografia")
out_dir = os.path.join(base, "pdf_pages")
os.makedirs(out_dir, exist_ok=True)

for pdf_name in ["Emprendimiento 1.pdf", "Emprendimiento 2.pdf"]:
    full_path = os.path.join(bibliog, pdf_name)
    print(f"Opening: {full_path}")
    doc = fitz.open(full_path)
    n = len(doc)
    print(f"  Pages: {n}")
    prefix = "emp1" if "1" in pdf_name else "emp2"
    for i in range(n):
        page = doc[i]
        pix = page.get_pixmap(dpi=150)
        fn = os.path.join(out_dir, f"{prefix}_p{i+1:02d}.png")
        pix.save(fn)
        print(f"  Saved {fn}")
    doc.close()

print("Done.")
files = sorted(os.listdir(out_dir))
print(f"Files in {out_dir}:")
for f in files:
    print(f"  {f}")
