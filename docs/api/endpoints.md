# Prompt Marketplace — API Endpoints

> **Auth:** Sesión via cookie `better-auth.session_token` 
> **Formato:** JSON en todos los requests y responses


## Índice

- [Auth](#auth-better-auth)
- [Users / Perfil](#users--perfil)
- [Prompts](#prompts)
- [Respuestas de Prompts (AI)](#respuestas-de-prompts-ai)
- [Tags](#tags)
- [User tags followed](#user-tags-followed)
- [Favorites feed](#favorites-feed)
- [Votes](#votes)
- [Comments](#comments)
- [Purchases](#purchases)
- [Ranking](#ranking)
- [Search](#search)

---

## Auth 

> Better Auth usa **cookies de sesión** (`better-auth.session_token`), no JWT en headers. Las cookies se envían automáticamente en cada request. Los endpoints en `/api/*` validan la sesión llamando a `auth.api.getSession()` en el servidor.


### `POST /api/auth/sign-up/email`
Registro con email y contraseña. Llamado por `authClient.signUp.email()`.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "supersecret123",
  "name": "John Doe"
}
```

**Response `200 OK`:**
```json
{
  "token": null,
  "user": {
    "id": "usr_abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "emailVerified": false,
    "createdAt": "2025-04-23T14:30:00Z",
    "updatedAt": "2025-04-23T14:30:00Z"
  }
}
```

> Después del sign-up, se debe llamar al endpoint propio `POST /api/users/setup` para crear el registro en tu tabla `User` con `username`, `aipoints`, `airank` iniciales, etc.

### `POST /api/auth/sign-in/email`
Login con email y contraseña. Llamado por `authClient.signIn.email()`.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "supersecret123"
}
```

**Response `200 OK`:** 

---

### `GET /api/auth/sign-in/social?provider=google`
Inicia flujo OAuth con Google. Llamado por `authClient.signIn.social({ provider: "google" })`.

**Response:** `302 Redirect → Google OAuth`


### `GET /api/auth/sign-in/social?provider=github`
Inicia flujo OAuth con GitHub. Llamado por `authClient.signIn.social({ provider: "github" })`.

**Response:** `302 Redirect → GitHub OAuth`

### `POST /api/auth/sign-out`
Cierra sesión e invalida la cookie. Llamado por `authClient.signOut()`.

**Response `200 OK`:**
```json
{ "success": true }
```

---

### `GET /api/auth/get-session`
Retorna la sesión activa. Llamado por `authClient.getSession()`.

**Response `200 OK`:**
```json
{
  "session": {
    "id": "ses_xyz789",
    "userId": "usr_abc123",
    "expiresAt": "2025-05-23T14:30:00Z"
  },
  "user": {
    "id": "usr_abc123",
    "email": "john@example.com",
    "name": "John Doe",
    "emailVerified": true
  }
}
```

---

## Users / Perfil

> Estos son endpoints propios. La autenticación se valida leyendo la cookie de sesión de Better Auth en el servidor con `auth.api.getSession({ headers: request.headers })`.

---

### `POST /api/users/setup`
Crea el perfil de usuario en la tabla `User` tras el primer login/registro. Better Auth ya habrá su propio registro interno, mientras que este endpoint crea un registro propio con los datos de negocio.

> Se llama automáticamente desde el callback `onSuccess` del sign-up/social login si el usuario no existe aún en tu DB.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{
  "username": "johndoe"
}
```

**Response `201 Created`:**
```json
{
  "id_user": "usr_abc123",
  "username": "johndoe",
  "email": "john@example.com",
  "avatar_url": "https://lh3.googleusercontent.com/...",
  "bio": null,
  "aipoints": 1000,
  "created_at": "2025-04-23T14:30:00Z"
}
```

**Errores:**
- `400` — username ya en uso
- `409` — perfil ya existe para este usuario

---

### `GET /api/users/me`
Retorna el perfil del usuario autenticado.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{
  "id_user": "usr_abc123",
  "username": "johndoe",
  "email": "john@example.com",
  "avatar_url": "https://...",
  "bio": "AI prompt engineer",
  "aipoints": 350,
  "airank": 142.5,
  "created_at": "2025-04-01T10:00:00Z",
  "updated_at": "2025-04-23T14:30:00Z"
}
```

---

### `GET /api/users/me/prompts`
Devuelve los prompts creados por el usuario autenticado y los prompts que ya compró.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{
  "created": [
    {
      "id_prompt": "prompt_abc123",
      "title": "Code Reviewer Pro",
      "description": "Reviews your code with detailed feedback",
      "model": "claude-sonnet-4",
      "aipoints_price": 25,
      "upvotes": 15,
      "downvotes": 1,
      "uses_count": 38,
      "tags": ["coding", "review"],
      "created_at": "2025-04-10T09:00:00Z"
    }
  ],
  "purchased": [
    {
      "id_prompt": "prompt_xyz789",
      "title": "System Prompt Optimizer",
      "description": "Helps improve system prompts before publishing",
      "model": "gpt-4.1-mini",
      "aipoints_price": 15,
      "upvotes": 8,
      "downvotes": 0,
      "uses_count": 12,
      "tags": ["prompting", "optimization"],
      "created_at": "2025-04-18T11:20:00Z"
    }
  ]
}
```

**Errores:**
- `401` — sesión inválida o expirada
- `404` — perfil no creado todavía

---

### `GET /api/users/me/following-tags`
Devuelve las categorías que sigue el usuario autenticado.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id_tag": "2",
      "name": "Coding",
      "slug": "coding",
      "description": "Programming and code-related prompts",
      "followed_at": "2025-04-10T10:00:00Z"
    }
  ]
}
```

---

### `GET /api/users/me/favorites`
Prompts publicados en las categorías que sigue el usuario autenticado.

**Auth requerida:** Sí (cookie de sesión)

**Query Params:** `page`, `limit`, `sort`

**Response `200 OK`:**
```json
{
  "data": "misma estructura que GET /api/prompts",
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

---

### `PATCH /api/users/me`
Actualiza el perfil del usuario autenticado.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{
  "username": "johndoe_updated",
  "bio": "Building AI tools"
}
```

**Response `200 OK`:**
```json
{
  "id_user": "usr_abc123",
  "username": "johndoe_updated",
  "bio": "Building AI tools",
  "updated_at": "2025-04-23T15:00:00Z"
}
```

**Errores:**
- `400` — username ya en uso
- `422` — campos inválidos

---

### `GET /api/users/:username`
Perfil público de un usuario.

**Auth requerida:** No

**Response `200 OK`:**
```json
{
  "id_user": "usr_abc123",
  "username": "johndoe",
  "avatar_url": "https://...",
  "bio": "AI prompt engineer",
  "aipoints": 350,
  "airank": 142.5,
  "stats": {
    "prompts_published": 12,
    "total_upvotes": 89,
    "total_downvotes": 4,
    "total_sales": 45
  },
  "created_at": "2025-04-01T10:00:00Z"
}
```

---

### `GET /api/users/:username/prompts`
Prompts publicados por un usuario.

**Auth requerida:** No

**Query Params:** `page`, `limit` (default: 20)

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id_prompt": 10,
      "title": "Code Reviewer Pro",
      "description": "Reviews your code with detailed feedback",
      "model": "claude-sonnet-4",
      "aipoints_price": 25,
      "upvotes": 15,
      "downvotes": 1,
      "uses_count": 38,
      "tags": ["coding", "review"],
      "created_at": "2025-04-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12
  }
}
```

---

### `GET /api/users/me/purchased`
Prompts que el usuario autenticado ha comprado.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:** _(misma estructura que `/api/users/:username/prompts`)_

---

### `GET /api/users/me/following-tags`
Tags que sigue el usuario autenticado.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{
  "data": [
    { "id_tag": 2, 
      "name": "Coding", 
      "slug": "coding", 
      "followed_at": "2025-04-10T10:00:00Z" 
    }
  ]
}
```

---

### `GET /api/users/me/aipoints/history`
Historial de movimientos de AI Points.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{
  "current_balance": 325,
  "data": [
    {
      "type": "purchase",
      "amount": -25,
      "description": "Purchased 'Code Reviewer Pro'",
      "reference_id": 42,
      "created_at": "2025-04-23T15:10:00Z"
    },
    {
      "type": "reward",
      "amount": 50,
      "description": "Reward for publishing prompt 'Code Reviewer Pro'",
      "reference_id": 10,
      "created_at": "2025-04-10T09:00:00Z"
    },
    {
      "type": "signup_bonus",
      "amount": 1000,
      "description": "Welcome bonus",
      "reference_id": null,
      "created_at": "2025-04-01T10:00:00Z"
    }
  ]
}
```

---

## Prompts

### `GET /api/prompts`
Feed principal de prompts publicados.

**Auth requerida:** No

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `sort` — `recent` | `popular` | `top_rated`
- `tag` — slug del tag para filtrar

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id_prompt": 10,
      "user": {
        "id_user": "usr_abc123",
        "username": "johndoe",
        "avatar_url": "https://..."
      },
      "title": "Code Reviewer Pro",
      "description": "Reviews your code with detailed feedback",
      "model": "claude-sonnet-4",
      "aipoints_price": 25,
      "upvotes": 15,
      "downvotes": 1,
      "uses_count": 38,
      "tags": ["coding", "review"],
      "response_preview": {
        "content": "Here's a review of your code: ...",
        "tokens_prompt": 120,
        "tokens_response": 340
      },
      "created_at": "2025-04-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 154
  }
}
```

---

### `GET /api/prompts/:id`
Detalle completo de un prompt. El campo `content` solo se incluye si el usuario autenticado es el autor o ya lo compró.

**Auth requerida:** No (opcional para ver `content` y estado de compra)

**Response `200 OK`:**
```json
{
  "id_prompt": 10,
  "user": {
    "id_user": "usr_abc123",
    "username": "johndoe",
    "avatar_url": "https://...",
    "airank": 142.5
  },
  "title": "Code Reviewer Pro",
  "content": "You are an expert code reviewer...",
  "description": "Reviews your code with detailed feedback",
  "model": "claude-sonnet-4",
  "aipoints_price": 25,
  "upvotes": 15,
  "downvotes": 1,
  "uses_count": 38,
  "is_purchased": true,
  "is_owner": false,
  "user_vote": "up",
  "tags": ["coding", "review"],
  "response": {
    "content": "Here's a detailed review of your code:\n\n1. **Line 23**: ...",
    "tokens_prompt": 120,
    "tokens_response": 340,
    "generated_at": "2025-04-10T09:05:00Z"
  },
  "created_at": "2025-04-10T09:00:00Z",
  "updated_at": "2025-04-10T09:05:00Z"
}
```

---

### `POST /api/prompts`
Crea un nuevo prompt.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{
  "title": "Code Reviewer Pro",
  "content": "You are an expert code reviewer. Analyze the following code...",
  "description": "Reviews your code with detailed feedback",
  "model": "claude-sonnet-4",
  "aipoints_price": 25,
  "tags": ["coding", "review"],
  "is_published": true
}
```

**Response `201 Created`:**
```json
{
  "id_prompt": 10,
  "title": "Code Reviewer Pro",
  "description": "Reviews your code with detailed feedback",
  "model": "claude-sonnet-4",
  "aipoints_price": 25,
  "is_published": true,
  "created_at": "2025-04-23T15:00:00Z"
}
```

**Errores:**
- `400` — campos requeridos faltantes
- `422` — model inválido, price negativo

---

### `PATCH /api/prompts/:id`
Actualiza un prompt. Solo el autor.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:** _(solo los campos a cambiar)_
```json
{
  "title": "Code Reviewer Pro v2",
  "aipoints_price": 30,
  "tags": ["coding", "review", "refactoring"],
  "is_published": false
}
```

**Response `200 OK`:** _(prompt actualizado completo)_

**Errores:**
- `403` — no es el autor
- `404` — prompt no encontrado

---

### `DELETE /api/prompts/:id`
Elimina un prompt. Solo el autor.

**Auth requerida:** Sí (cookie de sesión)

**Response `204 No Content`**

**Errores:**
- `403` — no es el autor

---

## Respuestas de Prompts (AI)

### `POST /api/prompts/:id/generate-response`
Genera o regenera la respuesta de ejemplo del prompt usando AI. Solo el autor.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{
  "model": "claude-sonnet-4"
}
```

**Response `200 OK`:**
```json
{
  "id_response": 5,
  "prompt_id": 10,
  "content": "Here's a detailed review of your code:\n\n1. **Line 23**...",
  "tokens_prompt": 120,
  "tokens_response": 340,
  "generated_at": "2025-04-23T15:05:00Z"
}
```

---

### `POST /api/prompts/generate-description`
Genera automáticamente una descripción para un prompt antes de guardarlo.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{
  "content": "You are an expert code reviewer. Analyze the following code...",
  "title": "Code Reviewer Pro"
}
```

**Response `200 OK`:**
```json
{
  "description": "A powerful prompt that turns any AI model into a senior code reviewer, providing detailed feedback on structure, performance, and best practices."
}
```

---

## Tags

### `GET /api/tags`
Lista todos los tags disponibles.

**Auth requerida:** No

**Response `200 OK`:**
```json
{
  "data": [
    { 
      "id_tag": 1, 
      "name": "Text", 
      "slug": "text", 
      "description": "Prompts for text generation and writing" 
    },
    { 
      "id_tag": 2, 
      "name": "Coding", 
      "slug": "coding", 
      "description": "Programming and code-related prompts" 
    },
    { 
      "id_tag": 3, 
      "name": "ASCII Art", 
      "slug": "ascii-art", 
      "description": null 
    }
  ]
}
```

---

### `GET /api/tags/:slug`
Detalle de un tag con sus prompts.

**Auth requerida:** No (opcional para ver `is_following`)

**Query Params:** `page`, `limit`, `sort`

**Response `200 OK`:**
```json
{
  "tag": {
    "id_tag": 2,
    "name": "Coding",
    "slug": "coding",
    "description": "Programming and code-related prompts",
    "followers_count": 320
  },
  "is_following": true,
  "prompts": { "...": "misma estructura que GET /prompts" }
}
```

---

### `POST /api/tags/:slug/follow`
Sigue un tag.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{ "following": true, "tag_slug": "coding" }
```

---

### `DELETE /api/tags/:slug/follow`
Deja de seguir un tag.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{ "following": false, "tag_slug": "coding" }
```

---

## Votes

### `POST /api/prompts/:id/vote`
Vota un prompt. Si ya votó igual cancela el voto. Si ya votó distinto cambia el voto.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{ "vote_type": "up" }
```

**Response `200 OK`:**
```json
{
  "prompt_id": 10,
  "vote_type": "up",
  "upvotes": 16,
  "downvotes": 1
}
```

**Errores:**
- `400` — vote_type inválido
- `403` — no puede votar su propio prompt

---

## Comments

### `GET /api/prompts/:id/comments`
Lista comentarios de un prompt.

**Auth requerida:** No

**Query Params:** `page`, `limit`

**Response `200 OK`:**
```json
{
  "data": [
    {
      "id_comment": 1,
      "user": {
        "id_user": "usr_def456",
        "username": "alice",
        "avatar_url": "https://..."
      },
      "content": "This prompt is incredibly useful for my workflow!",
      "created_at": "2025-04-15T12:00:00Z",
      "updated_at": "2025-04-15T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

### `POST /api/prompts/:id/comments`
Agrega un comentario.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{ "content": "This prompt is incredibly useful for my workflow!" }
```

**Response `201 Created`:**
```json
{
  "id_comment": 1,
  "prompt_id": 10,
  "user": {
    "id_user": "usr_def456",
    "username": "alice",
    "avatar_url": "https://..."
  },
  "content": "This prompt is incredibly useful for my workflow!",
  "created_at": "2025-04-23T15:00:00Z"
}
```

---

### `PATCH /api/prompts/:id/comments/:comment_id`
Edita un comentario. Solo el autor del comentario.

**Auth requerida:** Sí (cookie de sesión)

**Request Body:**
```json
{ "content": "Updated comment content" }
```

**Response `200 OK`:** _(comentario actualizado)_

---

### `DELETE /api/prompts/:id/comments/:comment_id`
Elimina un comentario. Solo el autor del comentario.

**Auth requerida:** Sí (cookie de sesión)

**Response `204 No Content`**

---

## Purchases

### `POST /api/prompts/:id/purchase`
Compra un prompt gastando AI Points. Tras la compra el `content` completo queda disponible en `GET /api/prompts/:id`.

**Auth requerida:** Sí (cookie de sesión)

**Response `200 OK`:**
```json
{
  "id_purchase": 42,
  "prompt_id": 10,
  "aipoints_spent": 25,
  "remaining_aipoints": 325,
  "prompt_content": "You are an expert code reviewer. Analyze the following code and provide...",
  "purchased_at": "2025-04-23T15:10:00Z"
}
```

**Errores:**
- `400` — ya compró este prompt
- `402` — AI Points insuficientes
- `403` — no puede comprar su propio prompt

---

## Ranking

### `GET /api/ranking`
Dashboard de ranking de usuarios y estadísticas globales.

**Auth requerida:** No

**Query Params:** `page`, `limit` (default: 20)

**Response `200 OK`:**
```json
{
  "stats": {
    "active_users": 200,
    "posts_last_24h": 20,
    "trending_model": "claude-sonnet-4-5"
  },
  "data": [
    {
      "rank": 1,
      "user": {
        "id_user": "usr_def456",
        "username": "alice",
        "avatar_url": "https://..."
      },
      "airank": 150,
      "total_upvotes": 15,
      "total_downvotes": 2,
      "prompts_published": 8
    },
    {
      "rank": 2,
      "user": {
        "id_user": "usr_ghi789",
        "username": "bob",
        "avatar_url": "https://..."
      },
      "airank": 140,
      "total_upvotes": 15,
      "total_downvotes": 2,
      "prompts_published": 5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 200
  }
}
```

---

## Search

### `GET /api/search`
Búsqueda global de prompts por título, descripción y tags.

**Auth requerida:** No

**Query Params:**
- `q` — texto a buscar (requerido)
- `type` — `tag` | `all` (default: `all`)
- `page`, `limit`

**Response `200 OK`:**
```json
{
  "query": "code review",
  "data": [
    {
      "id_prompt": 10,
      "user": {
        "id_user": "usr_abc123",
        "username": "johndoe",
        "avatar_url": "https://..."
      },
      "title": "Code Reviewer Pro",
      "description": "Reviews your code with detailed feedback",
      "model": "claude-sonnet-4",
      "aipoints_price": 25,
      "upvotes": 15,
      "downvotes": 1,
      "uses_count": 38,
      "tags": ["coding", "review"],
      "created_at": "2025-04-10T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3
  }
}
```

---

## Códigos de Error Comunes

| Código | Significado                                      |
|--------|--------------------------------------------------|
| `400`  | Bad Request — parámetros inválidos o faltantes   |
| `401`  | Unauthorized — sesión inválida o expirada        |
| `402`  | Payment Required — AI Points insuficientes       |
| `403`  | Forbidden — sin permisos para esta acción        |
| `404`  | Not Found — recurso no existe                    |
| `409`  | Conflict — recurso ya existe (username, compra)  |
| `422`  | Unprocessable Entity — validación fallida        |
| `500`  | Internal Server Error                            |

**Formato de error:**
```json
{
  "error": {
    "code": "INSUFFICIENT_AIPOINTS",
    "message": "You need 25 AI Points but only have 10.",
    "details": {
      "required": 25,
      "available": 10
    }
  }
}
```