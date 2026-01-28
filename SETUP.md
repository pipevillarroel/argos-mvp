## 🚀 Guía de Configuración - ARGOS MVP

### Base de Datos

Tu base de datos SQLite está configurada en `prisma/schema.prisma` con los siguientes modelos:

**Usuarios:**
- `id`: ID único
- `email`: Email único
- `password`: Contraseña hasheada
- `name`: Nombre del usuario
- `role`: "MANAGER" o "WORKER"

**Gastos (Expenses):**
- `id`: ID único
- `description`: Descripción del gasto
- `amount`: Monto del gasto
- `category`: Categoría (Combustible, Comida, etc.)
- `date`: Fecha/hora del gasto
- `userId`: ID del trabajador que lo creó

**Ventas (Sales):**
- `id`: ID único
- `description`: Descripción de la venta
- `amount`: Monto de la venta
- `date`: Fecha/hora de la venta
- `userId`: ID del trabajador que lo creó

---

### Endpoints API

#### 🔐 **Autenticación**

**POST `/api/auth/register`** - Registrar un nuevo usuario
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Juan Pérez",
  "role": "WORKER"  // opcional, por defecto es "WORKER"
}
```

**POST `/api/auth/login`** - Login
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Respuesta:
```json
{
  "ok": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Juan Pérez",
    "role": "WORKER"
  }
}
```

**GET `/api/seed`** - Crear usuarios de prueba
- Manager: `manager@argos.cl` / `manager123`
- Worker: `worker@argos.cl` / `worker123`

---

#### 💰 **Gastos (WORKER)**

**GET `/api/expenses`** - Obtener gastos del día del usuario
Respuesta:
```json
{
  "ok": true,
  "expenses": [...],
  "total": 250.50
}
```

**POST `/api/expenses`** - Agregar un gasto
```json
{
  "description": "Combustible",
  "amount": 50.00,
  "category": "Combustible"  // opcional
}
```

---

#### 🛍️ **Ventas (WORKER)**

**GET `/api/sales`** - Obtener ventas del día del usuario
Respuesta:
```json
{
  "ok": true,
  "sales": [...],
  "total": 1500.00
}
```

**POST `/api/sales`** - Agregar una venta
```json
{
  "description": "Venta de productos",
  "amount": 150.00
}
```

---

#### 📊 **Reportes (MANAGER)**

**GET `/api/reports`** - Ver todos los gastos y ventas del día
Respuesta:
```json
{
  "ok": true,
  "date": "2026-01-27",
  "summary": {
    "totalExpenses": 250.50,
    "totalSales": 3500.00,
    "netProfit": 3249.50
  },
  "expenses": [...],
  "sales": [...],
  "workerSummary": [
    {
      "name": "Carlos Worker",
      "email": "worker@argos.cl",
      "expenses": 150.00,
      "sales": 2000.00,
      "profit": 1850.00
    }
  ]
}
```

---

### 🧪 Pruebas Rápidas

1. **Crear usuarios de prueba:**
   ```bash
   curl http://localhost:3000/api/seed
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"worker@argos.cl","password":"worker123"}'
   ```

3. **Agregar gasto:**
   ```bash
   curl -X POST http://localhost:3000/api/expenses \
     -H "Content-Type: application/json" \
     -d '{"description":"Combustible","amount":50,"category":"Combustible"}'
   ```

4. **Ver reportes (como jefe):**
   ```bash
   curl http://localhost:3000/api/reports
   ```

---

### 🎨 Próximos Pasos

1. ✅ **Base de datos configurada** - Modelos creados, migraciones aplicadas
2. ✅ **API completa** - Todos los endpoints funcionando
3. ⏭️ **Frontend para WORKER** - Agregar gastos y ventas
4. ⏭️ **Frontend para MANAGER** - Ver reportes del día
5. ⏭️ **Diseño responsive** - Móvil y desktop
6. ⏭️ **Mejorar autenticación** - JWT, tokens refresh, etc.

---

### 📱 Stack Tecnológico

- **Framework:** Next.js 16.1.6
- **BD:** SQLite + Prisma ORM
- **Autenticación:** bcryptjs + cookies HTTP-only
- **Styling:** Tailwind CSS 4
- **Gráficos:** Tremor (opcional)
- **Lenguaje:** TypeScript

¡Tu MVP está lista para desarrollar las interfaces! 🎉
