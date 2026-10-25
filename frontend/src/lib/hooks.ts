import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

// GETs `path` on mount and whenever it changes; `reload` fetches again
export function useFetch<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')

  const reload = useCallback(
    () => api<T>(path).then(setData, (e: Error) => setError(e.message)),
    [path],
  )
  useEffect(() => { reload() }, [reload])

  return { data, error, reload }
}

export type ActionStatus = 'idle' | 'busy' | 'done'

// Runs an async action (usually a form submit) and tracks its status and error message.
// `done` flips back to `idle` after a moment, so buttons can briefly show "Tersimpan!".
export function useAction() {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const [error, setError] = useState('')

  const run = useCallback(async <T>(action: () => Promise<T>): Promise<T | undefined> => {
    setStatus('busy')
    setError('')
    try {
      const result = await action()
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2000)
      return result
    } catch (e) {
      setError((e as Error).message)
      setStatus('idle')
    }
  }, [])

  return { status, error, setError, run }
}
