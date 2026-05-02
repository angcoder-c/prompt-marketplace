import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, X } from 'lucide-react'

import { Button } from './ui/button'
import { MODELS } from '#/types'

export type PromptDetail = {
  id_prompt: string
  user: {
    id_user: string
    username: string
    avatar_url: string | null
    airank: number
  }
  title: string
  content: string | null
  description: string | null
  model: string
  aipoints_price: number
  upvotes: number
  downvotes: number
  uses_count: number
  is_published: boolean
  is_purchased: boolean
  is_owner: boolean
  tags: string[]
  response: {
    content: string
    tokens_prompt: number
    tokens_response: number
  }
  created_at: string
  updated_at: string
}

type PurchaseResponse = {
  id_purchase: string
  prompt_id: string
  aipoints_spent: number
  remaining_aipoints: number
  prompt_content: string
  purchased_at: string
}

type Comment = {
  id_comment: string
  user_id: string
  username: string
  content: string
  created_at: string
  updated_at: string
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

export function PromptDetailModal({
  promptId,
  open,
  onClose,
  fallbackPrompt,
}: {
  promptId: string | null
  open: boolean
  onClose: () => void
  fallbackPrompt?: Partial<PromptDetail> | null
}) {
  const [prompt, setPrompt] = useState<PromptDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editModel, setEditModel] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editCommentContent, setEditCommentContent] = useState('')

  useEffect(() => {
    if (!open || !promptId) {
      setPrompt(null)
      setError(null)
      setLoading(false)
      setCopied(false)
      setPurchaseLoading(false)
      setPurchaseError(null)
      setPurchaseSuccess(null)
      setEditMode(false)
      return
    }

    const controller = new AbortController()
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      setCopied(false)
      setPurchaseLoading(false)
      setPurchaseError(null)
      setPurchaseSuccess(null)
      setEditMode(false)

      try {
        const response = await fetch(`/api/prompts/${promptId}`, {
          headers: { Accept: 'application/json' },
          credentials: 'include',
          signal: controller.signal,
        })

        const data = (await response.json().catch(() => null)) as PromptDetail | { error?: { message?: string } } | null

        if (!response.ok) {
          throw new Error((data as { error?: { message?: string } } | null)?.error?.message || 'No se pudo cargar el detalle del prompt')
        }

        if (!cancelled) {
          setPrompt(data as PromptDetail)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error inesperado')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [open, promptId])

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open || !promptId || !prompt) return

    const loadComments = async () => {
      setCommentsLoading(true)
      try {
        const response = await fetch(`/api/prompts/${promptId}/comments`, {
          credentials: 'include',
        })
        const data = await response.json().catch(() => ({ data: [] }))
        setComments(data.data ?? [])
      } catch {
        setComments([])
      } finally {
        setCommentsLoading(false)
      }
    }

    void loadComments()
  }, [open, promptId, prompt])

  const resolvedPrompt = prompt ?? fallbackPrompt ?? null

  const canPurchase =
    Boolean(resolvedPrompt) &&
    !Boolean(resolvedPrompt?.is_owner) &&
    !Boolean(resolvedPrompt?.is_purchased)

  const handlePurchase = async () => {
    if (!promptId || !canPurchase || purchaseLoading) {
      return
    }

    setPurchaseLoading(true)
    setPurchaseError(null)
    setPurchaseSuccess(null)

    try {
      const response = await fetch(`/api/prompts/${promptId}/purchase`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      })

      const data = (await response.json().catch(() => null)) as
        | PurchaseResponse
        | { error?: { message?: string } }
        | null

      if (!response.ok) {
        throw new Error(
          (data as { error?: { message?: string } } | null)?.error?.message ||
            'No se pudo completar la compra del prompt',
        )
      }

      const purchase = data as PurchaseResponse
      setPrompt((prev) => {
        if (!prev) {
          return prev
        }

        return {
          ...prev,
          is_purchased: true,
          content: purchase.prompt_content,
        }
      })
      setPurchaseSuccess(
        `Compra exitosa. Gastaste ${purchase.aipoints_spent} AIP. Restantes: ${purchase.remaining_aipoints} AIP.`,
      )
    } catch (err) {
      setPurchaseError(err instanceof Error ? err.message : 'Error inesperado al comprar el prompt')
    } finally {
      setPurchaseLoading(false)
    }
  }

  const startEdit = () => {
    if (!resolvedPrompt) return
    setEditTitle(resolvedPrompt.title ?? '')
    setEditContent(resolvedPrompt.content ?? '')
    setEditDescription(resolvedPrompt.description ?? '')
    setEditModel(resolvedPrompt.model ?? '')
    setEditPrice(String(resolvedPrompt.aipoints_price ?? 0))
    setEditTags((resolvedPrompt.tags ?? []).join(', '))
    setEditMode(true)
    setEditError(null)
  }

  const cancelEdit = () => {
    setEditMode(false)
    setEditError(null)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptId || !resolvedPrompt?.is_owner || editLoading) return

    setEditLoading(true)
    setEditError(null)

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle.trim(),
          content: editContent.trim(),
          description: editDescription.trim() || null,
          model: editModel.trim(),
          aipoints_price: Number(editPrice),
          tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error?.message || 'No se pudo actualizar el prompt')
      }

      setPrompt(data)
      setEditMode(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!promptId || !resolvedPrompt?.is_owner || deleteLoading) return

    if (!window.confirm('¿Estás seguro de eliminar este prompt? Esta acción no se puede deshacer.')) {
      return
    }

    setDeleteLoading(true)

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error?.message || 'No se pudo eliminar el prompt')
      }

      onClose()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptId || !newComment.trim() || commentLoading) return

    setCommentLoading(true)

    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [...prev, data])
        setNewComment('')
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al agregar comentario')
    } finally {
      setCommentLoading(false)
    }
  }

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id_comment)
    setEditCommentContent(comment.content)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditCommentContent('')
  }

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptId || !editingCommentId || !editCommentContent.trim() || commentLoading) return

    setCommentLoading(true)

    try {
      const response = await fetch(`/api/prompts/${promptId}/comments/${editingCommentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: editCommentContent.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => prev.map(c => c.id_comment === editingCommentId ? data : c))
        cancelEditComment()
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar comentario')
    } finally {
      setCommentLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este comentario?')) return

    try {
      const response = await fetch(`/api/prompts/${promptId}/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id_comment !== commentId))
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar comentario')
    }
  }

  if (!open || typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#050816]/80 px-4 py-6 backdrop-blur-md overflow-y-auto"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="relative w-full max-w-4xl my-8 rounded-4xl border border-white/10 bg-[#0c1326] shadow-[0_24px_120px_-40px_rgba(0,0,0,0.95)] max-h-[80vh] overflow-y-auto">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300" />

        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Detalle del prompt</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {editMode ? 'Editar prompt' : resolvedPrompt?.title ?? 'Cargando prompt...'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {resolvedPrompt?.is_owner && !editMode ? (
              <>
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={editMode ? cancelEdit : onClose}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label={editMode ? 'Cancelar edición' : 'Cerrar modal'}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <div className="space-y-5 p-5 sm:p-6">
            {loading && !resolvedPrompt ? (
              <div className="space-y-3">
                <div className="h-6 w-3/4 animate-pulse rounded-full bg-white/10" />
                <div className="h-24 animate-pulse rounded-3xl bg-white/5" />
                <div className="h-48 animate-pulse rounded-3xl bg-white/5" />
              </div>
            ) : error ? (
              <div className="rounded-3xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div>
            ) : resolvedPrompt ? (
              editMode ? (
                <form
                  onSubmit={handleUpdate}
                  className="space-y-4"
                >
                  {editError ? (
                    <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                      {editError}
                    </div>
                  ) : null}

                  <Field label="Título">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none"
                    />
                  </Field>

                  <Field label="Modelo">
                    <input
                      list="edit-model-list"
                      value={editModel}
                      onChange={(e) => setEditModel(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none"
                      placeholder="Selecciona o escribe el modelo..."
                    />
                    <datalist id="edit-model-list">
                      {MODELS.map((m) => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </Field>

                  <Field label="Contenido">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-64 w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none"
                    />
                  </Field>

                  <Field label="Descripción">
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none"
                    />
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Precio AIP">
                      <input
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        type="number"
                        min="0"
                        className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none"
                      />
                    </Field>

                    <Field label="Tags (separados por coma)">
                      <input
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none"
                        placeholder="seo, copywriting, launch"
                      />
                    </Field>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="inline-flex items-center justify-center rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {editLoading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{resolvedPrompt.model}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{resolvedPrompt.aipoints_price ?? 0} AIP</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{resolvedPrompt.upvotes} a favor / {resolvedPrompt.downvotes} en contra</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{resolvedPrompt.uses_count} uses</span>
                  </div>

                  {resolvedPrompt.description ? (
                    <p className="text-sm leading-7 text-slate-300 sm:text-base">{resolvedPrompt.description}</p>
                  ) : null}

                  <div className="rounded-[1.75rem] border border-white/10 bg-[#111a34] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">Contenido</p>
                      {resolvedPrompt.content ? (
                        <Button
                          type="button"
                          variant="default"
                          className="h-9 rounded-2xl border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                          onClick={async () => {
                            await navigator.clipboard.writeText(resolvedPrompt.content ?? '')
                            setCopied(true)
                            window.setTimeout(() => setCopied(false), 1500)
                          }}
                        >
                          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                          {copied ? 'Copiado' : 'Copiar contenido'}
                        </Button>
                      ) : null}
                    </div>

                    {resolvedPrompt.content ? (
                      <pre className="max-h-[40vh] overflow-auto whitespace-pre-wrap break-words rounded-3xl border border-white/10 bg-[#0c1326] p-4 text-sm leading-7 text-slate-200">
                        {resolvedPrompt.content}
                      </pre>
                    ) : (
                      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                        El contenido completo está protegido. Abre el prompt desde una cuenta con acceso para verlo.
                      </div>
                    )}
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-[#111a34] p-4">
                    <p className="text-sm font-semibold text-white">Respuesta generada</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{resolvedPrompt.response?.content}</p>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Comentarios</p>
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Agrega un comentario..."
                        className="flex-1 rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-2 text-sm text-white outline-none placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {commentLoading ? 'Enviando...' : 'Comentar'}
                      </button>
                    </form>

                    {commentsLoading ? (
                      <div className="space-y-2">
                        <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
                        <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {comments.map((comment) => (
                          <div key={comment.id_comment} className="rounded-2xl border border-white/10 bg-[#111a34] p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-xs text-slate-400">{comment.username}</p>
                                {editingCommentId === comment.id_comment ? (
                                  <form onSubmit={handleUpdateComment} className="mt-2">
                                    <textarea
                                      value={editCommentContent}
                                      onChange={(e) => setEditCommentContent(e.target.value)}
                                      className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-2 text-sm text-white outline-none"
                                      rows={3}
                                    />
                                    <div className="mt-2 flex gap-2">
                                      <button
                                        type="submit"
                                        disabled={commentLoading}
                                        className="rounded-2xl bg-cyan-300 px-3 py-1 text-xs font-semibold text-slate-950 disabled:opacity-40"
                                      >
                                        Guardar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelEditComment}
                                        className="rounded-2xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200"
                                      >
                                        Cancelar
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <p className="mt-2 text-sm text-slate-300">{comment.content}</p>
                                )}
                                <p className="mt-1 text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</p>
                              </div>
                              {resolvedPrompt?.is_owner && editingCommentId !== comment.id_comment ? (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => startEditComment(comment)}
                                    className="text-xs text-slate-400 hover:text-white"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteComment(comment.id_comment)}
                                    className="text-xs text-rose-400 hover:text-rose-300"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-sm text-slate-400">No hay comentarios aún.</p>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )
            ) : null}
          </div>

          <div className="space-y-4 border-t border-white/10 bg-white/2 p-5 sm:p-6 lg:border-l lg:border-t-0">
            <div className="rounded-[1.75rem] border border-white/10 bg-[#111a34] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Autor</p>
              <div className="mt-3 text-lg font-semibold text-white">{resolvedPrompt?.user?.username ?? 'Desconocido'}</div>
              <div className="mt-1 text-sm text-slate-400">AI Rank {resolvedPrompt?.user?.airank ?? 0}</div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#111a34] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {resolvedPrompt?.tags?.length ? (
                  resolvedPrompt.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">Sin tags</span>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-[#111a34] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estado</p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <div>{resolvedPrompt?.is_published ? 'Publicado' : 'Borrador'}</div>
                <div>{resolvedPrompt?.is_owner ? 'Eres el autor' : resolvedPrompt?.is_purchased ? 'Ya lo compraste' : 'Acceso restringido'}</div>
                <div>Creado: {resolvedPrompt?.created_at ? new Date(resolvedPrompt.created_at).toLocaleString() : 'N/A'}</div>
              </div>
            </div>

            {purchaseError ? (
              <div className="rounded-[1.75rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                {purchaseError}
              </div>
            ) : null}

            {purchaseSuccess ? (
              <div className="rounded-[1.75rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {purchaseSuccess}
              </div>
            ) : null}

            {canPurchase ? (
              <button
                type="button"
                onClick={handlePurchase}
                disabled={purchaseLoading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {purchaseLoading
                  ? 'Procesando compra...'
                  : `Comprar por ${resolvedPrompt?.aipoints_price ?? 0} AIP`}
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              Cerrar detalle
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default PromptDetailModal
