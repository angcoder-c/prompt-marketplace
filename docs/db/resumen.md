# Catálogo implementadas
 
| # | Función | Tipo SQL | Visible en UI | Criterio rúbrica |
|---|---|---|---|---|
| 1 | `findMarketplaceUserById` | SELECT simple | No (backend) | — |
| 2 | `findMarketplaceUserByUsername` | SELECT simple | No (backend) | — |
| 3 | `createMarketplaceUserProfile` | INSERT | No (backend) | — |
| 4 | `updateMarketplaceUserProfile` | UPDATE dinámico | Sí — Perfil | — |
| 5 | `createPrompt` | INSERT + UPDATE | Sí — Creación | — |
| 6 | `updatePrompt` | UPDATE dinámico + Tags | Sí — Edición | — |
| 7 | `deletePrompt` | DELETE simple | Sí — Eliminación | — |
| 8 | `findPromptById` | JOIN + 5 Subqueries | Sí — Modal detalle | JOINs, Subqueries |
| 9 | `purchasePrompt` | JOIN + Transacción batch | Sí — Compra | JOINs, Transacción |
| 10 | `listPublishedPrompts` | JOIN + Subqueries + GROUP BY | Sí — Feed principal | JOINs, Subqueries, Agregación |
| 11 | `listRanking` | Subqueries complejas + GROUP BY | Sí — Ranking | Subqueries, Agregación |
| 12 | `listPromptsByTag` | JOIN + EXISTS + GROUP BY | Sí — Tag page | JOINs, Subqueries |
| 13 | `listFollowingTagsByUser` | Subqueries agregadas | Sí — Favoritos | Subqueries |
| 14 | `applyPromptVote` | INSERT OR IGNORE + UPDATE | Sí — Voting | — |
| 15 | `searchPrompts` | Búsqueda dinámica | Sí — Search | JOINs |
 

 
# Índices para optimización de rendimiento
 
```sql
CREATE INDEX idx_prompt_user    ON Prompt(user_id);
CREATE INDEX idx_vote_prompt    ON Vote(prompt_id);
CREATE INDEX idx_prompt_created ON Prompt(created_at);
```
 
Estos índices mejorarán el rendimiento de las consultas de ranking y feed principal, que acceden frecuentemente a estas columnas en cláusulas WHERE y ORDER BY.

## Conclusiones
 
El proyecto Prompt Marketplace implementa un conjunto robusto y bien estructurado de consultas SQL, alcanzando los criterios de la rúbrica de evaluación. Los principales logros son:
 
- JOINs correctamente utilizados en múltiples niveles de anidamiento.
- Variedad de subqueries: correlacionadas, EXISTS, en cláusula FROM y con GROUP_CONCAT.
- Funciones de agregación con GROUP BY para estadísticas en tiempo real.
- Transacción atómica con validaciones exhaustivas y control de concurrencia optimista.
- Vista (VIEW) que centraliza la lógica de agregación de votos.

La única área de mejora pendiente es la incorporación de al menos una CTE (WITH), cuya implementación se documenta en este informe y puede integrarse con mínimo esfuerzo al código existente.