# 🗄️ Guía Completa de Configuración de Turso

Esta guía te llevará paso a paso para configurar Turso como base de datos para tu app Sealed en Netlify.

## 📋 ¿Qué es Turso?

Turso es una base de datos SQLite distribuida en el edge. Es perfecta para aplicaciones serverless como las que corren en Netlify.

---

## 🚀 Paso 1: Instalar Turso CLI

### En macOS/Linux:
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### En Windows (PowerShell):
```powershell
powershell -c "irm get.tur.so/install.ps1 | iex"
```

### Verificar instalación:
```bash
turso --version
```

---

## 🔐 Paso 2: Autenticarse

```bash
turso auth login
```

Esto abrirá tu navegador para que inicies sesión con GitHub.

---

## 📊 Paso 3: Crear tu Base de Datos

```bash
# Crear la base de datos
turso db create sealed-diary

# Verificar que se creó correctamente
turso db list
```

**Salida esperada:**
```
Name            Type      Location
sealed-diary    primary   [región más cercana]
```

---

## 🔗 Paso 4: Obtener Credenciales

### 4.1 - Obtener la URL de conexión:
```bash
turso db show sealed-diary --url
```

**Ejemplo de salida:**
```
libsql://sealed-diary-tu-usuario.turso.io
```

**Copia esta URL, la necesitarás para Netlify.**

### 4.2 - Crear y obtener el token de autenticación:
```bash
turso db tokens create sealed-diary
```

**Ejemplo de salida:**
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

**Copia este token, también lo necesitarás para Netlify.**

---

## 🏗️ Paso 5: Inicializar el Schema de la Base de Datos

### Opción A: Usando el shell interactivo (Recomendado)

```bash
# Abrir el shell de Turso
turso db shell sealed-diary
```

Ahora estarás en el prompt de SQLite. Copia y pega todo este bloque:

```sql
CREATE TABLE IF NOT EXISTS entries (
  id TEXT PRIMARY KEY,
  fid INTEGER NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  date INTEGER NOT NULL,
  word_count INTEGER DEFAULT 0,
  char_count INTEGER DEFAULT 0,
  is_sealed INTEGER DEFAULT 0,
  sealed_at INTEGER,
  tx_hash TEXT,
  content_hash TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_fid_date ON entries(fid, date DESC);
CREATE INDEX IF NOT EXISTS idx_sealed ON entries(is_sealed);
CREATE INDEX IF NOT EXISTS idx_fid_sealed ON entries(fid, is_sealed);

CREATE TABLE IF NOT EXISTS migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  applied_at INTEGER DEFAULT (unixepoch())
);
```

Para salir del shell, escribe:
```
.quit
```

### Opción B: Desde un archivo SQL

```bash
# Ejecutar el schema desde el archivo
turso db shell sealed-diary < scripts/turso-schema.sql
```

### Verificar que las tablas se crearon:

```bash
turso db shell sealed-diary
```

Luego ejecuta:
```sql
.tables
```

Deberías ver:
```
entries     migrations
```

---

## ⚙️ Paso 6: Configurar Variables de Entorno en Netlify

Ahora que tienes tus credenciales, configúralas en Netlify.

### Método 1: Desde el Dashboard de Netlify (Más fácil)

1. Ve a: https://app.netlify.com
2. Selecciona tu sitio "Sealed"
3. Ve a: **Site configuration** → **Environment variables**
4. Haz click en **Add a variable** y agrega estas 3 variables:

| Key | Value | Ejemplo |
|-----|-------|---------|
| `TURSO_DATABASE_URL` | [La URL que copiaste en paso 4.1] | `libsql://sealed-diary-usuario.turso.io` |
| `TURSO_AUTH_TOKEN` | [El token que copiaste en paso 4.2] | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` |
| `NEXT_PUBLIC_APP_URL` | [URL de tu sitio Netlify] | `https://sealed-diary.netlify.app` |

5. Guarda los cambios

### Método 2: Usando Netlify CLI

Si tienes Netlify CLI instalado:

```bash
# Asegúrate de estar en el directorio del proyecto
cd /home/user/Sealed

# Configurar las variables
netlify env:set TURSO_DATABASE_URL "libsql://sealed-diary-usuario.turso.io"
netlify env:set TURSO_AUTH_TOKEN "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9..."
netlify env:set NEXT_PUBLIC_APP_URL "https://tu-sitio.netlify.app"
```

---

## 🔄 Paso 7: Redesplegar en Netlify

Una vez configuradas las variables de entorno, tienes que redesplegar:

### Opción A: Trigger desde Git (Recomendado)

```bash
# Crear un commit vacío para triggear el deploy
git commit --allow-empty -m "Trigger redeploy with Turso config"
git push origin claude/sealed-diary-netlify-setup-011CV5t7B7zduXfWygETpmat
```

### Opción B: Desde el Dashboard de Netlify

1. Ve a: **Deploys** → **Trigger deploy** → **Deploy site**

---

## ✅ Paso 8: Verificar que Todo Funciona

Una vez que el deploy termine (toma ~2-3 minutos):

1. Ve a la URL de tu sitio: `https://tu-sitio.netlify.app`
2. Deberías ver la app cargando
3. Prueba crear una entrada de diario
4. Ve al Archive para ver tus entradas guardadas

---

## 🔍 Comandos Útiles de Turso

```bash
# Ver todas tus bases de datos
turso db list

# Ver detalles de una base de datos
turso db show sealed-diary

# Conectarse al shell
turso db shell sealed-diary

# Ver estadísticas de uso
turso db inspect sealed-diary

# Destruir una base de datos (¡cuidado!)
turso db destroy sealed-diary
```

---

## 📊 Consultas Útiles para Testing

Una vez en el shell (`turso db shell sealed-diary`):

```sql
-- Ver todas las entradas
SELECT * FROM entries;

-- Contar entradas por usuario
SELECT fid, COUNT(*) as total FROM entries GROUP BY fid;

-- Ver entradas selladas
SELECT * FROM entries WHERE is_sealed = 1;

-- Ver últimas 10 entradas
SELECT id, fid, substr(content, 1, 50) as preview, date
FROM entries
ORDER BY date DESC
LIMIT 10;
```

---

## 🆘 Troubleshooting

### Error: "No organization found"
```bash
turso auth login
# Asegúrate de completar el login en el navegador
```

### Error: "Database already exists"
```bash
# Si quieres empezar de cero:
turso db destroy sealed-diary
turso db create sealed-diary
```

### Ver logs en Netlify
1. Ve a **Deploys** → Click en el último deploy
2. Revisa la sección **Deploy log**
3. Busca errores relacionados con "TURSO" o "database"

---

## 💡 Tips

- **Gratis para empezar**: Turso tiene un tier gratuito generoso
- **Múltiples ubicaciones**: Puedes crear réplicas en diferentes regiones
- **Backups**: Turso hace backups automáticos
- **Local development**: Puedes seguir usando `file:local.db` localmente

---

¿Tienes algún problema con algún paso? ¡Avísame y te ayudo!
