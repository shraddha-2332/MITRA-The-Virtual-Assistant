"""Build the faculty review PDF from the evidence-backed Markdown manuscript."""
from pathlib import Path
import re
from html import escape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'docs/MITRA_RESEARCH_MANUSCRIPT.md'
OUT = ROOT / 'deliverables/MITRA_Professor_Review.pdf'

def inline(text):
    text = escape(text)
    text = re.sub(r'\[([^\]]+)\]\((https?://[^)]+)\)', r'<link href="\2" color="#17497A">\1</link>', text)
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'\1', text)
    return re.sub(r'\*\*([^*]+)\*\*', r'<b>\1</b>', text)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='PaperTitle', fontName='Times-Bold', fontSize=17, leading=20, alignment=TA_CENTER, spaceAfter=12))
styles.add(ParagraphStyle(name='PaperBody', fontName='Times-Roman', fontSize=10, leading=13, alignment=TA_JUSTIFY, spaceAfter=7))
styles.add(ParagraphStyle(name='PaperHeading', fontName='Times-Bold', fontSize=12, leading=15, spaceBefore=11, spaceAfter=5, keepWithNext=True))
styles.add(ParagraphStyle(name='PaperSubheading', fontName='Times-Bold', fontSize=10.5, leading=13, spaceBefore=8, spaceAfter=4, keepWithNext=True))
styles.add(ParagraphStyle(name='PaperCell', fontName='Times-Roman', fontSize=8.5, leading=11, spaceAfter=0))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Times-Roman', 8)
    canvas.drawString(44, 26, 'MITRA | Faculty review copy | 24 October 2026')
    canvas.drawRightString(A4[0] - 44, 26, str(doc.page))
    canvas.restoreState()

story = []
table_lines = []
def flush_table():
    if not table_lines:
        return
    data = [[cell.strip() for cell in line.strip('|').split('|')] for line in table_lines if not re.match(r'^\|[\s:|\-]+\|$', line)]
    cells = [[Paragraph(inline(cell), styles['PaperCell']) for cell in row] for row in data]
    width = A4[0] - 88
    widths = [width*.30, width*.20, width*.50] if len(data[0]) == 3 else [width/len(data[0])]*len(data[0])
    table = Table(cells, colWidths=widths, repeatRows=1, hAlign='LEFT')
    table.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#EDEFF2')), ('VALIGN',(0,0),(-1,-1),'TOP'), ('GRID',(0,0),(-1,-1),.35,colors.HexColor('#B9BEC5')), ('LEFTPADDING',(0,0),(-1,-1),6), ('RIGHTPADDING',(0,0),(-1,-1),6), ('TOPPADDING',(0,0),(-1,-1),6), ('BOTTOMPADDING',(0,0),(-1,-1),6)]))
    story.extend([table, Spacer(1,8)])
    table_lines.clear()

for line in SOURCE.read_text(encoding='utf-8').splitlines():
    line = line.strip()
    if line.startswith('|'):
        table_lines.append(line)
        continue
    flush_table()
    if not line:
        continue
    if line.startswith('# '):
        style, text = 'PaperTitle', line[2:]
    elif line.startswith('### '):
        style, text = 'PaperSubheading', line[4:]
    elif line.startswith('## '):
        style, text = 'PaperHeading', line[3:]
    else:
        style, text = 'PaperBody', line
    story.append(Paragraph(inline(text), styles[style]))
flush_table()
OUT.parent.mkdir(exist_ok=True)
SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=44, leftMargin=44, topMargin=42, bottomMargin=44, title='Mitra institutional assistant faculty review', author='MITRA project team').build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
