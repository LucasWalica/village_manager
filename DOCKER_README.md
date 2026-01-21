# 🐳 Docker Setup - Village Manager

Esta guía explica cómo configurar y ejecutar el Village Manager usando Docker y Docker Compose.

## 📋 Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)
- Al menos 4GB de RAM disponibles
- Al menos 10GB de espacio en disco

## 🚀 Inicio Rápido

### 1. Construir y Levantar Servicios

```bash
# Construir las imágenes Docker
./docker.sh build

# Iniciar todos los servicios principales
./docker.sh start
```

### 2. Sembrar la Base de Datos

```bash
# Ejecutar el script de seeding
./docker.sh seed
```

### 3. Verificar Funcionamiento

```bash
# Verificar estado de los servicios
./docker.sh status

# Ver logs del backend
./docker.sh logs backend
```

## 🌐 Servicios Disponibles

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Backend API** | http://localhost:3000 | API REST de NestJS |
| **PostgreSQL** | localhost:5432 | Base de datos principal |
| **Redis** | localhost:6379 | Cache y colas BullMQ |

### Servicios Opcionales

| Servicio | Comando | URL | Descripción |
|----------|---------|-----|-------------|
| **BullMQ Dashboard** | `./docker.sh monitoring` | http://localhost:3001 | Panel de monitoreo de colas |
| **PgAdmin** | `./docker.sh admin` | http://localhost:5050 | Gestor de base de datos |

## 📋 Comandos del Script Docker

### Comandos Principales

```bash
# Iniciar todos los servicios
./docker.sh start
# o
./docker.sh up

# Detener todos los servicios
./docker.sh stop
# o
./docker.sh down

# Reiniciar servicios
./docker.sh restart

# Ver logs
./docker.sh logs [servicio]  # por defecto: backend

# Ver estado de los contenedores
./docker.sh status
```

### Gestión de Datos

```bash
# Sembrar base de datos con datos iniciales
./docker.sh seed

# Resetear completamente la base de datos (¡DESTRUCTIVO!)
./docker.sh reset

# Limpiar todos los recursos Docker (¡DESTRUCTIVO!)
./docker.sh clean
```

### Desarrollo

```bash
# Iniciar entorno de desarrollo completo
./docker.sh dev

# Reconstruir imágenes sin cache
./docker.sh build
```

### Servicios de Monitoreo

```bash
# Iniciar dashboard de BullMQ
./docker.sh monitoring

# Iniciar PgAdmin
./docker.sh admin
```

## 🔧 Configuración

### Variables de Entorno

Las variables de entorno están configuradas en `.env.docker`:

```env
# Base de Datos
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=admin
DATABASE_PASSWORD=password123
DATABASE_NAME=village_manager

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis123

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### Acceso a Base de Datos

**Para conexión local:**
- **Host:** localhost
- **Port:** 5432
- **Database:** village_manager
- **Username:** admin
- **Password:** password123

**Para conexión desde Docker:**
- **Host:** postgres
- **Port:** 5432
- **Database:** village_manager
- **Username:** admin
- **Password:** password123

### Acceso a Redis

**Para conexión local:**
- **Host:** localhost
- **Port:** 6379
- **Password:** redis123

**Para conexión desde Docker:**
- **Host:** redis
- **Port:** 6379
- **Password:** redis123

## 📊 PgAdmin Configuración

Si inicias PgAdmin con `./docker.sh admin`:

- **URL:** http://localhost:5050
- **Email:** admin@villagemanager.com
- **Password:** admin123

**Configuración de servidor en PgAdmin:**
- **Host:** postgres
- **Port:** 5432
- **Database:** village_manager
- **Username:** admin
- **Password:** password123

## 🔄 Workflow de Desarrollo

### Primer Setup

```bash
# 1. Construir imágenes
./docker.sh build

# 2. Iniciar servicios
./docker.sh start

# 3. Esperar a que la base de datos esté lista
./docker.sh logs postgres

# 4. Sembrar datos
./docker.sh seed

# 5. Iniciar herramientas de desarrollo (opcional)
./docker.sh dev
```

### Desarrollo Diario

```bash
# Iniciar servicios
./docker.sh start

# Ver logs durante desarrollo
./docker.sh logs backend

# Reiniciar si haces cambios
./docker.sh restart
```

### Resetear Datos

```bash
# Resetear solo datos (mantiene estructura)
./docker.sh reset

# Resetear completamente (¡cuidado!)
./docker.sh clean
./docker.sh build
./docker.sh start
./docker.sh seed
```

## 🐛 Troubleshooting

### Problemas Comunes

**1. Docker no está corriendo**
```bash
# Iniciar Docker Desktop o servicio Docker
sudo systemctl start docker  # Linux
```

**2. Puertos ya en uso**
```bash
# Ver qué está usando los puertos
lsof -i :3000
lsof -i :5432
lsof -i :6379

# Cambiar puertos en docker-compose.yml si es necesario
```

**3. Problemas de permisos**
```bash
# Asegurarse que el script es ejecutable
chmod +x docker.sh

# Problemas con volúmenes en Linux
sudo chown -R $USER:$USER ./volumes  # si usas volúmenes locales
```

**4. Base de datos no inicia**
```bash
# Ver logs de PostgreSQL
./docker.sh logs postgres

# Resetear base de datos
./docker.sh reset
```

**5. Backend no conecta a la base de datos**
```bash
# Verificar que postgres esté healthy
./docker.sh status

# Ver logs del backend
./docker.sh logs backend

# Verificar variables de entorno
docker exec village_manager_backend env | grep DATABASE
```

### Logs Útiles

```bash
# Todos los servicios
docker-compose logs

# Servicio específico
docker-compose logs postgres
docker-compose logs redis
docker-compose logs backend

# Logs en tiempo real
docker-compose logs -f backend
```

### Verificar Conexiones

```bash
# Dentro del contenedor backend
docker exec -it village_manager_backend sh
# Verificar conexión a postgres
npm run typeorm query "SELECT 1"

# Dentro del contenedor postgres
docker exec -it village_manager_db psql -U admin -d village_manager
# Listar tablas
\dt
```

## 📈 Monitoreo

### BullMQ Dashboard

```bash
# Iniciar dashboard
./docker.sh monitoring

# Acceder a http://localhost:3001
```

### Métricas de Sistema

```bash
# Uso de recursos
docker stats

# Espacio en disco de volúmenes
docker system df
```

## 🔄 Actualizaciones

### Actualizar Imágenes

```bash
# Reconstruir con cambios
./docker.sh build

# O forzar reconstrucción completa
docker-compose build --no-cache
```

### Actualizar Dependencias

```bash
# Entrar al contenedor backend
docker exec -it village_manager_backend sh

# Actualizar dependencias
npm update

# Reconstruir imagen
./docker.sh build
```

## 🚀 Producción

### Consideraciones de Seguridad

1. **Cambiar contraseñas** en producción
2. **Usar secrets de Docker** para variables sensibles
3. **Configurar HTTPS** con reverse proxy
4. **Restringir acceso** a bases de datos
5. **Configurar backups** automáticos

### Variables de Entorno de Producción

```env
# Cambiar estas variables para producción
DATABASE_PASSWORD=super-secure-password
REDIS_PASSWORD=super-redis-password
JWT_SECRET=your-jwt-secret-256-bits-long
NODE_ENV=production
```

## 📚 Recursos Adicionales

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Redis Docker Hub](https://hub.docker.com/_/redis)
- [BullMQ Documentation](https://docs.bullmq.io/)

## 🆘 Ayuda

Si encuentras problemas:

1. Revisa los logs con `./docker.sh logs [servicio]`
2. Verifica el estado con `./docker.sh status`
3. Intenta reiniciar con `./docker.sh restart`
4. Como último recurso, resetea con `./docker.sh reset`

Para ayuda adicional, ejecuta:
```bash
./docker.sh help
