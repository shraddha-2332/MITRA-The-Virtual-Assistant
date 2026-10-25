import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import re
import os

doc = docx.Document()

# Set standard IEEE margins (0.75 in / 1.9 cm)
for section in doc.sections:
    section.top_margin = Inches(0.75)
    section.bottom_margin = Inches(0.75)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

# Styling helper
def set_font(run, name='Times New Roman', size=Pt(10), bold=False, italic=False, color=RGBColor(0,0,0)):
    run.font.name = name
    run.font.size = size
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color

# Title
title_p = doc.add_paragraph()
title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
title_p.paragraph_format.space_before = Pt(0)
title_p.paragraph_format.space_after = Pt(12)
r = title_p.add_run("Query-Conditioned Slot Verification for Fee and Seat Matrices in a Deterministic-First Institutional Admission Assistant")
set_font(r, name='Times New Roman', size=Pt(18), bold=True)

# Authors
author_p = doc.add_paragraph()
author_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
author_p.paragraph_format.space_after = Pt(4)
r = author_p.add_run("Shraddha Ukirade, Anzalna Tamboli, Sayali Kakade, Dnyaneshwari Vyavahare, and S. J. Raichurkar\n")
set_font(r, name='Times New Roman', size=Pt(11), bold=True)
r_aff = author_p.add_run("Department of Computer Science and Engineering\nMIT College of Railway Engineering and Research (MITCORER), Barshi, Maharashtra, India\n(Affiliated to Punyashlok Ahilyadevi Holkar Solapur University, Solapur)")
set_font(r_aff, name='Times New Roman', size=Pt(9.5), italic=True)

doc.add_paragraph().paragraph_format.space_after = Pt(6)

# Read markdown content
with open('docs/MITRA_IEEE_RESEARCH_PAPER.md', 'r', encoding='utf8') as f:
    text = f.read()

# Split into main sections
lines = text.split('\n')

in_abstract = False
current_table_lines = []
in_table = False

def process_table(table_lines):
    if len(table_lines) < 2:
        return
    rows = [r.strip().strip('|').split('|') for r in table_lines if not re.match(r'^\s*\|?\s*[-:]+\s*\|', r)]
    if not rows:
        return
    num_cols = len(rows[0])
    tbl = doc.add_table(rows=len(rows), cols=num_cols)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(rows):
        for j, cell_text in enumerate(row):
            if j < num_cols:
                cell = tbl.cell(i, j)
                cell.text = cell_text.strip().replace('**', '')
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                for run in p.runs:
                    set_font(run, size=Pt(8.5), bold=(i == 0))
    # space after table
    sp = doc.add_paragraph()
    sp.paragraph_format.space_after = Pt(6)

for line in lines:
    line_s = line.strip()
    if not line_s:
        if in_table:
            process_table(current_table_lines)
            current_table_lines = []
            in_table = False
        continue

    # Table handling
    if line_s.startswith('|') and line_s.endswith('|'):
        in_table = True
        current_table_lines.append(line_s)
        continue
    elif in_table:
        process_table(current_table_lines)
        current_table_lines = []
        in_table = False

    # Skip title and authors from markdown as already added
    if line_s.startswith('# ') or line_s.startswith('**Shraddha') or 'Department of Computer' in line_s or '(Affiliated to' in line_s:
        continue

    # Section Headings (## Section)
    if line_s.startswith('## '):
        head_text = line_s.replace('## ', '').strip()
        hp = doc.add_paragraph()
        hp.paragraph_format.space_before = Pt(14)
        hp.paragraph_format.space_after = Pt(4)
        hp.paragraph_format.keep_with_next = True
        r = hp.add_run(head_text.upper())
        set_font(r, name='Times New Roman', size=Pt(11), bold=True)
        continue

    # Subheadings (### Subheading)
    if line_s.startswith('### '):
        sub_text = line_s.replace('### ', '').strip()
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(10)
        sp.paragraph_format.space_after = Pt(3)
        sp.paragraph_format.keep_with_next = True
        r = sp.add_run(sub_text)
        set_font(r, name='Times New Roman', size=Pt(10), bold=True, italic=True)
        continue

    # Normal paragraph
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.05
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Simple inline bold/italic parsing
    parts = re.split(r'(\*\*.*?\*\*|\*.*?\*)', line_s)
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            r = p.add_run(part[2:-2])
            set_font(r, size=Pt(9.5), bold=True)
        elif part.startswith('*') and part.endswith('*'):
            r = p.add_run(part[1:-1])
            set_font(r, size=Pt(9.5), italic=True)
        else:
            r = p.add_run(part)
            set_font(r, size=Pt(9.5))

if in_table:
    process_table(current_table_lines)

output_path = 'docs/MITRA_IEEE_Research_Paper.docx'
doc.save(output_path)
print(f"Generated {output_path} successfully ({os.path.getsize(output_path)} bytes)")

