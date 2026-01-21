# Sistema de Autenticación - NestJS

Este documento describe el sistema de autenticación implementado con JWT y cookies.

## Características

- ✅ Registro de nuevos usuarios
- ✅ Inicio de sesión con email y contraseña
- ✅ Cierre de sesión
- ✅ Tokens JWT almacenados en cookies HTTP-only
- ✅ Protección de rutas con guards
- ✅ Validación de datos con class-validator
- ✅ Hashing de contraseñas con bcrypt
- ✅ Soporte para PostgreSQL con TypeORM

## Endpoints de Autenticación

### Registro
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Logout
```
POST /auth/logout
```

### Perfil de Usuario (Protegido)
```
GET /auth/profile
Authorization: Bearer <token> (automático desde cookie)
```

## Endpoints de Usuarios

### Crear Usuario (Público)
```
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

### Listar Todos los Usuarios (Protegido)
```
GET /users
Authorization: Bearer <token> (automático desde cookie)
```

### Obtener Usuario por ID (Protegido)
```
GET /users/:id
Authorization: Bearer <token> (automático desde cookie)
```

### Actualizar Usuario (Protegido)
```
PATCH /users/:id
Content-Type: application/json
Authorization: Bearer <token> (automático desde cookie)

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### Eliminar Usuario (Protegido)
```
DELETE /users/:id
Authorization: Bearer <token> (automático desde cookie)
```

## Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=village_manager

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

### Configuración de Cookies

Las cookies de autenticación tienen las siguientes características:
- `httpOnly`: true (protección contra XSS)
- `secure`: true en producción (solo HTTPS)
- `sameSite`: 'strict' (protección CSRF)
- `maxAge`: 24 horas

## Estructura del Módulo

```
src/auth/
├── auth.module.ts          # Módulo principal
├── auth.controller.ts      # Controlador de endpoints de autenticación
├── auth.service.ts         # Lógica de negocio de autenticación
├── users.controller.ts     # Controlador de endpoints de usuarios
├── users.service.ts        # Lógica de negocio de usuarios
├── entities/
│   └── user.entity.ts     # Entidad de usuario
├── dto/
│   ├── login.dto.ts        # DTO para login
│   ├── register.dto.ts     # DTO para registro
│   ├── create-user.dto.ts   # DTO para crear usuario
│   └── update-user.dto.ts   # DTO para actualizar usuario
├── strategies/
│   ├── jwt.strategy.ts     # Estrategia JWT
│   └── local.strategy.ts   # Estrategia local
├── guards/
│   ├── jwt-auth.guard.ts   # Guard JWT
│   └── local-auth.guard.ts # Guard local
└── decorators/
    └── public.decorator.ts # Decorador para rutas públicas
```

## Uso en Controladores

### Rutas Públicas
```typescript
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Post('register')
async register(@Body() registerDto: RegisterDto) {
  // ...
}
```

### Rutas Protegidas
```typescript
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Req() req: any) {
  return { user: req.user };
}
```

## Flujo de Autenticación

1. **Registro**: Usuario crea cuenta → Contraseña hasheada → Token JWT generado → Cookie establecida
2. **Login**: Usuario envía credenciales → Validación → Token JWT generado → Cookie establecida
3. **Acceso a rutas protegidas**: Cookie enviada automáticamente → Token validado → Usuario disponible en request
4. **Logout**: Cookie eliminada → Sesión terminada

## Seguridad

- Las contraseñas se hashean con bcrypt (salt rounds: 10)
- Los tokens JWT expiran en 24 horas
- Las cookies son HTTP-only y secure en producción
- Validación de datos en todos los endpoints
- Protección CSRF con sameSite: 'strict'

## Base de Datos

La tabla `users` se crea automáticamente con:
- `id` (Primary Key)
- `email` (Unique)
- `password` (Hashed)
- `name`
- `createdAt`
- `updatedAt`

## Ejemplo de Uso con Frontend

```javascript
// Login
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Importante para cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Acceder a ruta protegida
const profileResponse = await fetch('http://localhost:3001/auth/profile', {
  credentials: 'include' // Cookies enviadas automáticamente
});
