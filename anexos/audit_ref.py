import PyPDF2, re, os

pdf_dir = r'E:\Universidad\tfg\anexos\capt'

for pdf_file in sorted(os.listdir(pdf_dir)):
    if not pdf_file.endswith('.pdf'): continue
    path = os.path.join(pdf_dir, pdf_file)
    reader = PyPDF2.PdfReader(path)
    pages = len(reader.pages)
    
    full = ''
    for i in range(min(pages, 20)):
        full += (reader.pages[i].extract_text() or '') + '\n'
    
    ilus = len(set(re.findall(r'Ilustraci[oó]n\s+\d+', full)))
    tabs = len(set(re.findall(r'Tabla\s+\d+', full)))
    ucs = len(set(re.findall(r'UC[-\s]?\d+', full)))
    acts = len(set(re.findall(r'ACT[-\s]?\d+', full)))
    objs = len(set(re.findall(r'OBJ[-\s]?\d+', full)))
    irqs = len(set(re.findall(r'IRQ[-\s]?\d+', full)))
    nfrs = len(set(re.findall(r'NFR[-\s]?\d+|RNF[-\s]?\d+', full)))
    
    short = pdf_file[:40]
    print(f'{short}: {pages}p | Ilus:{ilus} Tab:{tabs} UC:{ucs} ACT:{acts} OBJ:{objs} IRQ:{irqs} NFR:{nfrs}')
