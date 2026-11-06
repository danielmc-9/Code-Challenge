import { useEffect, useState } from 'react'
import { getJson } from '../lib/api.js'

export default function useApi(path) {
  const [state, setState] = useState({
    path: null,
    data: null,
    error: null,
    loading: true,
  })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    setState({ path, data: null, error: null, loading: true })
    getJson(path, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setState({ path, data, error: null, loading: false })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ path, data: null, error: error.message, loading: false })
      })
    return () => controller.abort()
  }, [path, attempt])
  return {
    ...(state.path === path
      ? state
      : { data: null, error: null, loading: true }),
    retry: () => setAttempt((value) => value + 1),
  }
}
