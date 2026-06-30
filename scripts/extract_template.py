#!/usr/bin/env python3
"""Extract the visual formatting spec from a template resume PDF.

Reads ``template.pdf`` (or a path passed as argv[1]) and emits a JSON spec
describing the page geometry, the fonts/sizes/colours actually used, the
section headings, and the colour of horizontal rules. This is the
machine-readable description of "how the resume should look" that the
React/PDF renderer is built to match.

Usage:
    python3 scripts/extract_template.py [TEMPLATE_PDF] [OUT_JSON]
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = ROOT / "template.pdf"
DEFAULT_OUT = ROOT / "parsed" / "template_spec.json"


def int_to_rgb(color: int) -> list[int]:
    return [(color >> 16) & 255, (color >> 8) & 255, color & 255]


def main() -> int:
    pdf = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PDF
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT

    if not pdf.is_file():
        print(f"Template not found: {pdf}", file=sys.stderr)
        return 1

    doc = fitz.open(pdf)
    page = doc[0]
    data = page.get_text("dict")

    font_usage: Counter = Counter()
    size_usage: Counter = Counter()
    color_usage: Counter = Counter()
    spans = []
    headings = []  # large/bold all-caps lines = section headers

    for block in data.get("blocks", []):
        for line in block.get("lines", []):
            line_text = "".join(s["text"] for s in line.get("spans", [])).strip()
            for span in line.get("spans", []):
                text = span["text"].strip()
                if not text:
                    continue
                size = round(span["size"], 1)
                font = span["font"]
                color = span["color"]
                font_usage[font] += 1
                size_usage[size] += 1
                color_usage[color] += 1
                spans.append(
                    {
                        "text": text,
                        "font": font,
                        "size": size,
                        "bold": "bold" in font.lower() or "black" in font.lower(),
                        "color": int_to_rgb(color),
                        "bbox": [round(c, 1) for c in span["bbox"]],
                    }
                )
            # Heuristic: section headings are short, upper-case, bold-ish.
            if line_text and line_text == line_text.upper() and len(line_text) <= 28:
                first = line["spans"][0] if line.get("spans") else None
                if first and round(first["size"], 1) >= 9:
                    headings.append(line_text)

    # Horizontal rules (thin drawn lines) and their colours.
    rules = []
    for d in page.get_drawings():
        for item in d.get("items", []):
            if item[0] == "l":  # line segment
                p1, p2 = item[1], item[2]
                if abs(p1.y - p2.y) < 0.6 and abs(p2.x - p1.x) > 50:
                    col = d.get("color") or (0, 0, 0)
                    rules.append(
                        {
                            "y": round(p1.y, 1),
                            "x0": round(min(p1.x, p2.x), 1),
                            "x1": round(max(p1.x, p2.x), 1),
                            "color": [round(c * 255) for c in col],
                            "width": round(d.get("width") or 1, 2),
                        }
                    )

    spec = {
        "source_file": pdf.name,
        "page": {
            "width": round(page.rect.width, 1),
            "height": round(page.rect.height, 1),
            "format": "A4" if abs(page.rect.height - 842) < 5 else "custom",
        },
        "fonts_used": font_usage.most_common(),
        "sizes_used": sorted(size_usage.items()),
        "colors_used": [
            {"rgb": int_to_rgb(c), "count": n} for c, n in color_usage.most_common()
        ],
        "section_headings": list(dict.fromkeys(headings)),
        "horizontal_rules": rules,
        "spans": spans,
    }

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(spec, indent=2, ensure_ascii=False))
    doc.close()

    print(f"Page: {spec['page']['width']}x{spec['page']['height']} ({spec['page']['format']})")
    print(f"Fonts: {[f for f, _ in spec['fonts_used']]}")
    print(f"Sizes: {[s for s, _ in spec['sizes_used']]}")
    print(f"Headings: {spec['section_headings']}")
    print(f"Rules: {len(rules)} horizontal")
    print(f"Wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
