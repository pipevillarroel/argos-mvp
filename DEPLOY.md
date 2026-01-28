# 🚀 Deploy en Vercel

## Paso 1: Push a GitHub

```bash
# Desde la carpeta del proyecto
cd c:\Users\felip\Desktop\MisProyectos\argospipe\argos-mvp

# Agregar remote (si no lo has hecho)
git remote add origin https://github.com/TU_USUARIO/argos-mvp.git

# O si ya existe, actualizar
git remote set-url origin https://github.com/TU_USUARIO/argos-mvp.git

# Push
git branch -M main
git push -u origin main
```

## Paso 2: Crear Proyecto en Vercel

1. Ve a https://vercel.com/new
2. Importa tu repositorio `TU_USUARIO/argos-mvp`
3. Haz clic en "Import"

## Paso 3: Configurar Variables de Entorno

En Vercel:
- Framework Preset: **Next.js**
- Root Directory: **./argos-mvp** (si es necesario)

## Paso 4: Deploy

1. Haz clic en "Deploy"
2. Espera a que termine (unos 2-3 minutos)
3. ¡Listo!

## ✅ URLs de Acceso

Después del deploy:
- **Producción:** https://tu-proyecto.vercel.app
- **Login:** https://tu-proyecto.vercel.app/login
- **Crear usuarios:** https://tu-proyecto.vercel.app/api/seed

## 📱 Desde tu Móvil

1. Abre el navegador en tu móvil
2. Ve a tu URL de Vercel
3. ¡Ya funciona responsive!

## 🔐 Credenciales de Prueba

Después de llamar a `/api/seed`:
- Manager: manager@argos.cl / manager123
- Worker: worker@argos.cl / worker123
