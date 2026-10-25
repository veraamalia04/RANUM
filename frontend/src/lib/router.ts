import { useEffect, useState } from 'react'

// shortcut: tiny hash router (#/profile, #/challenges/12), switch to react-router if routes get nested
export function useHashRoute() {
  const [route, setRoute] = useState(() => location.hash.slice(1) || '/')
  useEffect(() => {
    const onChange = () => setRoute(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}

export const navigate = (path: string) => { location.hash = path }

// "/jelajah?kategori=Seni" -> { path: "/jelajah", query }; pages match on path only
export function parseRoute(route: string) {
  const [path, search = ''] = route.split('?')
  return { path, query: new URLSearchParams(search) }
}
