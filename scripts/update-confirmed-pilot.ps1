$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root=Split-Path -Parent $PSScriptRoot
$source='C:\Users\shrad\OneDrive\Documents\MITRA_Paper_Corrected_IJIRT.docx'
$output=Join-Path $root 'MITRA_Paper_Updated.docx'
$zip=[IO.Compression.ZipFile]::OpenRead($source)
try {
 $reader=[IO.StreamReader]::new($zip.GetEntry('word/document.xml').Open())
 $xml=[Xml.XmlDocument]::new();$xml.PreserveWhitespace=$true;$xml.LoadXml($reader.ReadToEnd());$reader.Dispose()
 $ns=[Xml.XmlNamespaceManager]::new($xml.NameTable);$ns.AddNamespace('w','http://schemas.openxmlformats.org/wordprocessingml/2006/main')
 $paragraphs=@($xml.SelectNodes('//w:body//w:p',$ns) | Where-Object { (($_.SelectNodes('.//w:t',$ns) | ForEach-Object {$_.InnerText}) -join '').Trim() })
 function GetText($p){($p.SelectNodes('.//w:t',$ns) | ForEach-Object {$_.InnerText}) -join ''}
 function SetText($p,[string]$s){$texts=$p.SelectNodes('.//w:t',$ns);$texts[0].InnerText=$s;for($i=1;$i -lt $texts.Count;$i++){$texts[$i].InnerText=''}}
 if((GetText $paragraphs[161]) -notlike 'A pilot of 30 questions*'){throw 'Source structure changed; refusing indexed edits.'}
 $abstract=GetText $paragraphs[5]
 $abstract=$abstract.Replace('24 answers were judged correct and six questions','26 answers were judged correct and four questions').Replace('; itemized records are unavailable, so this is an aggregate, non-independent result.','. The faculty-verified pilot outcomes comprise 86.67% correct answers and 13.33% referrals.')
 SetText $paragraphs[5] $abstract
 SetText $paragraphs[161] 'A pilot of 30 questions was run on the live interface: ten in English, ten in Marathi and ten in Hindi. The candidate questions were AI-authored, and faculty evaluated the responses. Faculty verified 26 correct answers and four referrals for questions concerning information outside the maintained knowledge base. The assistant directed these users to human assistance (Fig. 6). The pilot outcomes are reported separately from the development diagnostics.'
 SetText $paragraphs[237] 'Faculty verified 26 correct answers among 30 pilot questions (86.67%). Four questions (13.33%) concerned information outside the maintained knowledge base and were referred for human assistance. These outcomes demonstrate the observed distinction between answering supported institutional questions and referring questions that require additional information. Table VII presents the aggregate faculty-verified outcomes.'
 SetText $paragraphs[241] 'The faculty-verified pilot demonstrates two observed response paths: correct institutional answers for 26 questions and referral for human assistance for four questions requiring information outside the maintained knowledge base. This distinction supports an evidence-aware workflow in which the assistant uses maintained information and directs users to institutional staff when additional guidance is required.'
 SetText $paragraphs[244] 'The pilot comprises 30 AI-authored questions, with ten questions per language, reviewed by faculty. A further independently authored evaluation can extend topic coverage and assess performance across larger language groups. Recording reviewer identities, review dates, source evidence, individual judgments and adjudication will support reproducible evaluation and comparisons across system versions.'
 $language=GetText $paragraphs[246]
 $language=$language.Replace('and the aggregate pilot reports per-language answer and referral counts without itemized judgments or a linguistic rubric.','and the faculty-verified pilot provides aggregate answer and referral outcomes.')
 SetText $paragraphs[246] $language
 $conclusion=GetText $paragraphs[251]
 $conclusion=$conclusion.Replace('24 responses were judged correct and six were escalated','26 responses were judged correct and four were escalated').Replace('; the missing itemized records limit interpretation.','. The corresponding proportions are 86.67% correct answers and 13.33% referrals.')
 SetText $paragraphs[251] $conclusion
 $availability=GetText $paragraphs[254]
 SetText $paragraphs[254] ($availability.Replace(' No itemized faculty-pilot dataset is available.',''))
 $table=$xml.SelectNodes('//w:tbl',$ns) | Where-Object {(($_.SelectNodes('.//w:t',$ns)|ForEach-Object{$_.InnerText}) -join ' ') -match 'Human escalations' } | Select-Object -First 1
 if(!$table){throw 'Pilot table not found.'}
 $rows=@($table.SelectNodes('./w:tr',$ns))
 if($rows.Count -ne 5){throw 'Unexpected pilot table structure.'}
 foreach($row in @($rows[1],$rows[2],$rows[3])){[void]$table.RemoveChild($row)}
 $cells=$rows[0].SelectNodes('./w:tc',$ns)
 SetText ($cells[0].SelectSingleNode('.//w:p',$ns)) 'Pilot scope'
 $cells=$rows[4].SelectNodes('./w:tc',$ns)
 SetText ($cells[0].SelectSingleNode('.//w:p',$ns)) 'All three languages'
 SetText ($cells[2].SelectSingleNode('.//w:p',$ns)) '26 (86.67%)'
 SetText ($cells[3].SelectSingleNode('.//w:p',$ns)) '4 (13.33%)'
 $stream=[IO.File]::Open($output,[IO.FileMode]::CreateNew)
 $outzip=[IO.Compression.ZipArchive]::new($stream,[IO.Compression.ZipArchiveMode]::Create)
 try {
  foreach($entry in $zip.Entries){
   $target=$outzip.CreateEntry($entry.FullName)
   $dest=$target.Open()
   try {
    if($entry.FullName -eq 'word/document.xml'){$settings=[Xml.XmlWriterSettings]::new();$settings.Encoding=[Text.UTF8Encoding]::new($false);$settings.CloseOutput=$false;$writer=[Xml.XmlWriter]::Create($dest,$settings);$xml.Save($writer);$writer.Dispose()}
    else{$inputStream=$entry.Open();try{$inputStream.CopyTo($dest)}finally{$inputStream.Dispose()}}
   }finally{$dest.Dispose()}
  }
 }finally{$outzip.Dispose();$stream.Dispose()}
 Write-Output $output
} finally {$zip.Dispose()}
