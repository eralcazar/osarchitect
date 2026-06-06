# Railway Setup — Deployment Completo

## ✅ PASO 1: Crear Proyecto en Railway

1. Ve a https://railway.app
2. Click **"New Project"**
3. Selecciona **"Provision PostgreSQL"**
4. Espera a que se cree (2-3 min)

## ✅ PASO 2: Copiar Credenciales

En Railway dashboard:
1. Click en **"PostgreSQL"**
2. Ve a **"Connect"**
3. Copia la URL en formato: `postgresql://user:password@host:5432/railway`
4. Guarda esa URL — la usarás en `.env.local`

## ✅ PASO 3: Configurar Variables de Entorno

### En tu máquina local (backend/.env.local):
```
DATABASE_URL=postgresql://...   # De Railway
ANTHROPIC_API_KEY=sk-ant-...    # Tu clave Claude
OPENAI_API_KEY=sk-...           # Tu clave OpenAI
NODE_ENV=development
PORT=3000
```

### En Railway (environment variables):
1. Click en tu proyecto Railway
2. Click en **"Variables"** (Settings)
3. Agrega las mismas variables (excepto PORT)

## ✅ PASO 4: Aplicar Migraciones

### En tu máquina, conecta a PostgreSQL:
```bash
# Instala psql si no lo tienes: https://www.postgresql.org/download/

# Ejecuta las migraciones
psql "postgresql://user:password@host:5432/railway" < backend/migrations/001_init.sql

# Verifica (debería mostrar tablas):
psql "postgresql://user:password@host:5432/railway" -c "\dt"
```

## ✅ PASO 5: Deploy en Railway

### Opción A: Desde Railway UI (Recomendado)
1. Conecta tu GitHub: Click **"Connect GitHub"**
2. Selecciona tu repo: `eralcazar/osarchitect`
3. Railway auto-detecta Dockerfile
4. Click **"Deploy"**

### Opción B: Desde Terminal (Git Push Deploy)
```bash
cd backend
railway login
railway link
git push origin main
# Railway auto-deploya
```

## ✅ PASO 6: Verificar Deploy

```bash
# Ver logs en vivo
railway logs

# Obtener URL pública
railway open
# Copia la URL (ej: erp-os-prod-xxx.railway.app)

# Testa health endpoint
curl https://erp-os-prod-xxx.railway.app/health
# Debería devolver: {"status":"ok","timestamp":"..."}
```

## ✅ PASO 7: Conectar Frontend a Producción

Actualiza `frontend/.env.local`:
```
VITE_API_URL=https://erp-os-prod-xxx.railway.app
```

---

## 🚨 Troubleshooting

### "Database connection refused"
- Verifica DATABASE_URL en Railway
- Asegúrate que migraciones corrieron

### "API key invalid"
- Chequea ANTHROPIC_API_KEY y OPENAI_API_KEY
- Sin espacios ni caracteres raros

### "502 Bad Gateway"
- Espera 2-3 min a que se estabilice
- Check logs: `railway logs`

---

## 🎯 Checklist Final

- [ ] PostgreSQL creado en Railway
- [ ] Migraciones aplicadas
- [ ] Variables de entorno configuradas (local + Railway)
- [ ] Backend deployado
- [ ] Health endpoint responde
- [ ] Frontend conectado a producción URL

