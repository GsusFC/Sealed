# Sealed - Descripción de la Aplicación

## 🔐 ¿Qué es Sealed?

Sealed es una aplicación de diario personal minimalista construida como Farcaster Mini App. Permite a los usuarios escribir entradas diarias privadas que pueden ser selladas permanentemente en la blockchain de Base L2 para crear un registro inmutable de sus pensamientos.

## 🎯 Propósito

- **Escritura privada y segura**: Diario personal con autenticación mediante Farcaster
- **Permanencia blockchain**: Opción de sellar entradas en Base L2 de forma permanente
- **Minimalismo**: Enfoque total en la experiencia de escritura sin distracciones
- **Auto-guardado**: Protección automática contra pérdida de contenido

## 📱 Secciones de la App

### 1. **Write (Página Principal)**
**Ruta:** `/`
**Propósito:** Escribir la entrada del día

**Componentes:**
- **Editor de texto**: Área grande de escritura sin bordes, texto empieza desde abajo
- **Fecha actual**: Muestra la fecha de la entrada (parte superior)
- **Contador de palabras**: Muestra cantidad de palabras escritas
- **Indicador de auto-save**: Muestra "• auto-saving..." cuando guarda automáticamente
- **Botón "Save"**: Guarda manualmente la entrada (siempre visible abajo)
- **Botón "Seal Forever"**: Aparece SOLO después de guardar, permite sellar en blockchain
- **Badge "Sealed"**: Se muestra si la entrada ya fue sellada

**Funcionalidad:**
- Auto-save cada 30 segundos
- Una entrada por día
- Si ya escribiste hoy, carga la entrada existente
- Las entradas selladas no se pueden editar

**Layout actual:**
- Header arriba: fecha y estado (sealed/unsealed)
- Área de escritura: ocupa la mayor parte, texto crece de abajo hacia arriba
- Barra inferior fija: contador de palabras + botones Save/Seal
- Navegación: Hamburger menu arriba a la derecha

---

### 2. **Archive**
**Ruta:** `/archive`
**Propósito:** Ver historial de entradas pasadas

**Componentes:**
- **Lista de entradas**: Ordenadas por fecha (más reciente primero)
- **Cada entrada muestra:**
  - Fecha
  - Primeras líneas del contenido (preview)
  - Contador de palabras
  - Badge "Sealed" si está sellada en blockchain

**Funcionalidad:**
- Ver todas tus entradas pasadas
- Click en una entrada para verla completa
- Las selladas tienen indicador visual especial
- Scroll infinito (o paginación)

**Layout actual:**
- Header: título "Archive"
- Cards de entradas en lista vertical
- Cada card tiene fecha, preview, word count, badge

---

### 3. **Stats**
**Ruta:** `/stats`
**Propósito:** Ver estadísticas de escritura

**Componentes:**
- **Total de entradas**: Cuántas entradas has escrito
- **Total de palabras**: Suma de todas las palabras escritas
- **Total de caracteres**: Suma de todos los caracteres
- **Entradas selladas**: Cuántas has sellado en blockchain

**Funcionalidad:**
- Visualización de métricas de escritura
- Datos calculados desde la base de datos
- Actualización en tiempo real

**Layout actual:**
- Header: título "Stats"
- Cards con números grandes
- Grid de 2x2 o lista vertical

---

## 🎨 Navegación

**Tipo:** Hamburger menu (menú hamburguesa)
**Posición:** Top-right (arriba a la derecha)
**Estilo:** Menú que se desliza desde la derecha

**Items del menú:**
1. Write (📝)
2. Archive (📚)
3. Stats (📊)

---

## 🔒 Autenticación

**Método:** Sign In With Farcaster (SIWF)
**Flow:**
1. Usuario abre la app en Warpcast/Base App
2. Primera vez: se le pide firmar un mensaje
3. Se genera un JWT que dura 7 días
4. El JWT se guarda en localStorage
5. Todas las API calls usan el JWT

**Seguridad:**
- Solo puedes ver/editar TUS entradas
- APIs protegidas con verificación de FID
- Sin token válido = sin acceso

---

## 💾 Datos y Persistencia

**Base de datos:** Turso (SQLite)

**Tabla principal: `entries`**
- `id`: UUID único
- `fid`: Farcaster ID del usuario
- `content`: Texto de la entrada
- `date`: Timestamp de creación
- `word_count`: Cantidad de palabras
- `char_count`: Cantidad de caracteres
- `is_sealed`: Boolean (sellada o no)
- `sealed_at`: Timestamp de sellado
- `tx_hash`: Hash de transacción blockchain
- `content_hash`: Hash del contenido para verificación

**Auto-save:**
- Trigger: 30 segundos después del último cambio
- Silencioso: no interrumpe la escritura
- Indicador visual: "• auto-saving..."

---

## ⛓️ Blockchain (Base L2)

**Contrato:** SealedDiary.sol

**Función principal:** `seal()`
- Recibe: FID, content hash, word count
- Almacena: Hash del contenido (NO el texto completo)
- Emite: Evento `EntrySealed`
- Inmutable: Una vez sellado, no se puede modificar

**Por qué sellar:**
- Prueba permanente de que escribiste algo en una fecha
- Inmutable: nadie puede cambiarlo (ni tú)
- Verificable: cualquiera puede verificar el hash
- Privacidad: solo se guarda el hash, no el contenido

---

## 🎯 User Flow Completo

**Día 1 (primera vez):**
1. Abre app en Warpcast → Farcaster pide firma
2. Usuario firma → JWT generado
3. App carga pantalla de Write (vacía)
4. Usuario escribe su entrada
5. Espera 30s → auto-save automático
6. O click "Save" manualmente
7. Aparece botón "Seal Forever"
8. (Opcional) Click "Seal Forever" → entrada sellada en blockchain

**Día 2 (segunda entrada):**
1. Abre app → JWT válido, no pide firma
2. Pantalla Write vacía (nueva entrada de hoy)
3. Escribe → auto-save → save → seal

**Revisando el pasado:**
1. Hamburger menu → Archive
2. Ve lista de entradas pasadas
3. Click en una entrada → ver completa
4. Ve badge "Sealed" en las selladas

**Viendo estadísticas:**
1. Hamburger menu → Stats
2. Ve total de entradas, palabras, caracteres, selladas

---

## 🎨 Diseño Actual

**Estilo:** Minimalista, blanco/negro
**Colores:**
- Background: Blanco (#FFFFFF)
- Texto: Negro (#000000)
- Secundario: Gris (#999999)
- Botón primario: Negro
- Botón secundario: Gris claro

**Tipografía:**
- Font: Sistema (inherit)
- Tamaño editor: text-lg (18px)
- Line height: leading-relaxed

**Características visuales:**
- Sin border-radius (todo cuadrado/sharp)
- Sin sombras
- Sin bordes en el textarea
- Botones grandes (px-8 py-3)
- Mucho espacio en blanco

**Mobile-first:**
- Texto empieza desde abajo
- Botones siempre visibles en parte inferior
- Navegación hamburger para no ocupar espacio
- Padding extra para no quedar oculto

---

## 🚀 Features Técnicas

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- @farcaster/miniapp-sdk

**Backend:**
- Next.js API Routes
- JWT authentication (jose)
- Turso/SQLite database

**Blockchain:**
- Base L2
- viem library
- Smart contract: SealedDiary.sol

**Deployment:**
- Netlify
- Auto-deploy en push a GitHub
- Environment variables en Netlify

---

## 📝 Notas de Implementación

**Auto-save:**
- useEffect con setTimeout de 30s
- Se resetea cada vez que cambia el contenido
- Solo guarda si hay contenido válido

**Botón "Seal Forever":**
- Estado local: `showSealButton`
- Se activa en `true` solo después de Save exitoso
- Lógica: Write → Save → Seal aparece

**Autenticación:**
- Context API para manejar token globalmente
- LocalStorage para persistencia
- Todas las API calls incluyen Authorization header

**Protección de datos:**
- Backend verifica que FID del JWT === FID solicitado
- Imposible acceder a datos de otros usuarios
- APIs retornan 403 Forbidden si intentas acceder datos ajenos
