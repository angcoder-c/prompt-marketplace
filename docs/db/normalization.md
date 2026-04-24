# Prompt Marketplace DB — Normalización

## Relación sin normalizar

```
Prompt(
    id_prompt, title, content, response_id, model, description, created_at, updated_at, uses_count, upvotes, downvotes, aipoints_price

    user_id, username, email, password_hash, aipoints, airank, avatar_url, provider, provider_id, bio, created_at, updated_at
    
    comment_id, comment_user_id, comment_prompt_id, comment_content

    id_purchase, buyer_user_id, prompt_id, aipoints_spent, purchased_at

    id_tag, name, slug, description

    user_id, tag_id, followed_at

    prompt_id, tag_id

    id_response, prompt_id, content, model, tokens_prompt, tokens_response, generated_at
)
```



## 1NF

```plaintext
User(id_user, username, email, password_hash, provider, provider_id, avatar_url, bio, aipoints, airank, created_at, updated_at)
```

```plaintext
Prompt(id_prompt, user_id, title, content, description, model, aipoints_price, upvotes, downvotes, uses_count, is_published, created_at, updated_at)
```

```plaintext
PromptResponse(id_response, prompt_id, content, model, tokens_prompt, tokens_response, generated_at)
```

```plaintext
Tag(id_tag, name, slug, description)
```

```plaintext
PromptTag(prompt_id, tag_id)
```

```plaintext
UserTagFollow(user_id, tag_id, followed_at)
```

```plaintext
Vote(id_vote, user_id, prompt_id, vote_type, created_at)
```

```plaintext
Comment(id_comment, user_id, prompt_id, content, created_at, updated_at)
```

```plaintext
Purchase(id_purchase, buyer_user_id, prompt_id, aipoints_spent, purchased_at)
```

## 2NF

En este punto todos los atributos no clave depender totalmente de una calve primiaria

## 3NF

- User

`airank` depende funcionalmente de `aipoints` + `upvotes`

- PromptResponse

Tiene `model`, pero `model` ya está en `Prompt`.

```plaintext
User(id_user, username, email, password_hash, provider, provider_id, avatar_url, bio, aipoints, created_at, updated_at)
```

```plaintext
Prompt(id_prompt, user_id, title, content, description, model, aipoints_price, upvotes, downvotes, uses_count, is_published, created_at, updated_at)
```

```plaintext
PromptResponse(id_response, prompt_id, content, model, tokens_prompt, tokens_response, generated_at)
```

```plaintext
Tag(id_tag, name, slug, description)
```

```plaintext
PromptTag(prompt_id, tag_id)
```

```plaintext
UserTagFollow(user_id, tag_id, followed_at)
```

```plaintext
Vote(id_vote, user_id, prompt_id, vote_type, created_at)
```

```plaintext
Comment(id_comment, user_id, prompt_id, content, created_at, updated_at)
```

```plaintext
Purchase(id_purchase, buyer_user_id, prompt_id, aipoints_spent, purchased_at)
```

## BCNF

Ya se encuentra en BCNF, porque las claves primarias utilizadas son también superclaves.


## Esquema final

```plaintext
User(id_user, username, email, password_hash, provider, provider_id, avatar_url, bio, aipoints, created_at, updated_at)
```

```plaintext
Prompt(id_prompt, user_id, title, content, description, model, aipoints_price, upvotes, downvotes, uses_count, is_published, created_at, updated_at)
```

```plaintext
PromptResponse(id_response, prompt_id, content, model, tokens_prompt, tokens_response, generated_at)
```

```plaintext
Tag(id_tag, name, slug, description)
```

```plaintext
PromptTag(prompt_id, tag_id)
```

```plaintext
UserTagFollow(user_id, tag_id, followed_at)
```

```plaintext
Vote(id_vote, user_id, prompt_id, vote_type, created_at)
```

```plaintext
Comment(id_comment, user_id, prompt_id, content, created_at, updated_at)
```

```plaintext
Purchase(id_purchase, buyer_user_id, prompt_id, aipoints_spent, purchased_at)
```