import PyPDF2, re, os

path = r'E:\Universidad\tfg\anexos\capt\Memoria TFG__(memoria).pdf'
reader = PyPDF2.PdfReader(path)

with open(r'E:\Universidad\tfg\anexos\memoria_david_full.txt', 'w', encoding='utf-8') as out:
    for i in range(len(reader.pages)):
        text = reader.pages[i].extract_text() or ''
        out.write(f'\n===== PAGE {i+1} =====\n')
        out.write(text)
        out.write('\n')

print(f'Extracted {len(reader.pages)} pages')
