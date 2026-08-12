export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let counter = 0

export function useToasts() {
  return useState<Toast[]>('toasts', () => [])
}

export function useToast() {
  const toasts = useToasts()

  function push(message: string, type: Toast['type'] = 'info') {
    const id = ++counter
    toasts.value.push({ id, message, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, 4500)
  }

  return {
    success: (message: string) => push(message, 'success'),
    error: (message: string) => push(message, 'error'),
    info: (message: string) => push(message, 'info')
  }
}
