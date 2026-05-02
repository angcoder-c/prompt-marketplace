import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'
import { ChevronRight, Sparkles } from 'lucide-react'

export const Route = createFileRoute('/auth')({ component: Auth })

function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (mode === 'signin') {
        const res = await authClient.signIn.email({ email, password })
        if (res.error) setMessage(res.error.message || 'Error al iniciar sesión')
        else navigate({ to: '/' })
      } else {
        const res = await authClient.signUp.email({ email, password, name: name || email })
        if (res.error) setMessage(res.error.message || 'Error al crear cuenta')
        else navigate({ to: '/' })
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const social = async (provider: 'google' | 'github') => {
    setLoading(true)
    setMessage(null)
    try {
      await authClient.signIn.social({ provider })
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error social')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col px-4 py-10">
        <div className="mx-auto w-full max-w-md rounded-[28px] border border-white/10 bg-[#111a34] p-8 shadow-[0_24px_90px_-40px_rgba(0,0,0,0.85)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-center text-4xl font-semibold tracking-tight text-white">Iniciar sesión</h2>

          {message ? <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-200">{message}</div> : null}

          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === 'signup' && (
              <input
                className="w-full rounded-2xl border border-white/10 bg-[#0d1429] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
              />
            )}
            <input
              className="w-full rounded-2xl border border-white/10 bg-[#0d1429] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="correo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <input
              className="w-full rounded-2xl border border-white/10 bg-[#0d1429] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />

            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">
              {mode === 'signin' ? 'Enviar enlace mágico' : 'Crear cuenta'}
              <ChevronRight className="h-4 w-4" />
            </button>

            <button type="button" className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100" onClick={() => social('google')} disabled={loading}>
              <span className="rounded-full bg-white text-sm font-bold text-slate-950">G</span>
              Iniciar sesión con Google
            </button>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#1a2238] px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/5" onClick={() => social('github')} disabled={loading}>
              Iniciar sesión con GitHub
            </button>

            <button type="button" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:bg-white/10" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? '¿Necesitas una cuenta? Cambiar a Crear cuenta' : '¿Ya tienes una cuenta? Cambiar a Iniciar sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
