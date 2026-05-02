import { useState, type ReactNode } from 'react'
import { useNavigate, createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Sparkles } from 'lucide-react'

import { authClient } from '#/lib/auth-client'
import { MODELS } from '#/types'

export const Route = createFileRoute('/create')({ component: CreatePromptPage })

function CreatePromptPage() {
  const navigate = useNavigate()
  const session = authClient.useSession()
  const user = session.data?.user ?? null

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState(MODELS[0] || '')
  const [price, setPrice] = useState('0')
  const [tags, setTags] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const [generatedResponse, setGeneratedResponse] = useState('')
  const [responseModel, setResponseModel] = useState('')
  const [loadingResponse, setLoadingResponse] = useState(false)
  const [manualResponse, setManualResponse] = useState('')

  const generateResponse = async () => {
    if (!content.trim()) {
      setMessage('Escribe el contenido del prompt primero')
      return
    }
    if (!model) {
      setMessage('Selecciona un modelo primero')
      return
    }

    setLoadingResponse(true)
    setMessage(null)

    try {
      const response = await fetch('/api/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content, model }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.fallback?.manual_required) {
          setMessage('No se pudo generar automáticamente. Pega la respuesta manual.')
        } else {
          setMessage(data.error?.message || 'Error generando respuesta')
        }
        return
      }

      setGeneratedResponse(data.content)
      setResponseModel(data.model || model)
      setManualResponse('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoadingResponse(false)
    }
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    const finalResponse = manualResponse.trim() || generatedResponse
    const finalResponseModel = manualResponse.trim() ? model : responseModel

    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          description: description || null,
          model,
          aipoints_price: Number(price || 0),
          is_published: true,
          tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          response: finalResponse
            ? {
                content: finalResponse,
                model: finalResponseModel || model,
              }
            : undefined,
        }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setMessage(data?.error?.message || 'No se pudo crear el prompt')
        return
      }

      navigate({ to: '/' })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6">
        <div className="mb-6 flex items-center justify-between rounded-3xl border border-white/10 bg-[#0c1326] px-5 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Volver al marketplace
          </Link>
          <div className="flex items-center gap-2 rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950">
            <Sparkles className="h-4 w-4" />
            Crear Prompt
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <form onSubmit={submit} className="space-y-4 rounded-3xl border border-white/10 bg-[#111a34] p-5 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">Detalles del prompt</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Crear Nuevo Prompt</h1>
              <p className="mt-2 text-sm text-slate-400">Establece el título, instrucciones y precio antes de publicar en el marketplace.</p>
            </div>

            {message ? <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">{message}</div> : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Título del prompt">
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="ej. Escritor Creativo Maestro v2.0" />
              </Field>

              <Field label="Modelo objetivo">
                <div className="relative">
                  <input
                    list="model-list"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="Selecciona o escribe el modelo..."
                  />
                  <datalist id="model-list">
                    {MODELS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </Field>
            </div>

            <Field label="Instrucciones del sistema">
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="min-h-64 w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Escribe tus instrucciones complejas aquí..." />
            </Field>

            <button
              type="button"
              onClick={generateResponse}
              disabled={loadingResponse || !content.trim() || !model}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loadingResponse ? 'Generando...' : 'Generar respuesta'}
            </button>

            {(generatedResponse || manualResponse) && (
              <div className="rounded-2xl border border-green-300/20 bg-green-300/10 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-300">Respuesta generada</p>
                <pre className="whitespace-pre-wrap text-sm text-green-100">{generatedResponse || manualResponse}</pre>
                <p className="mt-2 text-xs text-green-400">Modelo: {responseModel || model}</p>
              </div>
            )}

            <Field label="O pega una respuesta manual">
              <textarea
                value={manualResponse}
                onChange={(e) => {
                  setManualResponse(e.target.value)
                  setGeneratedResponse('')
                }}
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Si no puedes generar automáticamente, pega aquí la respuesta y especifica el modelo usado..."
              />
            </Field>

            {manualResponse && (
              <Field label="Modelo usado (para respuesta manual)">
                <div className="relative">
                  <input
                    list="model-list-manual"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="Selecciona o escribe el modelo..."
                  />
                  <datalist id="model-list-manual">
                    {MODELS.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                </div>
              </Field>
            )}

            <Field label="Descripción del Marketplace">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-28 w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="Describe qué hace este prompt para posibles compradores..." />
            </Field>

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Precio AIP">
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" min="0" className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" />
              </Field>

              <Field label="Etiquetas">
                <input value={tags} onChange={(e) => setTags(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#0c1326] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500" placeholder="seo, copywriting, launch" />
              </Field>
            </div>

            <button disabled={loading || !user} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">
              {loading ? 'Creando...' : 'Crear Prompt'}
            </button>
            {!user ? <p className="text-xs text-slate-400">Necesitas una sesión activa para publicar prompts.</p> : null}
          </form>

          <aside className="space-y-4 rounded-3xl border border-white/10 bg-[#111a34] p-5 shadow-[0_16px_60px_-28px_rgba(0,0,0,0.75)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Vista previa en vivo</p>
            <div className="rounded-3xl border border-white/10 bg-[#0c1326] p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Título</div>
              <div className="mt-2 text-lg font-semibold text-white">{title || 'Tu título de prompt'}</div>
              <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">Descripción</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{description || 'Tu descripción del marketplace aparecerá aquí.'}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  )
}
