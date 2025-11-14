# Sealed - Design Brief

## 🎯 Concepto
App minimalista de diario personal. Enfoque total en la escritura sin distracciones.

---

## 📱 Pantallas

### **1. Write (Principal)**
- **Header superior**: Fecha del día
- **Área de escritura**:
  - Texto grande, sin bordes
  - Placeholder: "Write your thoughts..."
  - Texto empieza desde ABAJO (crece hacia arriba)
- **Barra inferior fija**:
  - Izquierda: "X words • auto-saving..."
  - Derecha: Botón "Save" (negro) + "Seal Forever" (gris, solo después de guardar)

### **2. Archive**
- **Header**: Título "Archive"
- **Lista de entradas**: Cards verticales
  - Fecha
  - Preview del texto (primeras líneas)
  - "X words"
  - Badge "Sealed" si está sellada

### **3. Stats**
- **Header**: Título "Stats"
- **Cards con números**:
  - Total de entradas
  - Total de palabras
  - Entradas selladas

### **Navegación**
- **Hamburger menu** arriba derecha (☰)
- Al abrir: menú slide-in desde derecha
- Items: Write, Archive, Stats

---

## 🎨 Estilo Visual

**Colores:**
- Background: Blanco puro (#FFFFFF)
- Texto: Negro (#000000 o #1A1A1A)
- Texto secundario: Gris (#999999)
- Botón principal: Negro sólido
- Botón secundario: Gris claro (#F5F5F5)

**Tipografía:**
- Fuente: Sistema (sans-serif limpia)
- Editor: 18px, line-height relajado
- Headers: 16px

**Forma:**
- Sin border-radius (todo cuadrado/sharp)
- Sin sombras
- Sin bordes decorativos
- Botones: grandes, rectangulares (padding: 12px 32px)

**Espaciado:**
- Mucho espacio en blanco
- Padding generoso
- Elementos respiran

---

## 📐 Layout

**Write (pantalla principal):**
```
┌─────────────────────────┐
│ ☰                       │ <- Nav hamburger
│                         │
│ November 14, 2025       │ <- Fecha
│                         │
├─────────────────────────┤
│                         │
│                         │
│                         │
│                         │
│  [Área de escritura]    │ <- Texto empieza abajo
│  Texto aquí...          │
│                         │
├─────────────────────────┤
│ 245 words               │ <- Barra fija
│           [Save] [Seal] │
└─────────────────────────┘
```

**Archive:**
```
┌─────────────────────────┐
│ ☰        Archive        │
├─────────────────────────┤
│ ┌─────────────────────┐ │
│ │ Nov 13, 2025        │ │
│ │ Today I wrote...    │ │
│ │ 189 words  [Sealed] │ │
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Nov 12, 2025        │ │
│ │ Yesterday was...    │ │
│ │ 234 words           │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

## ✨ Detalles de Interacción

**Botón "Save":**
- Siempre visible
- Negro sólido
- Hover: gris oscuro

**Botón "Seal Forever":**
- Aparece solo DESPUÉS de guardar
- Con animación fade-in suave
- Gris claro
- Hover: gris medio

**Auto-save indicator:**
- "• auto-saving..." aparece junto a word count
- Texto gris claro
- Desaparece cuando termina

**Entry cards (Archive):**
- Fondo blanco
- Border fino gris claro
- Padding interno
- Hover: background gris muy claro

---

## 📱 Mobile First

**Prioridades:**
- Texto empieza desde abajo
- Botones siempre visibles (fixed bottom)
- No scroll horizontal
- Touch targets grandes (min 44px)
- Navegación no ocupa espacio (hamburger)

---

## 🎯 Inspiración de Estilo

**Referencias:**
- iA Writer: Minimalismo, enfoque en escritura
- Bear: Limpio, tipografía clara
- Notion: Espaciado generoso
- Apple Notes: Simplicidad

**Palabras clave:**
- Minimalista
- Limpio
- Sin distracciones
- Espacioso
- Blanco/negro
- Sharp edges (no redondeado)
- Modern brutalism light
