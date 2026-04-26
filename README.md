# Prompt Marketplace

![SQL Practice](https://img.shields.io/badge/Focus-SQL%20Practice-14532d?style=for-the-badge)
![Turso libSQL](https://img.shields.io/badge/Database-Turso%20libSQL-0f766e?style=for-the-badge)
![TanStack Start](https://img.shields.io/badge/App-TanStack%20Start-0ea5e9?style=for-the-badge)
![No ORM](https://img.shields.io/badge/Data%20Layer-No%20ORM-334155?style=for-the-badge)
![Tailwind](https://img.shields.io/badge/UI-Tailwind-0891b2?style=for-the-badge)
![Zustand](https://img.shields.io/badge/State-Zustand-7c2d12?style=for-the-badge)
![React Icons](https://img.shields.io/badge/Icons-react--icons-1f2937?style=for-the-badge)

Proyecto pensado para practicar SQL real sobre un caso de negocio tipo marketplace de prompts.

| Tema | Practica |
|---|---|
| DDL | Tablas, PK/FK, checks, indices, vistas |
| DML | Seeds, inserts, updates, deletes |
| Consultas | Filtros, joins, agregaciones, ranking |
| Integridad | Unique constraints y relaciones |
| Operacion | Inicializacion de DB y entorno local |

## Stack

| Capa | Tecnologia | Enfoque |
|---|---|---|
| Database | Turso libSQL | SQL directo |
| App Fullstack | TanStack Start | Routing + server/client |
| Data Access | Sin ORM | Control total de queries |
| UI | Tailwind CSS | Estilos rapidos |
| Estado | Zustand | Estado global simple |
| Iconos | react-icons | UI consistente |

## Quick Start

### 1. Levantar libsql local

```bash
docker compose up -d --build
```

## Conexion y consultas

Nota importante: el contenedor de libsql no trae `sqlite3` instalado. Las consultas se hacen por HTTP con `@libsql/client`.

### Consulta rapida desde terminal (Git Bash)

```bash
node --input-type=module -e 'import { createClient } from "@libsql/client"; const db=createClient({url:"http://localhost:8080"}); const r=await db.execute("SELECT id_user, username, email FROM [User] ORDER BY created_at DESC LIMIT 20"); console.table(r.rows);'
```

Tip: usa `[User]` o `"User"` para evitar conflicto por el nombre de tabla.

## Variables de entorno

| Entorno | DATABASE_URL |
|---|---|
| Host local | `http://localhost:8080` |
| Otro contenedor en la red de compose | `http://libsql:8080` |
| Turso cloud | `libsql://tu-db.turso.io` |

```env
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

## Diseño

Recursos de diseno y documentacion del proyecto:

| Tipo | Recurso |
|---|---|
| Idea | [docs/design/idea.md](docs/design/idea.md) |
| Mockup UI | [docs/design/ui-design.png](docs/design/ui-design.png) |
| Normalizacion | [docs/db/normalization.md](docs/db/normalization.md) |
| Diagrama ER | [docs/db/er.diagram.png](docs/db/er.diagram.png) |
| Diagrama relacional | [docs/db/relational.diagram.png](docs/db/relational.diagram.png) |

## Licencia

MIT.

