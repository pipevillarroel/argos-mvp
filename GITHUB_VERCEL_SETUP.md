# 📋 Guía Completa: GitHub + Vercel Deploy

## ✅ Lo que ya está hecho:

Tu proyecto está completamente funcional con:
- ✅ Base de datos SQLite con Prisma
- ✅ Autenticación (Login/Registro)
- ✅ Dashboard Worker (agregar gastos y ventas)
- ✅ Dashboard Manager (reportes del día)
- ✅ API REST completa
- ✅ Diseño responsive (móvil y desktop)
- ✅ Git repository inicializado
- ✅ Último commit: "feat: MVP completo"

## 🚀 Para subir a GitHub:

### Opción A: Si YA tienes repositorio en GitHub

```powershell
cd "c:\Users\felip\Desktop\MisProyectos\argospipe\argos-mvp"

# Actualizar el remote (reemplaza TU_USUARIO)
git remote set-url origin https://github.com/TU_USUARIO/argos-mvp.git

# Cambiar rama a main
git branch -M main

# Push
git push -u origin main
```

### Opción B: Si NO tienes repositorio en GitHub

1. Crea uno nuevo en https://github.com/new
   - Nombre: `argos-mvp`
   - NO inicialices con README (ya tienes uno)
   - Crea el repo

2. Ejecuta en PowerShell:
```powershell
cd "c:\Users\felip\Desktop\MisProyectos\argospipe\argos-mvp"

git remote add origin https://github.com/TU_USUARIO/argos-mvp.git
git branch -M main
git push -u origin main
```

## 🔗 Deploy en Vercel:

1. Ve a https://vercel.com
2. Clic en "New Project" o "Add New..."
3. Selecciona "Import Git Repository"
4. Busca y selecciona `argos-mvp`
5. Clic en "Import"

### Configuración en Vercel:

- **Framework:** Next.js (detectado automáticamente)
- **Root Directory:** `./argos-mvp` (IMPORTANTE)
- **Environment Variables:** 
  - DATABASE_URL: `file:./dev.db`

6. Clic en "Deploy"

## ⏳ Espera (2-3 minutos)

## ✅ ¡Listo!

Tu app estará en:
- https://TU_PROYECTO.vercel.app/login

## 📱 Para acceder desde móvil:

1. En tu celular, abre cualquier navegador
2. Ve a: https://TU_PROYECTO.vercel.app
3. ¡Funciona perfecto!

## 🧪 Probar después del deploy:

1. Ve a: https://TU_PROYECTO.vercel.app/api/seed
   - Verás: `{"ok":true,"message":"Users seeded successfully",...}`

2. Login en: https://TU_PROYECTO.vercel.app/login
   - Email: worker@argos.cl
   - Contraseña: worker123

3. ¡Prueba agregar gastos y ventas!

## ❓ Preguntas?

Los archivos de referencia:
- `DEPLOY.md` - Instrucciones detalladas
- `SETUP.md` - Info técnica del MVP
- `REGISTRO.md` - Info del formulario de registro
