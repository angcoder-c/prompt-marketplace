import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import type { MarketplaceMe } from '../types'
import { Folder, Home, Menu, Star, Trophy, X } from 'lucide-react'
import { useCallback } from 'react'

export function Sidebar({
  active,
}: {
  active: 'home' | 'ranking' | 'favorites' | 'categories' | 'my-prompts'
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const session = authClient.useSession()
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useMemo(() => !!session.data?.user, [session.data?.user])
  const [profile, setProfile] = useState<MarketplaceMe | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [tags, setTags] = useState<Array<{ id_tag: string; name: string; slug: string }>>([])
  const [tagsLoading, setTagsLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
    } finally {
      window.location.assign('/')
    }
  }

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isAuthenticated) {
      setProfile(null)
      return
    }

    let isCancelled = false

    const loadProfile = async () => {
      setProfileLoading(true)

      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) {
          if (!isCancelled) setProfile(null)
          return
        }

        const data = (await response.json()) as MarketplaceMe
        if (!isCancelled) setProfile(data)
      } catch {
        if (!isCancelled) setProfile(null)
      } finally {
        if (!isCancelled) setProfileLoading(false)
      }
    }

    void loadProfile()

    return () => { isCancelled = true }
  }, [isAuthenticated])

  useEffect(() => {
    let cancelled = false
    const loadTags = async () => {
      setTagsLoading(true)
      try {
        const res = await fetch('/api/tags/', { headers: { Accept: 'application/json' } })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setTags(data.data ?? [])
      } catch {
        // ignore
      } finally {
        if (!cancelled) setTagsLoading(false)
      }
    }
    void loadTags()
    return () => { cancelled = true }
  }, [])

  const navigateToTag = useCallback((slug: string) => {
    navigate({ to: "/tags/$slug", params: { slug } })
  }, [navigate])

  const handleLinkClick = () => setMobileOpen(false)

  const resolvedName = profile?.username ?? session.data?.user?.name
  const resolvedAvatar = profile?.avatar_url ?? session.data?.user?.image ?? null
  const resolvedRank = profile ? `AI Rank ${profile.airank} • ${profile.aipoints} AIP` : null

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-2xl border border-white/10 bg-[#0b1020]/95 p-2 text-white backdrop-blur-xl lg:hidden"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={
        "fixed left-0 top-0 z-40 flex h-screen w-72 flex-col gap-5 border-r border-white/10 " +
        "bg-[#0b1020]/95 p-4 pt-5 text-slate-200 backdrop-blur-xl " +
        "transition-transform duration-300 lg:translate-x-0 " +
        (mobileOpen ? "translate-x-0" : "-translate-x-full")
      }>
        <Link className='flex flex-row gap-1' to="/" onClick={handleLinkClick}>
          <span className="font-bold leading-none text-2xl text-cyan-300">Prompt</span>
          <span className="font-bold leading-none text-2xl text-white">Marketplace</span>
        </Link>

        <nav className="space-y-2 text-sm">
          <Link to="/" onClick={handleLinkClick} className={
            "flex items-center gap-2 rounded-2xl px-3 py-2 transition " +
            (active === 'home' ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white')
          }>
            <Home className="h-4 w-4" />
            <span>Inicio</span>
          </Link>

          <Link to="/ranking" onClick={handleLinkClick} className={
            "flex items-center gap-2 rounded-2xl px-3 py-2 transition " +
            (active === 'ranking' ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white')
          }>
            <Trophy className="h-4 w-4" />
            <span>Ranking</span>
          </Link>

          {isAuthenticated && (
            <Link to="/favorites" onClick={handleLinkClick} className={
              "flex items-center gap-2 rounded-2xl px-3 py-2 transition " +
              (active === 'favorites' ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white')
            }>
              <Star className="h-4 w-4" />
              <span>Favoritos</span>
            </Link>
          )}

          {isAuthenticated && (
            <Link to="/my-prompts" onClick={handleLinkClick} className={
              "flex items-center gap-2 rounded-2xl px-3 py-2 transition " +
              (active === 'my-prompts' ? 'border border-cyan-300/20 bg-cyan-300/10 text-cyan-200' : 'text-slate-300 hover:bg-white/5 hover:text-white')
            }>
              <Folder className="h-4 w-4" />
              <span>Mis prompts</span>
            </Link>
          )}

          <Separator className="border-white/10" />

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-500">Categorías</p>
            <div className="max-h-[35dvh] overflow-y-auto pr-2">
              {tagsLoading && <div className="text-xs text-slate-400">Cargando...</div>}
              {tags.map((t) => (
                <button
                  key={t.id_tag}
                  onClick={() => { navigateToTag(t.slug); setMobileOpen(false) }}
                  className="block w-full truncate rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  {t.name}
                </button>
              ))}
              {tags.length === 0 && !tagsLoading && (
                <div className="text-xs text-slate-400">No hay categorías</div>
              )}
            </div>
          </div>
        </nav>

        <div className="mt-auto">
          {!isAuthenticated && (
            <Link to="/auth" onClick={handleLinkClick}>
              <Button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 bg-cyan-400 text-slate-950 shadow-[0_10px_30px_-12px_rgba(34,211,238,0.55)] hover:bg-cyan-300 h-11 px-4 text-sm w-full"
                variant="default"
              >
                Iniciar sesión
              </Button>
            </Link>
          )}

          {isAuthenticated && (
            <div className='flex flex-col gap-3 rounded-3xl border border-white/10 bg-linear-to-br from-cyan-400/10 via-white/5 to-fuchsia-400/10 p-4 shadow-[0_16px_60px_-28px_rgba(15,23,42,0.85)]'>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-cyan-300/40 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.35),rgba(15,23,42,0.25))]">
                  {resolvedAvatar ? (
                    <AvatarImage src={resolvedAvatar} alt="User avatar" />
                  ) : (
                    <AvatarFallback className="bg-cyan-400/20 text-cyan-100">
                      {resolvedName ? resolvedName[0].toUpperCase() : 'U'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{resolvedName}</div>
                  <div className="text-xs text-slate-400">{profileLoading ? 'Cargando perfil...' : resolvedRank}</div>
                </div>
              </div>
              <button
                onClick={() => { handleSignOut(); setMobileOpen(false) }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-transparent px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/5"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
