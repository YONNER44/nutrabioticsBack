# Nutrabiotics — Backend API

NestJS REST API con autenticación JWT, RBAC (3 roles) y gestión de prescripciones médicas.

## Stack

- **NestJS 11** + TypeScript
- **Prisma ORM v5** + PostgreSQL 16
- **JWT** (access + refresh token rotation)
- **bcryptjs** para hashing de contraseñas
- **PDFKit** para generación de PDFs
- **Helmet** + **throttler** para seguridad

## Requisitos previos

- Node.js v18+
- PostgreSQL 16 corriendo en `localhost:5432`

## Instalación y arranque

> **Paso previo obligatorio**: Asegúrate de que el servicio **postgresql-x64-16** esté corriendo (se inicia automáticamente con Windows). Puedes verificarlo con `Get-Service postgresql-x64-16` en PowerShell.

```bash
# Instalar dependencias
npm install

# Crear la base de datos (si no existe)
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -h 127.0.0.1 -c "CREATE DATABASE nutrabiotics;"

# Ejecutar migraciones
npx prisma migrate dev --name init

# Poblar con datos de prueba
npx ts-node prisma/seed.ts

# Iniciar en modo desarrollo
npm run start:dev
```

El servidor escucha en **http://localhost:3001**.

## Credenciales de prueba

| Rol      | Email            | Contraseña |
|----------|------------------|------------|
| Admin    | admin@test.com   | admin123   |
| Médico   | dr@test.com      | dr123      |
| Paciente | patient@test.com | patient123 |

## Endpoints principales

### Auth
| Método | Ruta               | Descripción                   |
|--------|--------------------|-------------------------------|
| POST   | /api/auth/login    | Login — devuelve tokens JWT   |
| POST   | /api/auth/refresh  | Renovar access token          |
| GET    | /api/auth/profile  | Perfil del usuario autenticado |

### Médico
| Método | Ruta                         | Descripción                 |
|--------|------------------------------|-----------------------------|
| POST   | /api/prescriptions           | Crear prescripción          |
| GET    | /api/prescriptions           | Listar mis prescripciones   |
| GET    | /api/prescriptions/:id       | Detalle de una prescripción |
| GET    | /api/prescriptions/:id/pdf   | Descargar PDF               |

### Paciente
| Método | Ruta                           | Descripción              |
|--------|--------------------------------|--------------------------|
| GET    | /api/me/prescriptions          | Mis prescripciones       |
| GET    | /api/prescriptions/:id         | Detalle de prescripción  |
| PUT    | /api/prescriptions/:id/consume | Marcar como consumida    |
| GET    | /api/prescriptions/:id/pdf     | Descargar PDF            |

### Admin
| Método | Ruta                       | Descripción                        |
|--------|----------------------------|------------------------------------|
| GET    | /api/admin/prescriptions   | Todas las prescripciones (filtros) |
| GET    | /api/admin/metrics         | Métricas para el dashboard         |
| GET    | /api/users                 | Listar usuarios (con filtros)      |
| POST   | /api/users                 | Crear usuario                      |
| GET    | /api/users/:id             | Detalle de un usuario              |

### Compartidos (Admin, Médico, Paciente)
| Método | Ruta                       | Acceso                    | Descripción                   |
|--------|----------------------------|---------------------------|-------------------------------|
| GET    | /api/doctors               | admin, médico, paciente   | Listar médicos (paginado)     |
| GET    | /api/patients              | admin, médico             | Listar pacientes (paginado)   |

## Scripts de npm

```bash
npm run start:dev   # Desarrollo con hot-reload
npm run build       # Compilar TypeScript
npm run start:prod  # Producción (requiere build previo)
npm run test        # Tests unitarios
npm run test:cov    # Tests con cobertura
```

## Variables de entorno (.env)

Copia `.env.example` a `.env` y ajusta los valores:

```env
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/nutrabiotics"
JWT_ACCESS_SECRET=super_secret_access_key
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_ACCESS_TTL=900s
JWT_REFRESH_TTL=7d
PORT=3001
APP_ORIGIN=http://localhost:3000
```

## Documentación Swagger

Con el servidor en marcha, accede a **http://localhost:3001/docs** para explorar todos los endpoints de forma interactiva.
Haz click en *Authorize* e introduce el `accessToken` obtenido en `/api/auth/login`.

## Decisiones técnicas

### Base de datos: PostgreSQL 16
Se usa PostgreSQL tal como indica el spec. El schema Prisma utiliza los tipos nativos de PostgreSQL. La conexión usa `127.0.0.1` en lugar de `localhost` para evitar problemas de resolución IPv6 en Windows.

### Autenticación: JWT Bearer con rotación de refresh tokens
Se eligió **Bearer token** (header `Authorization`) en lugar de HTTP-Only cookies para simplicidad en el contexto de una API REST consumida por un SPA. El access token dura 15 min (900 s) y el refresh token 7 días. En cada `/auth/refresh` se revoca el token anterior y se emite uno nuevo (rotación), almacenando los refresh tokens en la tabla `RefreshToken` de la BD con campos `revoked` y `expiresAt`.

### RBAC: Guards + Decorators
`RolesGuard` lee los metadatos asignados por el decorador `@Roles('admin' | 'doctor' | 'patient')` mediante `Reflector` de NestJS. El guard se aplica globalmente después del `JwtAuthGuard`, garantizando que toda ruta protegida valide primero el token y luego el rol.

### Generación de PDF: PDFKit
Se eligió **PDFKit** (nativo Node.js, sin headless browser) por su bajo footprint en memoria y no requerir Chromium. El PDF incluye datos del paciente, médico, código de prescripción, fecha, lista de ítems (nombre, dosis, cantidad, instrucciones) y estado actual.

### Paginación y filtros
Todos los listados aceptan `?page=&limit=&order=asc|desc&status=&from=&to=`. Los parámetros se validan con DTOs (`class-validator`). El ordenamiento por defecto es `createdAt DESC`. Los filtros de fecha usan `gte`/`lte` en Prisma sobre el campo `createdAt`.

### Métricas: `$queryRaw` con Prisma.sql
La agrupación por día usa `TO_CHAR("createdAt", 'YYYY-MM-DD')` con `Prisma.sql` para evitar SQL injection (sintaxis PostgreSQL). Las demás métricas (totales, por estado, top médicos) usan las API de alto nivel de Prisma (`count`, `groupBy`).

### Soft delete
`User` y `Prescription` tienen `deletedAt DateTime?`. Todas las queries filtran `deletedAt: null` para excluir registros borrados lógicamente, sin eliminar datos de la BD.

## URLs de producción

- **API**: `https://nutrabioticsback-production.up.railway.app/api`
- **Swagger**: `https://nutrabioticsback-production.up.railway.app/docs`
