# API Aves y Naturaleza — Referencia

Base URL: `https://avesynaturaleza.travel/api/v1`
Dev URL:  `http://localhost:4000/api/v1`

## Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Iniciar sesión | No |
| POST | `/auth/register` | Registrar cliente | No |
| POST | `/auth/refresh` | Renovar tokens | No |
| POST | `/auth/logout` | Cerrar sesión | Sí |
| POST | `/auth/logout-all` | Cerrar todas las sesiones | Sí |
| PUT  | `/auth/change-password` | Cambiar contraseña | Sí |
| GET  | `/auth/me` | Obtener usuario actual | Sí |

### Login — Body
```json
{ "email": "admin@avesynaturaleza.travel", "password": "Admin2024!" }
```

### Login — Response
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "admin", ... },
    "tokens": {
      "accessToken": "eyJ...",
      "refreshToken": "eyJ..."
    }
  }
}
```

---

## Usuarios

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | Listar usuarios | admin |
| GET | `/users/stats` | Estadísticas | admin |
| POST | `/users` | Crear usuario | admin |
| GET | `/users/:id` | Ver usuario | admin, propio |
| PUT | `/users/:id` | Actualizar | admin, propio |
| PATCH | `/users/:id/status` | Activar/desactivar | admin |
| PUT | `/users/:id/freelance-profile` | Perfil revendedor | admin, freelance |
| PUT | `/users/:id/aliado-profile` | Perfil aliado | admin, aliado |

---

## Tours

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/tours` | Listar tours | Público |
| GET | `/tours/:id` | Ver tour | Público |
| GET | `/tours/:id/availability` | Disponibilidad | Público |
| POST | `/tours` | Crear tour | admin |
| PUT | `/tours/:id` | Actualizar | admin |
| PATCH | `/tours/:id/toggle` | Activar/desactivar | admin |
| PUT | `/tours/:id/availability` | Upsert disponibilidad | admin |
| POST | `/tours/:id/availability/bulk` | Crear múltiples fechas | admin |

### Query params (GET /tours)
- `type`: pasadia | 1n2d | 2n3d | multidia
- `destination`: filtro texto
- `featured`: true
- `active`: true | false | all
- `page`, `limit`

---

## Reservas

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/reservas` | Listar (filtrado por rol) | Todos |
| GET | `/reservas/stats` | Estadísticas por rol | Todos |
| GET | `/reservas/:id` | Ver reserva | Todos |
| POST | `/reservas` | Crear reserva | Todos |
| PUT | `/reservas/:id` | Actualizar estado | admin |
| POST | `/reservas/:id/payments` | Registrar pago | admin |
| POST | `/reservas/:id/cancel` | Cancelar | admin, cliente |

### Crear reserva — Body
```json
{
  "tourId": "uuid",
  "availabilityId": "uuid",
  "freelanceCode": "ANDREAF-AVN",
  "numAdults": 2,
  "numChildren": 0,
  "departureCity": "Manizales",
  "contactName": "Juan Pérez",
  "contactPhone": "3001234567",
  "contactEmail": "juan@email.com",
  "specialRequests": "Dieta vegetariana"
}
```

---

## Comisiones

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/comisiones` | Listar comisiones | admin, freelance |
| GET | `/comisiones/summary/:id?` | Resumen por freelance | admin, freelance |
| POST | `/comisiones/mark-paid` | Marcar como pagadas | admin |

---

## Aliados

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/aliados` | Listar aliados | admin |
| GET | `/aliados/my-services` | Mis servicios | aliado |
| GET | `/aliados/stats` | Estadísticas | aliado, admin |
| PATCH | `/aliados/:id/verify` | Verificar aliado | admin |

---

## Headers requeridos

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

## Respuesta estándar

```json
{ "success": true, "data": {...}, "message": "..." }
```

## Paginación

```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

## Códigos de error

| Código | Significado |
|--------|-------------|
| 400 | Datos inválidos |
| 401 | No autenticado / token expirado |
| 403 | Sin permiso para este recurso |
| 404 | No encontrado |
| 409 | Conflicto (email duplicado, etc) |
| 500 | Error del servidor |
