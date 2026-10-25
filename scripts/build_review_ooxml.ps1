param([string]$Source='docs/MITRA_RESEARCH_MANUSCRIPT.md',[string]$Output='deliverables/MITRA_Research_Paper_Review.docx')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.Drawing
$root=Split-Path -Parent $PSScriptRoot
$body=[Text.StringBuilder]::new()
function TextXml([string]$s){[Security.SecurityElement]::Escape($s)}
function Para([string]$s,[string]$style='Normal'){
 if($s -match '^\[\d+\]'){$style='Reference'}
 $s=[regex]::Replace($s,'\[([^\]]+)\]\((https?://[^)]+)\)','$1 ($2)')
 $s=[regex]::Replace($s,'\[([^\]]+)\]\(([^)]+)\)','$1')
 $bold=$s.StartsWith('**');$s=$s.Replace('**','')
 $props=if($bold){'<w:b/>'}else{''}
 $align=if($s -match '^(Emails:|Department of|Corresponding author:|Shraddha Sunil|\[\d+\])'){'<w:jc w:val="left"/>'}else{''}
 '<w:p><w:pPr><w:pStyle w:val="'+$style+'"/>'+$align+'</w:pPr><w:r><w:rPr>'+$props+'</w:rPr><w:t xml:space="preserve">'+(TextXml $s)+'</w:t></w:r></w:p>'
}
$inTable=$false
foreach($line in [IO.File]::ReadAllLines((Join-Path $root $Source))){
 $s=$line.Trim();if(!$s){continue}
 if($s -eq '<!-- PAGEBREAK -->'){if($inTable){[void]$body.Append('</w:tbl>');$inTable=$false};[void]$body.Append('<!--NEXT-->');continue}
 if($s -eq '[[ARCHITECTURE]]'){
  [void]$body.Append('<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><wp:extent cx="6096000" cy="1574800"/><wp:docPr id="1" name="MITRA architecture" descr="Question validation and scope interpretation retrieve maintained knowledge, then select critical rendering or optional verified generation before returning a response."/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="0" name="architecture.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId2"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="6096000" cy="1574800"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>');continue
 }
 if($s.StartsWith('|')){
  if($s -match '^\|[\s:|\-]+\|$'){continue}
  $header=!$inTable
  if($header){$widths=if($s -match '^\| Method '){@(3200,4300,2500)}elseif($s -match '^\| Checker '){@(4000,3000,3000)}elseif($s -match '^\| Research line '){@(2400,3000,4600)}else{@(2800,1800,5400)}}
  if(!$inTable){[void]$body.Append('<w:tbl><w:tblPr><w:tblW w:w="10000" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="D9D9D9"/><w:left w:val="single" w:sz="4" w:color="D9D9D9"/><w:bottom w:val="single" w:sz="4" w:color="D9D9D9"/><w:right w:val="single" w:sz="4" w:color="D9D9D9"/><w:insideH w:val="single" w:sz="4" w:color="D9D9D9"/><w:insideV w:val="single" w:sz="4" w:color="D9D9D9"/></w:tblBorders><w:tblCellMar><w:top w:w="90" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="90" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid><w:gridCol w:w="2800"/><w:gridCol w:w="1800"/><w:gridCol w:w="5400"/></w:tblGrid>');$inTable=$true}
  $row='<w:tr><w:trPr><w:cantSplit/>'+$(if($header){'<w:tblHeader/>'})+'</w:trPr>'
  $i=0
  foreach($cell in $s.Trim('|').Split('|')){
   $width=$widths[$i];$i++
   $shade=if($header){'<w:shd w:fill="EDEDED"/>'}else{''}
   $cellXml=Para $cell.Trim() 'TableText'
   if($header){$cellXml=$cellXml.Replace('<w:pPr>','<w:pPr><w:keepNext/>')}
   $row+='<w:tc><w:tcPr><w:tcW w:w="'+$width+'" w:type="dxa"/><w:vAlign w:val="center"/>'+$shade+'</w:tcPr>'+$cellXml+'</w:tc>'
  };[void]$body.Append($row+'</w:tr>');continue
 }
 if($inTable){[void]$body.Append('</w:tbl>');$inTable=$false}
 if($s.StartsWith('# ')){[void]$body.Append((Para $s.Substring(2) 'Title'))}
 elseif($s.StartsWith('### ')){[void]$body.Append((Para $s.Substring(4) 'Heading2'))}
 elseif($s.StartsWith('## ')){[void]$body.Append((Para $s.Substring(3) 'Heading1'))}
 else{[void]$body.Append((Para $s))}
}
$document='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+$body.ToString()+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1020" w:right="1020" w:bottom="1020" w:left="1020"/></w:sectPr></w:body></w:document>'
$styles='<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:color w:val="000000"/><w:sz w:val="22"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="260" w:lineRule="auto"/><w:widowControl/><w:jc w:val="both"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="34"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="90"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:pPr><w:keepNext/><w:spacing w:before="150" w:after="70"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table text"/><w:pPr><w:jc w:val="left"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:style></w:styles>'
$entries=@{
 '[Content_Types].xml'='<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
 '_rels/.rels'='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
 'word/document.xml'=$document
 'word/styles.xml'=$styles
 'word/_rels/document.xml.rels'='<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
}
$entries['word/document.xml']=$entries['word/document.xml'].Replace('<!--NEXT--><w:p><w:pPr>','<w:p><w:pPr><w:pageBreakBefore/>')
$entries['word/document.xml']=$entries['word/document.xml'].Replace('<w:sectPr>','<w:sectPr><w:footerReference xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" w:type="default" r:id="rId3"/>')
$entries['word/footer1.xml']='<?xml version="1.0" encoding="UTF-8"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:fldSimple w:instr="PAGE"><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:t>1</w:t></w:r></w:fldSimple></w:p></w:ftr>'
$entries['word/_rels/document.xml.rels']=$entries['word/_rels/document.xml.rels'].Replace('</Relationships>','<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>')
$entries['[Content_Types].xml']=$entries['[Content_Types].xml'].Replace('</Types>','<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>')
$entries['word/styles.xml']=$entries['word/styles.xml'].Replace('w:after="120" w:line="260"','w:after="100" w:line="250"')
$entries['word/styles.xml']=$entries['word/styles.xml'].Replace('</w:styles>','<w:style w:type="paragraph" w:styleId="Reference"><w:name w:val="Reference"/><w:pPr><w:jc w:val="left"/><w:spacing w:after="80" w:line="230" w:lineRule="auto"/></w:pPr><w:rPr><w:sz w:val="20"/></w:rPr></w:style></w:styles>')
$hasFigure=$body.ToString().Contains('rId2')
if($hasFigure){
 $qa=Join-Path $root 'tmp/expanded-paper-qa';New-Item -ItemType Directory -Force -Path $qa | Out-Null
 $bitmap=[Drawing.Bitmap]::new(1500,388);$g=[Drawing.Graphics]::FromImage($bitmap);$g.Clear([Drawing.Color]::White);$g.SmoothingMode='AntiAlias'
 $font=[Drawing.Font]::new('Arial',21);$small=[Drawing.Font]::new('Arial',18);$pen=[Drawing.Pen]::new([Drawing.Color]::FromArgb(55,65,75),3)
 $brush=[Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(240,243,246));$black=[Drawing.Brushes]::Black
 $fmt=[Drawing.StringFormat]::new();$fmt.Alignment='Center';$fmt.LineAlignment='Center'
 $boxes=@(@(15,130,220,110,"Question and`nvalidation"),@(280,130,240,110,"Scope and`nretrieval"),@(580,20,470,110,"Critical facts:`nmaintained rendering"),@(580,250,470,110,"Optional generation`nand bounded verification"),@(1120,130,355,110,"Answer, clarification`nor human referral"))
 foreach($b in $boxes){$rect=[Drawing.RectangleF]::new($b[0],$b[1],$b[2],$b[3]);$g.FillRectangle($brush,$rect);$g.DrawRectangle($pen,$b[0],$b[1],$b[2],$b[3]);$g.DrawString($b[4],$font,$black,$rect,$fmt)}
 $pen.CustomEndCap=[Drawing.Drawing2D.AdjustableArrowCap]::new(5,7)
 $g.DrawLine($pen,235,185,275,185);$g.DrawLine($pen,520,185,575,75);$g.DrawLine($pen,520,185,575,305);$g.DrawLine($pen,1050,75,1115,185);$g.DrawLine($pen,1050,305,1115,185)
 $figure=Join-Path $qa 'architecture.png';$bitmap.Save($figure,[Drawing.Imaging.ImageFormat]::Png)
 $g.Dispose();$bitmap.Dispose();$font.Dispose();$small.Dispose();$pen.Dispose();$brush.Dispose();$fmt.Dispose()
 $entries['[Content_Types].xml']=$entries['[Content_Types].xml'].Replace('</Types>','<Default Extension="png" ContentType="image/png"/></Types>')
 $entries['word/_rels/document.xml.rels']=$entries['word/_rels/document.xml.rels'].Replace('</Relationships>','<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/architecture.png"/></Relationships>')
}
$output=Join-Path $root $Output
$stream=[IO.File]::Open($output,[IO.FileMode]::Create)
$zip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Create)
try{foreach($name in $entries.Keys){$entry=$zip.CreateEntry($name);$writer=[IO.StreamWriter]::new($entry.Open(),[Text.UTF8Encoding]::new($false));$writer.Write($entries[$name]);$writer.Dispose()};if($hasFigure){[void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,$figure,'word/media/architecture.png')}}finally{$zip.Dispose();$stream.Dispose()}
Write-Output $output
