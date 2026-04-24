# Prompt Marketplace - Database Setup

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (para desarrollo local sin Docker)

## Quick Start

```bash
# Levantar la base de datos
docker compose up -d

# Ver logs
docker compose logs -f

# Verificar que está corriendo
docker compose ps
```

## Estructura de Archivos

```
db/
├── schema.sql    # Tablas + índices
├── seeds.sql     # 25 registros por tabla
└── indexes.sql   # Documentación de índices
```

## Comandos SQL Básicos

```bash
# Conectar a la base de datos (desde el contenedor)
docker compose exec libsql sqlite3 /data/promptmk.db

# Ver tablas
sqlite> .tables

# Ver esquema de una tabla
sqlite> .schema User

# Ver todos los usuarios
sqlite> SELECT * FROM User;

# Ver prompts publicados
sqlite> SELECT * FROM Prompt WHERE is_published = 1;

# Ver votos de un prompt
sqlite> SELECT * FROM Vote WHERE prompt_id = 1;

# Ver compras de un usuario
sqlite> SELECT * FROM Purchase WHERE buyer_user_id = 2;

# Ver estadísticas de prompt
sqlite> SELECT p.title, p.upvotes, p.downvotes, COUNT(c.id_comment) as comments
        FROM Prompt p
        LEFT JOIN Comment c ON p.id_prompt = c.prompt_id
        GROUP BY p.id_prompt;
```

## Reinicializar Base de Datos

```bash
# Detener y eliminar volumen de datos
docker compose down -v

# Volver a levantar (creará DB vacía)
docker compose up -d

# Si necesitas datos de prueba, ejecutar seeds manualmente
docker compose exec libsql sqlite3 /data/promptmk.db < /db/seeds.sql
```

## Desarrollo Local (sin Docker)

```bash
# Crear base de datos SQLite local
sqlite3 data/promptmk.db < db/schema.sql
sqlite3 data/promptmk.db < db/seeds.sql

# Conectar directamente
sqlite3 data/promptmk.db
```

## Configuración de Producción (Turso Cloud)

```bash
# Instalar CLI de Turso
curl -sSL https://get.tur.so/install.sh | bash

# Crear base de datos
turso db create promptmk

# Obtener URL de conexión
turso db show promptmk --url

# Ejecutar schema
turso db shell promptmk < db/schema.sql
turso db shell promptmk < db/seeds.sql
```

## Variables de Entorno

```env
# Desarrollo local (Docker)
DATABASE_URL=http://libsql:8080

# Producción (Turso Cloud)
DATABASE_URL=libsql://tu-database.turso.io
TURSO_AUTH_TOKEN=tu-token-de-autenticacion
```