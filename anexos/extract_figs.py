import PyPDF2, re, os

pdf_dir = r'E:\Universidad\tfg\anexos\capt'

# Focus on Memoria - extract page content to find image types
path = os.path.join(pdf_dir, 'Memoria TFG__(memoria).pdf')
reader = PyPDF2.PdfReader(path)

# Extract figure captions from all pages
for i in range(len(reader.pages)):
    text = reader.pages[i].extract_text() or ''
    # Find figure references
    figs = re.findall(r'Ilustraci[oó]n\s+\d+[:\s]+([^\.]+)', text)
    if figs:
        for f in figs:
            print(f'  Page {i+1}: {f.strip()[:100]}')
