import re
import json
import pdfplumber

PDF_PATH = "data/Constitutia.pdf"   # adjust to your actual filename
OUTPUT_PATH = "data/chunks.json"

def extract_text(pdf_path: str) -> str:
    full_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                full_text.append(text)
    return "\n".join(full_text)

def chunk_by_article(text: str) -> list[dict]:
    # Drop the table of contents and jurisprudence appendix — keep only
    # the actual constitutional text that precedes them.
    for marker in ["\nCUPRINS", "JURISPRUDENȚA CURȚII"]:
        idx = text.find(marker)
        if idx != -1:
            text = text[:idx]

    # Match both digit-numbered articles (Articolul 143) and the
    # Roman-numeral final articles (Articolul I, II, III...).
    pattern = r"(Articolul\s+(?:\d+\S*|[IVXLCDM]+(?=\s)))"
    parts = re.split(pattern, text)

    chunks = []
    for i in range(1, len(parts), 2):
        marker = parts[i].strip().rstrip(".")  # normalize: no trailing dot
        body = parts[i + 1].strip() if i + 1 < len(parts) else ""
        chunk_text = f"{marker} {body}"

        if len(chunk_text) > 30:
            chunks.append({
                "id": marker.replace(" ", "_"),
                "text": chunk_text
            })

    return chunks

if __name__ == "__main__":
    raw_text = extract_text(PDF_PATH)
    chunks = chunk_by_article(raw_text)

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"Extracted {len(chunks)} chunks. Saved to {OUTPUT_PATH}")
    print("\nFirst chunk preview:")
    print(chunks[0]["text"][:300] if chunks else "No chunks found")