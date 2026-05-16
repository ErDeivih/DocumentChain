import PyPDF2, re, os

pdf_dir = r'E:\Universidad\tfg\anexos\capt'
mapping = {
    'Anexo 1 TFG__(anexo i).pdf': 'David A1 (Plan)',
    'Anexo 2__(anexo ii).pdf': 'David A2 (Req)',
    'Anexo 3__(anexo iii).pdf': 'David A3 (Analisis)',
    'Anexo 4__(anexo iv).pdf': 'David A4 (Diseno)',
    'Anexo 5__(anexo v).pdf': 'David A5 (DocTec)',
    'Anexo 6__(anexo vi).pdf': 'David A6 (Manual)',
    'Anexo 7__(anexo vii).pdf': 'David A7 (Montaje)',
}

for pdf_file, label in mapping.items():
    path = os.path.join(pdf_dir, pdf_file)
    reader = PyPDF2.PdfReader(path)
    
    # Extract figure captions from illustration index pages (first 5)
    full = ''
    for i in range(min(8, len(reader.pages))):
        full += (reader.pages[i].extract_text() or '') + '\n'
    
    # Find illustration descriptions
    ilus = re.findall(r'Ilustraci[oó]n\s+(\d+)[:\s]+([^I]+)', full)
    
    print(f'=== {label} ({len(reader.pages)}p) ===')
    for num, desc in ilus[:15]:
        print(f'  Ilus {num}: {desc.strip()[:90]}')
    if len(ilus) > 15:
        print(f'  ... ({len(ilus)} total)')
    
    # Also find section structure  
    secs = re.findall(r'^\d+(?:\.\d+)*\s+([A-ZÁÉÍÓÚ][A-ZÁÉÍÓÚ\s]+)', full, re.MULTILINE)
    print(f'  Sections: {len(secs)}')
    print()
