export interface SocketAccessRequest {
  id: string
  shopId: string
  status: string
  reason: string
  responseNote: string | null
  expiresAt?: string
  usedAt?: string | null
  requestedById?: string | null
  requestedByName?: string | null
  requestedByEmail?: string | null
}

export interface SocketAccessEvent {
  type: 'entered' | 'exited'
  admin: { id: string; name: string; email: string } | null
  at: string
}

// Module-level (not reactive state) so the connection itself is a true singleton per
// browser tab, shared across every component that calls this composable.
let socket: WebSocket | null = null
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null

/** Real-time push for the shop-access approval flow. Auth is the existing `admin_session`
 *  cookie — the browser sends it automatically on the WebSocket upgrade request. */
export function useAccessRequestSocket() {
  const incomingRequest = useState<SocketAccessRequest | null>('access-ws-incoming', () => null)
  const resolvedRequest = useState<{ type: 'approved' | 'denied'; request: SocketAccessRequest } | null>(
    'access-ws-resolved',
    () => null
  )
  const accessEvent = useState<SocketAccessEvent | null>('access-ws-event', () => null)

  function handleMessage(raw: string) {
    let msg: { type: string; request?: SocketAccessRequest; admin?: SocketAccessEvent['admin']; at?: string }
    try {
      msg = JSON.parse(raw)
    } catch {
      return
    }
    if (msg.type === 'request:new' && msg.request) {
      incomingRequest.value = msg.request
    } else if (msg.type === 'request:approved' && msg.request) {
      resolvedRequest.value = { type: 'approved', request: msg.request }
    } else if (msg.type === 'request:denied' && msg.request) {
      resolvedRequest.value = { type: 'denied', request: msg.request }
    } else if (msg.type === 'access:entered') {
      accessEvent.value = { type: 'entered', admin: msg.admin ?? null, at: msg.at || new Date().toISOString() }
    } else if (msg.type === 'access:exited') {
      accessEvent.value = { type: 'exited', admin: msg.admin ?? null, at: msg.at || new Date().toISOString() }
    }
  }

  function scheduleReconnect() {
    if (reconnectTimer) return
    const delay = [1000, 2000, 5000][reconnectAttempts] ?? 5000
    reconnectAttempts++
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null
      connect()
    }, delay)
  }

  function connect() {
    if (import.meta.server) return
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
    socket = new WebSocket(`${protocol}://${location.host}/ws/notifications`)
    socket.addEventListener('open', () => {
      reconnectAttempts = 0
    })
    socket.addEventListener('message', (e) => handleMessage(e.data))
    socket.addEventListener('close', scheduleReconnect)
    socket.addEventListener('error', () => socket?.close())
  }

  return {
    incomingRequest,
    resolvedRequest,
    accessEvent,
    connect,
    clearIncoming: () => {
      incomingRequest.value = null
    },
    clearResolved: () => {
      resolvedRequest.value = null
    },
    clearAccessEvent: () => {
      accessEvent.value = null
    }
  }
}
