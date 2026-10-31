import { useCallback, useEffect, useRef, useState, type DependencyList } from 'react'

/** Loads data from an async function and exposes loading/error state plus a `reload`. */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList = []) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const request = useRef(0)

  const run = useCallback(fn, deps)

  const reload = useCallback(async () => {
    const id = ++request.current
    setLoading(true)
    try {
      const result = await run()
      if (id === request.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (id === request.current) setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      if (id === request.current) setLoading(false)
    }
  }, [run])

  useEffect(() => {
    reload()
  }, [reload])

  return { data, error, loading, reload, setData }
}
