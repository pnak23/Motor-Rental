const STORAGE_KEY = 'admin-theme'

export function useAdminTheme() {
  const theme = useState<'light' | 'dark'>('admin-theme', () => 'light')

  function apply(value: 'light' | 'dark') {
    theme.value = value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, value)
    }
  }

  function init() {
    if (!import.meta.client) return
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
      theme.value = stored
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      theme.value = 'dark'
    }
  }

  function toggle() {
    apply(theme.value === 'dark' ? 'light' : 'dark')
  }

  return { theme, init, toggle, setTheme: apply }
}
