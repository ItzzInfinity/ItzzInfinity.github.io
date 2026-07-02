#!/usr/bin/env python3
"""Geometric layout checks for generated resume PDFs (PyMuPDF).

For each PDF given on the command line, verifies that:
  1. No two words on the same visual line overlap horizontally — this is the
     class of bug where the Education score/dates collided with the institute
     name (react-pdf rows whose left text didn't flex).
  2. No word escapes the page box.

Prints one line per file; exits non-zero if any check fails.
Used by scripts/self-check.tsx after it renders parsed/check-<domain>.pdf.
"""
import sys

import fitz  # PyMuPDF

# Bold/regular runs that react-pdf lays out back-to-back can abut by a
# fraction of a point; only flag real collisions.
OVERLAP_TOL = 1.0
PAGE_TOL = 1.0


def same_visual_line(a, b):
    """Words share a line if their vertical overlap covers most of the shorter one."""
    top = max(a[1], b[1])
    bottom = min(a[3], b[3])
    overlap = bottom - top
    min_h = min(a[3] - a[1], b[3] - b[1])
    return min_h > 0 and overlap > 0.5 * min_h


def check_pdf(path):
    errors = []
    doc = fitz.open(path)
    for pno, page in enumerate(doc, start=1):
        rect = page.rect
        words = sorted(page.get_text("words"), key=lambda w: (round(w[1], 1), w[0]))
        for i, w in enumerate(words):
            if (w[0] < rect.x0 - PAGE_TOL or w[2] > rect.x1 + PAGE_TOL
                    or w[1] < rect.y0 - PAGE_TOL or w[3] > rect.y1 + PAGE_TOL):
                errors.append(
                    f"p{pno}: word escapes page box: {w[4]!r} at ({w[0]:.1f},{w[1]:.1f})")
            for other in words[i + 1:]:
                if other[1] > w[3]:  # sorted by y; no later word can share this line
                    break
                if not same_visual_line(w, other):
                    continue
                h_overlap = min(w[2], other[2]) - max(w[0], other[0])
                if h_overlap > OVERLAP_TOL:
                    errors.append(
                        f"p{pno}: overlapping text: {w[4]!r} and {other[4]!r} "
                        f"(x-overlap {h_overlap:.1f}pt at y={w[1]:.1f})")
    pages = doc.page_count
    doc.close()
    return pages, errors


def main():
    if len(sys.argv) < 2:
        print("usage: check_layout.py file.pdf [file.pdf ...]", file=sys.stderr)
        return 2
    failed = False
    for path in sys.argv[1:]:
        pages, errors = check_pdf(path)
        if errors:
            failed = True
            print(f"FAIL  layout {path} ({pages} page{'s' if pages != 1 else ''})")
            for e in errors[:20]:
                print(f"      {e}")
            if len(errors) > 20:
                print(f"      ... and {len(errors) - 20} more")
        else:
            print(f"ok    layout {path} ({pages} page{'s' if pages != 1 else ''}): "
                  f"no overlaps, nothing off-page")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
