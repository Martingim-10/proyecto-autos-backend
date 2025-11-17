import pdfplumber, json, re
from collections import defaultdict

PDF = "Autos.pdf"
OUT1 = "autos_full.json"
OUT2 = "autos_full_years.json"

def normalize(s):
    return re.sub(r"\s+", " ", (s or "")).strip()

def main():
    autos = defaultdict(lambda: defaultdict(list))
    autos_years = defaultdict(lambda: defaultdict(lambda: defaultdict(set)))
    current_brand = None
    current_model = None

    with pdfplumber.open(PDF) as pdf:
        print(f"[INFO] Total de páginas: {len(pdf.pages)}")

        for i, page in enumerate(pdf.pages, start=1):
            print(f"\n📄 Página {i}")
            table = page.extract_table()
            if not table:
                print("  (sin tabla legible, pasando...)")
                continue

            for row in table:
                cells = [normalize(c) for c in row if c]
                if not cells:
                    continue

                c1 = cells[0] if len(cells) > 0 else ""
                c2 = cells[1] if len(cells) > 1 else ""
                tail = " ".join(cells[2:]) if len(cells) > 2 else ""

                # Detectar Marca
                if c1 and not c2:
                    current_brand = c1.title()
                    current_model = None
                    print(f"  [MARCA] {current_brand}")
                    continue

                # Detectar Modelo
                if c2 and not tail and len(c2.split()) <= 3:
                    current_model = c2.upper()
                    print(f"    [MODELO] {current_model}")
                    continue

                # Detectar Version
                if current_brand and current_model:
                    version = " ".join([c2, tail]).strip()
                    if not version:
                        continue
                    autos[current_brand][current_model].append(version)
                    for y in re.findall(r"\b(20[1-2]\d)\b", version):
                        autos_years[current_brand][current_model][version].add(int(y))

    # Guardar JSON
    out1 = {b: {m: vs for m, vs in models.items()} for b, models in autos.items()}
    out2 = {
        b: {m: {v: sorted(list(ys)) for v, ys in vers.items()} for m, vers in models.items()}
        for b, models in autos_years.items()
    }

    with open(OUT1, "w", encoding="utf-8") as f:
        json.dump(out1, f, ensure_ascii=False, indent=2)
    with open(OUT2, "w", encoding="utf-8") as f:
        json.dump(out2, f, ensure_ascii=False, indent=2)

    print(f"\n✅ Generados {OUT1} y {OUT2}")
    print(f"Total de marcas: {len(out1)}")

if __name__ == "__main__":
    main()
