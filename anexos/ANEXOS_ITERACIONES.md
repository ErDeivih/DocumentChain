# ANEXOS_ITERACIONES.md

> Documento de trabajo para revisar y corregir los anexos de forma iterativa.
> Cada iteración corrige los issues detectados, recompila, y vuelve a auditar.
> **Principio:** no sobrecorregir, no añadir info innecesaria, solo lo que falta o sobra.

---

## ITERACIÓN 1 — Issues detectados (02/06/2026)

### Anexo I — Especificación de Requisitos (75 páginas)

| # | Issue | Acción |
|---|---|---|
| 1.1 | `\usepackage{listings}` cargado pero no usado | Eliminar |
| 1.2 | Revisar si hay tablas con numeración UC antigua (0013/0014 donde debería ser 0015/0016) | Verificar |

### Anexo II — Estimación (30 páginas)

| # | Issue | Acción |
|---|---|---|
| 2.1 | 5 referencias a Sepolia | Buscar y eliminar/cambiar |
| 2.2 | Revisar si las tablas UCP cubren correctamente los 43 UC | Verificar |
| 2.3 | Verificar que no hay páginas vacías | Revisar |
| 2.4 | Gantt: verificar que todos los hitos aparecen en los diagramas | Revisar |

### Anexo III — Análisis y Diseño (69 páginas) ✅ REESTRUCTURADO

### Anexo IV — Documentación Técnica (25 páginas)

| # | Issue | Acción |
|---|---|---|
| 4.1 | 1 referencia a Sepolia | Eliminar |
| 4.2 | Revisar que no queda código fuente en lstlisting | Verificar |
| 4.3 | Revisar que las tecnologías/versiones coinciden con package.json | Verificar |

### Anexo V — Plan de Seguridad (32 páginas)

| # | Issue | Acción |
|---|---|---|
| 5.1 | Revisar que no hay referencias a contratos separados | Verificar |
| 5.2 | Revisar medidas M-01 a M-23 por coherencia | Verificar |

### Anexo VI — Manual de Usuario (41 páginas)

| # | Issue | Acción |
|---|---|---|
| 6.1 | Revisar que las capturas referenciadas existen | Verificar |
| 6.2 | Revisar que los pasos coinciden con la UI real | Verificar |

### Anexo VII — Manual de Montaje (28 páginas)

| # | Issue | Acción |
|---|---|---|
| 7.1 | Revisar que los servicios descritos coinciden con docker-compose.yml | Verificar |
| 7.2 | Revisar que los comandos Docker son correctos | Verificar |

### Anexo VIII — Uso de IA (8 páginas)

| # | Issue | Acción |
|---|---|---|
| 8.1 | Revisar que los números de UC/diagramas son 43/86 | Verificar |

### Anexo IX — DCU (15 páginas)

| # | Issue | Acción |
|---|---|---|
| 9.1 | Revisar que los wireframes y mockups referenciados existen | Verificar |

### Memoria Principal (35 páginas)

| # | Issue | Acción |
|---|---|---|
| 10.1 | `\usepackage{listings}` cargado pero no usado | Eliminar |
| 10.2 | Revisar que no hay referencias a Sepolia/EIP-712 | Verificar |
| 10.3 | Revisar consistencia de versiones de tecnologías | Verificar |

---

## CHECKLIST DE COMPILACIÓN (cada iteración)

- [ ] `cd anexos`
- [ ] Compilar los 10 PDFs
- [ ] Verificar 0 errores
- [ ] `git add -u && git add anexos/*_NUEVO.pdf`
- [ ] `git commit -m "Iteración X: correcciones en anexos"`
- [ ] `git push origin main`

---

## REGLAS

1. **No sobrecorregir**: si un anexo funciona y cumple lo que pide el profesor, no se toca.
2. **No añadir info innecesaria**: el compañero es conciso (breve explicación + diagrama).
3. **Cada iteración**: auditar → corregir solo lo detectado → compilar → commit.
4. **Sin código fuente** en los anexos (lstlisting solo en Anexo VII para comandos Docker).
5. **Referencias a archivos del repo**, no incluir el código.
6. **Diagramas**: todos los referenciados deben existir como PNG.
