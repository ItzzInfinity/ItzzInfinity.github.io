#!/usr/bin/env python3
"""Extract text + embedded hyperlinks from resume PDFs into structured JSON.

For every PDF in the source directory this writes one JSON file to ``parsed/``
containing the plain text, the layout-ordered lines, and every hyperlink with
the visible anchor text it sits on top of.

Usage:
    python3 scripts/extract_resumes.py [SOURCE_DIR] [OUT_DIR]

Defaults:
    SOURCE_DIR = ~/Downloads/all_resumes
    OUT_DIR    = ./parsed
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import fitz  # PyMuPDF

DEFAULT_SRC = Path.home() / "Downloads" / "all_resumes"
DEFAULT_OUT = Path(__file__).resolve().parent.parent / "parsed"


def anchor_text_for_rect(page: "fitz.Page", rect: "fitz.Rect") -> str:
    """Return the visible text whose bounding boxes overlap a link rectangle."""
    # Slightly inflate the rect so we catch glyphs that hang over the edge.
    target = rect + (-1, -1, 1, 1)
    words = page.get_text("words")  # x0, y0, x1, y1, word, block, line, word_no
    hits = [w[4] for w in words if fitz.Rect(w[:4]).intersects(target)]
    return " ".join(hits).strip()


def extract_links(page: "fitz.Page") -> list[dict]:
    links = []
    for link in page.get_links():
        uri = link.get("uri")
        if not uri:
            continue  # skip internal / goto links, we only want real URLs
        rect = fitz.Rect(link["from"])
        links.append(
            {
                "uri": uri,
                "anchor_text": anchor_text_for_rect(page, rect),
                "rect": [round(c, 2) for c in rect],
            }
        )
    return links


def extract_lines(page: "fitz.Page") -> list[str]:
    """Layout-ordered lines of text (top-to-bottom, left-to-right)."""
    lines: list[str] = []
    data = page.get_text("dict")
    for block in data.get("blocks", []):
        for line in block.get("lines", []):
            text = "".join(span["text"] for span in line.get("spans", [])).strip()
            if text:
                lines.append(text)
    return lines


def extract_pdf(path: Path) -> dict:
    doc = fitz.open(path)
    pages = []
    all_links = []
    full_text_parts = []
    for page in doc:
        full_text_parts.append(page.get_text("text"))
        page_links = extract_links(page)
        all_links.extend(page_links)
        pages.append(
            {
                "number": page.number + 1,
                "lines": extract_lines(page),
                "links": page_links,
            }
        )
    doc.close()
    return {
        "source_file": path.name,
        "page_count": len(pages),
        "text": "".join(full_text_parts).strip(),
        "links": all_links,
        "pages": pages,
    }


def main() -> int:
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_OUT

    if not src.is_dir():
        print(f"Source directory not found: {src}", file=sys.stderr)
        return 1

    out.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(p for p in src.iterdir() if p.suffix.lower() == ".pdf")
    if not pdfs:
        print(f"No PDFs found in {src}", file=sys.stderr)
        return 1

    index = []
    for pdf in pdfs:
        try:
            result = extract_pdf(pdf)
        except Exception as exc:  # noqa: BLE001 - report and continue
            print(f"  ! failed {pdf.name}: {exc}", file=sys.stderr)
            continue
        out_path = out / f"{pdf.stem}.json"
        out_path.write_text(json.dumps(result, indent=2, ensure_ascii=False))
        index.append(
            {
                "source_file": result["source_file"],
                "json_file": out_path.name,
                "page_count": result["page_count"],
                "link_count": len(result["links"]),
            }
        )
        print(f"  + {pdf.name}: {result['page_count']}p, {len(result['links'])} links")

    (out / "_index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False))
    print(f"\nWrote {len(index)} files to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
