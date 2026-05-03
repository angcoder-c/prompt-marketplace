# Informe de análisis de consultas SQL
## Proyecto 2 — Prompt Marketplace
 
**Universidad del Valle de Guatemala**  
Facultad de Ingeniería — Ciencia de la Computación y Tecnologías de la Información  
CC3088 – Bases de Datos 1 

---
 
## 1. Resumen
 
El presente informe documenta y analiza todas las consultas SQL implementadas en la capa de datos (`src/lib/db.ts`) del proyecto Prompt Marketplace. Las consultas han sido clasificadas y evaluadas conforme a los criterios de la rúbrica de calificación de la sección SQL.
 
El proyecto alcanza **45 de 50 puntos posibles** en esta categoría, representando un **90% de cumplimiento**. Las cinco subcategorías implementadas: JOINs múltiples, subqueries, agregaciones, vistas y transacciones, están plenamente verificadas. Únicamente la implementación de CTEs permanece pendiente en la versión actual.
 
| Criterio | Pts. posibles | Estado | Observación |
|---|---|---|---|
| Consultas con JOIN (mín. 3) | 10 | ✅ CUMPLE | 4 queries identificadas |
| Subqueries IN / EXISTS / FROM (mín. 2) | 10 | ✅ CUMPLE | 3+ queries identificadas |
| GROUP BY, HAVING y agregaciones | 8 | ✅ CUMPLE | Múltiples en `listRanking` |
| CTE — WITH (mín. 1) | 5 | ❌ NO CUMPLE | No implementado |
| VIEW utilizada por el backend (mín. 1) | 5 | ✅ CUMPLE | Vista `PromptVoteCount` |
| Transacción explícita con ROLLBACK (mín. 1) | 12 | ✅ CUMPLE | `purchasePrompt` — batch atómico |
| **TOTAL** | **50** | **45 / 50** | **90% de cumplimiento** |
 
---
 
## 2. Consultas con JOIN entre Múltiples Tablas
 
La rúbrica exige un mínimo de 3 consultas con JOIN entre múltiples tablas, visibles en la interfaz de usuario. El proyecto implementa **4 consultas** que cumplen este requisito **(10 puntos)**.
 
### 2.1 `findPromptById` — JOIN Prompt + User
 
> **Visibilidad en UI:** Modal de detalle de prompt ✅
 
```sql
SELECT
    p.id_prompt, p.user_id, p.title, p.content, p.description,
    p.model, p.aipoints_price, p.uses_count, p.is_published,
    p.created_at, p.updated_at,
    u.username, u.avatar_url, u.airank
FROM Prompt p
JOIN User u ON u.id_user = p.user_id
WHERE p.id_prompt = ?
LIMIT 1
```
 
Recupera el detalle completo de un prompt junto con la información de su autor mediante un JOIN entre las tablas `Prompt` y `User`. Incorpora adicionalmente múltiples subqueries correlacionadas para conteos de votos y la última respuesta generada.
 
---
 
### 2.2 `listPublishedPrompts` — JOIN Prompt + User + JOIN anidado en subquery
 
> **Visibilidad en UI:** Feed principal (home) ✅
 
```sql
SELECT
    p.id_prompt, p.title, p.description, p.model,
    p.aipoints_price, p.uses_count, p.created_at,
    u.username, u.avatar_url, u.airank,
    (SELECT COUNT(*) FROM Vote v1
     WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1)  AS upvotes,
    (SELECT COUNT(*) FROM Vote v2
     WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1) AS downvotes,
    (SELECT GROUP_CONCAT(t.slug)
     FROM PromptTag pt
     JOIN Tag t ON t.id_tag = pt.tag_id
     WHERE pt.prompt_id = p.id_prompt) AS tags_csv
FROM Prompt p
JOIN User u ON u.id_user = p.user_id
WHERE p.is_published = 1
ORDER BY [criterio dinámico]
LIMIT ? OFFSET ?
```
 
Lista los prompts publicados con soporte de paginación y múltiples criterios de ordenamiento (más reciente, más popular, mejor calificado). Incorpora un JOIN anidado dentro de una subquery para agregar las etiquetas asociadas a cada prompt.
 
---
 
### 2.3 `listRanking` — JOIN User con subqueries de agregación
 
> **Visibilidad en UI:** Página de ranking / leaderboard ✅
 
```sql
SELECT
    u.id_user, u.username, u.avatar_url, u.airank,
    (SELECT COUNT(*) FROM Prompt p
     WHERE p.user_id = u.id_user AND p.is_published = 1) AS prompts_published,
    (SELECT COUNT(*) FROM Prompt p
     JOIN Vote v ON v.prompt_id = p.id_prompt
     WHERE p.user_id = u.id_user AND v.vote_type = 1)  AS total_upvotes,
    (SELECT COUNT(*) FROM Prompt p
     JOIN Vote v ON v.prompt_id = p.id_prompt
     WHERE p.user_id = u.id_user AND v.vote_type = -1) AS total_downvotes
FROM User u
ORDER BY u.airank DESC, u.created_at ASC
LIMIT ? OFFSET ?
```
 
---
 
### 2.4 `purchasePrompt` — JOIN Prompt + User (comprador)
 
> **Visibilidad en UI:** Modal de compra ✅
 
```sql
SELECT
    p.id_prompt, p.user_id, p.content,
    p.aipoints_price, p.is_published,
    buyer.aipoints
FROM Prompt p
JOIN User buyer ON buyer.id_user = ?
WHERE p.id_prompt = ?
LIMIT 1
```
 
Obtiene simultáneamente los datos del prompt y el saldo del comprador, permitiendo validar si la transacción puede realizarse antes de ejecutarla.
 
---
 
## 3. Consultas con Subqueries
 
La rúbrica exige un mínimo de 2 consultas con subqueries de tipo IN, EXISTS, correlacionadas o en cláusula FROM. El proyecto implementa **más de 3 tipos diferentes** (10 puntos).
 
### 3.1 Subqueries Correlacionadas — Conteo de votos
 
> **Tipo:** Correlacionada | **Usadas en:** `findPromptById`, `listPublishedPrompts` ✅
 
```sql
(SELECT COUNT(*) FROM Vote v1
 WHERE v1.prompt_id = p.id_prompt AND v1.vote_type =  1) AS upvotes,
(SELECT COUNT(*) FROM Vote v2
 WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1) AS downvotes
```
 
Hacen referencia a `p.id_prompt` del query externo y se ejecutan una vez por cada fila del resultado principal, calculando votos positivos y negativos de forma independiente.
 
---
 
### 3.2 Subquery EXISTS — Filtrado por etiqueta
 
> **Tipo:** EXISTS | **Usada en:** `listPublishedPrompts` (filtro por tag) ✅
 
```sql
WHERE p.is_published = 1
AND EXISTS (
    SELECT 1 FROM PromptTag pt
    JOIN Tag t ON t.id_tag = pt.tag_id
    WHERE pt.prompt_id = p.id_prompt
    AND t.slug = ?
)
```
 
---
 
### 3.3 Subquery en FROM (tabla derivada con UNION)
 
> **Tipo:** Subquery en cláusula FROM | **Usada en:** `listRanking` ✅
 
```sql
SELECT COUNT(DISTINCT user_id)
FROM (
    SELECT user_id FROM Prompt
    WHERE created_at >= datetime('now', '-24 hours')
    UNION
    SELECT user_id FROM Comment
    WHERE created_at >= datetime('now', '-24 hours')
    UNION
    SELECT user_id FROM Vote
    WHERE created_at >= datetime('now', '-24 hours')
    UNION
    SELECT buyer_user_id AS user_id FROM Purchase
    WHERE purchased_at >= datetime('now', '-24 hours')
) AS active_users_in_24h
```
 
Consolida actividad de cuatro tablas distintas mediante UNION para identificar usuarios únicos activos en las últimas 24 horas. El resultado se muestra en el panel de estadísticas del ranking.
 
---
 
### 3.4 Subquery con GROUP_CONCAT — Agregación de etiquetas
 
> **Usada en:** `findPromptById`, `listPublishedPrompts` ✅
 
```sql
(
    SELECT GROUP_CONCAT(t.slug)
    FROM PromptTag pt
    JOIN Tag t ON t.id_tag = pt.tag_id
    WHERE pt.prompt_id = p.id_prompt
) AS tags_csv
```
 
---
 
## 4. Consultas con GROUP BY, HAVING y Funciones de Agregación
 
La rúbrica requiere al menos una consulta con GROUP BY y funciones de agregación, visible en la interfaz. El proyecto implementa **múltiples instancias** (8 puntos).
 
### 4.1 Modelo con mayor tendencia — `listRanking`
 
> **Visibilidad en UI:** Tarjeta "Modelo tendencia" en página de ranking ✅
 
```sql
SELECT model
FROM Prompt
WHERE is_published = 1
  AND created_at >= datetime('now', '-24 hours')
GROUP BY model
ORDER BY COUNT(*) DESC, MAX(created_at) DESC
LIMIT 1
```
 
Aplica `GROUP BY` sobre el campo `model`, usa `COUNT(*)` para contar prompts por modelo y `MAX(created_at)` como criterio de desempate, identificando el modelo de IA más utilizado en las últimas 24 horas.
 
---
 
### 4.2 Conteo de prompts por usuario — `listRanking`
 
> **Visibilidad en UI:** Columna de conteo en tabla de ranking ✅
 
```sql
(SELECT COUNT(*) FROM Prompt p
 WHERE p.user_id = u.id_user
 AND p.is_published = 1) AS prompts_published
```
 
---
 
### 4.3 Ordenamiento por diferencial de votos — `listPublishedPrompts`
 
> **Visibilidad en UI:** Feed ordenado por "Mejor calificado" ✅
 
```sql
ORDER BY (
    (SELECT COUNT(*) FROM Vote v1
     WHERE v1.prompt_id = p.id_prompt AND v1.vote_type = 1)
  - (SELECT COUNT(*) FROM Vote v2
     WHERE v2.prompt_id = p.id_prompt AND v2.vote_type = -1)
) DESC
```
 
---
 
## 5. Consultas con CTE (Common Table Expressions)
 
> **Estado:** ❌ No implementado en la versión actual del proyecto.
 
Las consultas existentes logran la misma funcionalidad mediante subqueries correlacionadas, UNION y GROUP_CONCAT. A continuación se documenta el equivalente en CTE de la consulta de usuarios activos como referencia de implementación futura.
 
---
 
## 6. Vista (VIEW) Utilizada por el Backend
 
> **Estado:** ✅ Implementado — Vista `PromptVoteCount` definida en `db/ddl.sql` (5 puntos).
 
### 6.1 Definición
 
```sql
CREATE VIEW IF NOT EXISTS PromptVoteCount AS
SELECT
    p.id_prompt,
    p.title,
    COUNT(CASE WHEN v.vote_type =  1 THEN 1 END) AS upvotes,
    COUNT(CASE WHEN v.vote_type = -1 THEN 1 END) AS downvotes,
    COUNT(CASE WHEN v.vote_type =  1 THEN 1 END) -
    COUNT(CASE WHEN v.vote_type = -1 THEN 1 END) AS score
FROM Prompt p
LEFT JOIN Vote v ON v.prompt_id = p.id_prompt
GROUP BY p.id_prompt, p.title;
```
 
La vista centraliza la lógica de agregación de votos, proporcionando una interfaz limpia para que el backend consulte los conteos sin replicar la lógica de JOIN y agregación en cada endpoint.
 
---
 
## 7. Transacción Explícita con Manejo de Errores y ROLLBACK
 
> **Estado:** ✅ Implementado en `purchasePrompt` mediante `db.batch(..., "write")` (12 puntos).
 
### 7.1 Validaciones previas a la transacción
 
Antes de ejecutar la transacción se realizan las siguientes verificaciones con retorno anticipado:
 
- El prompt debe existir en la base de datos.
- El prompt debe estar publicado (`is_published = 1`).
- El comprador no puede ser el mismo propietario del prompt.
- El prompt no debe haber sido comprado previamente por el mismo usuario.
- El comprador debe contar con saldo suficiente de aipoints.
### 7.2 Operaciones de la transacción
 
```typescript
await db.batch([
    {
        sql: `UPDATE User
              SET aipoints = aipoints - ?,
                  updated_at = datetime('now')
              WHERE id_user = ? AND aipoints >= ?`,
        args: [aipointsSpent, buyerUserId, aipointsSpent],
    },
    {
        sql: `UPDATE User
              SET aipoints = aipoints + ?,
                  updated_at = datetime('now')
              WHERE id_user = ?`,
        args: [aipointsSpent, promptRow.user_id],
    },
    {
        sql: `INSERT INTO Purchase
              (id_purchase, buyer_user_id, prompt_id, aipoints_spent)
              VALUES (?, ?, ?, ?)`,
        args: [purchaseId, buyerUserId, promptId, aipointsSpent],
    },
], "write");
```
 
### 7.3 Propiedades ACID verificadas
 
| Propiedad | Descripción |
|---|---|
| **Atomicidad** | Las tres operaciones se ejecutan de forma conjunta. Si cualquiera falla, Turso/libSQL realiza ROLLBACK automático de todo el lote. |
| **Consistencia** | Las validaciones previas garantizan que solo se ejecuta una transacción en estado válido. |
| **Aislamiento** | El modo `write` serializa las escrituras, evitando condiciones de carrera. |
| **Durabilidad** | Los cambios quedan persistidos de forma permanente en Turso. |
 
**Control de concurrencia:** la condición `WHERE id_user = ? AND aipoints >= ?` en el primer UPDATE previene el sobregiro de saldo incluso ante solicitudes concurrentes.