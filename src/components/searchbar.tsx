import { useState, useCallback } from 'react'
import { Search, Loader2, X } from 'lucide-react'

import { useSearch } from '../hooks/useSearch'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [showResults, setShowResults] = useState(false)

  const { data, isLoading, isError } = useSearch({
    q: query,
    page: 1,
    limit: 5,
    enabled: query.trim().length >= 2 && showResults,
  })

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`
      setShowResults(false)
    }
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setShowResults(value.trim().length >= 2)
  }

  const handleClear = () => {
    setQuery('')
    setShowResults(false)
  }

  const handleResultClick = (promptId: string) => {
    window.location.href = `/prompts/${promptId}`
    setShowResults(false)
    setQuery('')
  }

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim().length >= 2 && setShowResults(true)}
          placeholder="Buscar prompts..."
          className="w-full rounded-2xl border border-white/10 bg-[#0d1429] py-2.5 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-cyan-300/30 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-white/10 bg-[#111a34] shadow-[0_16px_60px_-28px_rgba(0,0,0,0.85)]">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 p-4 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando...
            </div>
          )}

          {isError && (
            <div className="p-4 text-sm text-rose-200">
              Error al buscar. Intenta de nuevo.
            </div>
          )}

          {!isLoading && !isError && data?.data && (
            <>
              {data.data.length === 0 ? (
                <div className="p-4 text-sm text-slate-400">
                  No se encontraron resultados para "{query}"
                </div>
              ) : (
                <div className="py-2">
                  {data.data.map((result) => (
                    <button
                      key={result.id_prompt}
                      onClick={() => handleResultClick(result.id_prompt)}
                      className="w-full px-4 py-3 text-left transition hover:bg-white/5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-white">
                            {result.title}
                          </div>
                          {result.description && (
                            <div className="mt-1 truncate text-xs text-slate-400">
                              {result.description}
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                            <span>{result.username}</span>
                            <span>•</span>
                            <span>{result.upvotes} votos</span>
                            <span>•</span>
                            <span>{result.aipoints_price} AIP</span>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-xs text-cyan-200">
                          {result.model}
                        </div>
                      </div>
                      {result.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.tags.slice(0, 3).map((tag: string, i: number) => (
                            <span
                              key={i}
                              className="rounded-lg bg-cyan-300/10 px-2 py-0.5 text-xs text-cyan-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}

                  {data.data.length > 0 && (
                    <button
                      onClick={handleSearch}
                      className="w-full border-t border-white/10 px-4 py-3 text-center text-xs font-medium text-cyan-300 transition hover:bg-white/5"
                    >
                      Ver todos los resultados
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
