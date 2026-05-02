import { useEffect, useState } from 'react'

export function useMarketplaceProfile() {
  const [profile, setProfile] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetch('/api/users/me')
      .then((r) => r.json())
      .then((json) => {
        if (mounted) setProfile(json)
      })
      .catch(() => {})
      .finally(() => mounted && setIsLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  return { profile, isLoading }
}

export default useMarketplaceProfile
