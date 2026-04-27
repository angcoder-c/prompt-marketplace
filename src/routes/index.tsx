import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'ok' | 'error' | 'info'>('info')
  const [promptLoading, setPromptLoading] = useState(false)
  const [promptMessage, setPromptMessage] = useState<string | null>(null)
  const [promptMessageType, setPromptMessageType] = useState<'ok' | 'error' | 'info'>('info')

  const [tagsQuery, setTagsQuery] = useState('')
  const [tagFollowLoading, setTagFollowLoading] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'tag'>('all')

  const [votePromptId, setVotePromptId] = useState('')
  const [voteType, setVoteType] = useState<'up' | 'down'>('up')

  const [commentPromptId, setCommentPromptId] = useState('')
  const [commentContent, setCommentContent] = useState('')
  const [commentId, setCommentId] = useState('')

  const [promptId, setPromptId] = useState('')
  const [promptTitle, setPromptTitle] = useState('')
  const [promptContent, setPromptContent] = useState('')
  const [promptDescription, setPromptDescription] = useState('')
  const [promptTags, setPromptTags] = useState('')
  const [promptModel, setPromptModel] = useState('meta-llama/llama-3.3-70b-instruct:free')
  const [promptPrice, setPromptPrice] = useState('0')
  const [promptIsPublished, setPromptIsPublished] = useState(true)
  const [manualGeneratedResponse, setManualGeneratedResponse] = useState('')
  const [apiPreview, setApiPreview] = useState('')

  const session = authClient.useSession()
  const currentUser = useMemo(() => session.data?.user ?? null, [session.data?.user])

  const showMessage = (type: 'ok' | 'error' | 'info', text: string) => {
    setMessageType(type)
    setMessage(text)
  }

  const showPromptMessage = (type: 'ok' | 'error' | 'info', text: string) => {
    setPromptMessageType(type)
    setPromptMessage(text)
  }

  const handleEmailAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signin') {
        const res = await authClient.signIn.email({ email, password })
        if (res.error) {
          showMessage('error', res.error.message || 'No se pudo iniciar sesión')
        } else {
          showMessage('ok', 'Sesión iniciada correctamente')
        }
      } else {
        const res = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email,
        })

        if (res.error) {
          showMessage('error', res.error.message || 'No se pudo crear la cuenta')
        } else {
          showMessage('ok', 'Cuenta creada. Ahora puedes hacer setup de perfil.')
        }
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleSocial = async (provider: 'google' | 'github') => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await authClient.signIn.social({ provider })
      if (res.error) {
        showMessage('error', res.error.message || `No se pudo iniciar con ${provider}`)
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const res = await authClient.signOut()
      if (res.error) {
        showMessage('error', res.error.message || 'No se pudo cerrar sesión')
      } else {
        showMessage('ok', 'Sesión cerrada')
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleSetupProfile = async () => {
    if (!username.trim()) {
      showMessage('error', 'Debes escribir un username para setup')
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/users/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage =
          data?.error?.message || `Setup falló con status ${response.status}`
        showMessage('error', errorMessage)
        return
      }

      showMessage('ok', `Perfil creado para ${data.username}`)
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const parseTags = (raw: string) =>
    raw
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

  const handleCreatePrompt = async () => {
    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: promptTitle,
          content: promptContent,
          description: promptDescription || null,
          model: promptModel,
          aipoints_price: Number(promptPrice || 0),
          is_published: promptIsPublished,
          tags: parseTags(promptTags),
        }),
      })

      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      setPromptId(data.id_prompt || '')
      showPromptMessage('ok', `Prompt creado: ${data.id_prompt}`)
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleFetchPrompt = async () => {
    if (!promptId.trim()) {
      showPromptMessage('error', 'Escribe un prompt id primero')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/prompts/${promptId.trim()}`)
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Detalle de prompt obtenido')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleGeneratePromptResponse = async () => {
    if (!promptId.trim()) {
      showPromptMessage('error', 'Escribe un prompt id primero')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/prompts/${promptId.trim()}/generate-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: promptModel,
          manual_response: manualGeneratedResponse.trim() || undefined,
        }),
      })

      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        if (data?.error?.code === 'OPENROUTER_UNAVAILABLE') {
          showPromptMessage(
            'info',
            'OpenRouter no disponible. Pega una respuesta manual en el campo y vuelve a enviar.',
          )
          return
        }

        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', `Prompt response guardada: ${data.id_response}`)
      if (data.content) {
        setManualGeneratedResponse(String(data.content))
      }
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleListPrompts = async () => {
    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch('/api/prompts?page=1&limit=5&sort=recent')
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Listado de prompts cargado')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleListTags = async () => {
    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch('/api/tags')
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Listado de tags cargado')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleFetchTag = async () => {
    if (!tagsQuery.trim()) {
      showPromptMessage('error', 'Escribe un tag slug primero')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/tags/${tagsQuery.trim()}?page=1&limit=5&sort=recent`)
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Detalle de tag obtenido')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleFollowTag = async () => {
    if (!tagsQuery.trim()) {
      showPromptMessage('error', 'Escribe un tag slug primero')
      return
    }

    setTagFollowLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/tags/${tagsQuery.trim()}/follow`, { method: 'POST' })
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Tag seguido correctamente')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setTagFollowLoading(false)
    }
  }

  const handleUnfollowTag = async () => {
    if (!tagsQuery.trim()) {
      showPromptMessage('error', 'Escribe un tag slug primero')
      return
    }

    setTagFollowLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/tags/${tagsQuery.trim()}/follow`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Tag dejado de seguir')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setTagFollowLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showPromptMessage('error', 'Escribe una busqueda primero')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const url = new URL('/api/search', window.location.origin)
      url.searchParams.set('q', searchQuery)
      url.searchParams.set('type', searchType)
      url.searchParams.set('page', '1')
      url.searchParams.set('limit', '10')

      const response = await fetch(url)
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', `Busqueda completada: ${data.pagination?.total || 0} resultados`)
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleVote = async () => {
    if (!votePromptId.trim()) {
      showPromptMessage('error', 'Escribe un prompt id primero')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/prompts/${votePromptId.trim()}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_type: voteType }),
      })
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', `Voto ${data.vote_type} registrado`)
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleListComments = async () => {
    if (!commentPromptId.trim()) {
      showPromptMessage('error', 'Escribe un prompt id primero')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const url = new URL(`/api/prompts/${commentPromptId.trim()}/comments`, window.location.origin)
      url.searchParams.set('page', '1')
      url.searchParams.set('limit', '10')

      const response = await fetch(url)
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Comentarios cargados')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleCreateComment = async () => {
    if (!commentPromptId.trim()) {
      showPromptMessage('error', 'Escribe un prompt id primero')
      return
    }
    if (!commentContent.trim()) {
      showPromptMessage('error', 'Escribe el contenido del comentario')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/prompts/${commentPromptId.trim()}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      setCommentContent('')
      showPromptMessage('ok', 'Comentario creado')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleUpdateComment = async () => {
    if (!commentPromptId.trim()) {
      showPromptMessage('error', 'Escribe un prompt id primero')
      return
    }
    if (!commentId.trim()) {
      showPromptMessage('error', 'Escribe un comment id primero')
      return
    }
    if (!commentContent.trim()) {
      showPromptMessage('error', 'Escribe el contenido del comentario')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/prompts/${commentPromptId.trim()}/comments/${commentId.trim()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentContent.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Comentario actualizado')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  const handleDeleteComment = async () => {
    if (!commentPromptId.trim()) {
      showPromptMessage('error', 'Escribe un prompt id primero')
      return
    }
    if (!commentId.trim()) {
      showPromptMessage('error', 'Escribe un comment id primero')
      return
    }

    setPromptLoading(true)
    setPromptMessage(null)

    try {
      const response = await fetch(`/api/prompts/${commentPromptId.trim()}/comments/${commentId.trim()}`, {
        method: 'DELETE',
      })
      const data = await response.json().catch(() => ({}))
      setApiPreview(JSON.stringify(data, null, 2))

      if (!response.ok) {
        showPromptMessage('error', data?.error?.message || `Error ${response.status}`)
        return
      }

      showPromptMessage('ok', 'Comentario eliminado')
    } catch (error) {
      showPromptMessage('error', error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setPromptLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Prompt Marketplace
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            Probar autenticación
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Este formulario usa Better Auth para email/password y social login (Google y
            GitHub).
          </p>

          <div className="mt-6 flex gap-2 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'signin'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`w-full rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <form onSubmit={handleEmailAuth} className="mt-6 space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">Nombre</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
                />
              </label>
            )}

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? 'Procesando...'
                : mode === 'signin'
                  ? 'Entrar con email'
                  : 'Registrar con email'}
            </button>
          </form>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSocial('google')}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() => handleSocial('github')}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continuar con GitHub
            </button>
          </div>

          {message && (
            <p
              className={`mt-5 rounded-xl px-3 py-2 text-sm ${
                messageType === 'ok'
                  ? 'bg-emerald-100 text-emerald-800'
                  : messageType === 'error'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
              }`}
            >
              {message}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="text-xl font-semibold">Estado de sesión</h2>

          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Session status:</span>{' '}
              <span className="text-slate-700">{session.isPending ? 'loading' : session.data ? 'active' : 'none'}</span>
            </p>
            <p>
              <span className="font-medium">User ID:</span>{' '}
              <span className="text-slate-700">{currentUser?.id || '-'}</span>
            </p>
            <p>
              <span className="font-medium">Email:</span>{' '}
              <span className="text-slate-700">{currentUser?.email || '-'}</span>
            </p>
            <p>
              <span className="font-medium">Nombre:</span>{' '}
              <span className="text-slate-700">{currentUser?.name || '-'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading || !currentUser}
            className="mt-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cerrar sesión
          </button>

          <hr className="my-6 border-slate-200" />

          <h3 className="text-base font-semibold">Setup de perfil local</h3>
          <p className="mt-1 text-sm text-slate-600">
            Llama a <code>POST /api/users/setup</code> para crear registro en tabla User.
          </p>

          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
            />
          </label>

          <button
            type="button"
            onClick={handleSetupProfile}
            disabled={loading || !currentUser}
            className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Ejecutar setup
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 md:col-span-2">
          <h2 className="text-xl font-semibold">Probar endpoints de Prompt</h2>
          <p className="mt-1 text-sm text-slate-600">
            Crea, consulta y genera prompt responses con selector de modelo y fallback manual.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Prompt ID</span>
              <input
                value={promptId}
                onChange={(e) => setPromptId(e.target.value)}
                placeholder="uuid del prompt"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Modelo</span>
              <select
                value={promptModel}
                onChange={(e) => setPromptModel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              >
                <option value="meta-llama/llama-3.3-70b-instruct:free">llama-3.3-70b (free)</option>
                <option value="openai/gpt-4o-mini">gpt-4o-mini</option>
                <option value="anthropic/claude-3.5-sonnet">claude-3.5-sonnet</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Título</span>
              <input
                value={promptTitle}
                onChange={(e) => setPromptTitle(e.target.value)}
                placeholder="Code Reviewer Pro"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Contenido del prompt</span>
              <textarea
                value={promptContent}
                onChange={(e) => setPromptContent(e.target.value)}
                placeholder="You are an expert..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Descripción</span>
              <input
                value={promptDescription}
                onChange={(e) => setPromptDescription(e.target.value)}
                placeholder="Short description"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Precio AI Points</span>
              <input
                value={promptPrice}
                onChange={(e) => setPromptPrice(e.target.value)}
                type="number"
                min={0}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Tags (coma separadas)</span>
              <input
                value={promptTags}
                onChange={(e) => setPromptTags(e.target.value)}
                placeholder="coding, review"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
              <input
                type="checkbox"
                checked={promptIsPublished}
                onChange={(e) => setPromptIsPublished(e.target.checked)}
              />
              Publicar prompt
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Respuesta manual (usa este campo cuando OpenRouter no esté disponible)
              </span>
              <textarea
                value={manualGeneratedResponse}
                onChange={(e) => setManualGeneratedResponse(e.target.value)}
                placeholder="Pega aquí una respuesta manual..."
                rows={4}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-4">
            <button
              type="button"
              onClick={handleCreatePrompt}
              disabled={promptLoading || !currentUser}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Crear prompt
            </button>
            <button
              type="button"
              onClick={handleFetchPrompt}
              disabled={promptLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ver detalle
            </button>
            <button
              type="button"
              onClick={handleGeneratePromptResponse}
              disabled={promptLoading || !currentUser}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generar response
            </button>
            <button
              type="button"
              onClick={handleListPrompts}
              disabled={promptLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Listar prompts
            </button>
          </div>

          {promptMessage && (
            <p
              className={`mt-4 rounded-xl px-3 py-2 text-sm ${
                promptMessageType === 'ok'
                  ? 'bg-emerald-100 text-emerald-800'
                  : promptMessageType === 'error'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-slate-100 text-slate-700'
              }`}
            >
              {promptMessage}
            </p>
          )}

          <pre className="mt-4 max-h-96 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
            {apiPreview || 'Aquí aparecerá la respuesta JSON de los endpoints'}
          </pre>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 md:col-span-2">
          <h2 className="text-xl font-semibold">Endpoints de Tags</h2>
          <p className="mt-1 text-sm text-slate-600">
            Lista tags, consulta detalle, sigue y deja de seguir.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Tag Slug</span>
              <input
                value={tagsQuery}
                onChange={(e) => setTagsQuery(e.target.value)}
                placeholder="coding, ai, etc"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-4">
            <button
              type="button"
              onClick={handleListTags}
              disabled={promptLoading}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Listar tags
            </button>
            <button
              type="button"
              onClick={handleFetchTag}
              disabled={promptLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Ver detalle
            </button>
            <button
              type="button"
              onClick={handleFollowTag}
              disabled={tagFollowLoading || !currentUser}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Seguir tag
            </button>
            <button
              type="button"
              onClick={handleUnfollowTag}
              disabled={tagFollowLoading || !currentUser}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Dejar de seguir
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 md:col-span-2">
          <h2 className="text-xl font-semibold">Endpoints de Search</h2>
          <p className="mt-1 text-sm text-slate-600">
            Busca prompts por query, tipo all o tag.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Query</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="buscar prompts..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Tipo</span>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'all' | 'tag')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              >
                <option value="all">Todos</option>
                <option value="tag">Por tag</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={promptLoading}
            className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Buscar
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 md:col-span-2">
          <h2 className="text-xl font-semibold">Endpoints de Votes</h2>
          <p className="mt-1 text-sm text-slate-600">
            Vota por un prompt (up/down).
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Prompt ID</span>
              <input
                value={votePromptId}
                onChange={(e) => setVotePromptId(e.target.value)}
                placeholder="uuid del prompt"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Tipo de voto</span>
              <select
                value={voteType}
                onChange={(e) => setVoteType(e.target.value as 'up' | 'down')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              >
                <option value="up">Upvote</option>
                <option value="down">Downvote</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleVote}
            disabled={promptLoading || !currentUser}
            className="mt-5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Votar
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 md:col-span-2">
          <h2 className="text-xl font-semibold">Endpoints de Comments</h2>
          <p className="mt-1 text-sm text-slate-600">
            Lista, crea, actualiza y elimina comentarios.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Prompt ID</span>
              <input
                value={commentPromptId}
                onChange={(e) => setCommentPromptId(e.target.value)}
                placeholder="uuid del prompt"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Comment ID (para update/delete)</span>
              <input
                value={commentId}
                onChange={(e) => setCommentId(e.target.value)}
                placeholder="uuid del comentario"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Contenido</span>
              <textarea
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Escribe tu comentario..."
                rows={3}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-indigo-500 transition focus:ring"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-2 md:grid-cols-4">
            <button
              type="button"
              onClick={handleListComments}
              disabled={promptLoading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Listar
            </button>
            <button
              type="button"
              onClick={handleCreateComment}
              disabled={promptLoading || !currentUser}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Crear
            </button>
            <button
              type="button"
              onClick={handleUpdateComment}
              disabled={promptLoading || !currentUser}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleDeleteComment}
              disabled={promptLoading || !currentUser}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Eliminar
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
