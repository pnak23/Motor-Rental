import { parse as parseCookieHeader } from 'cookie-es'
import { AUTH_COOKIE, getAuthUserFromToken } from '../../utils/auth'
import { registerPeer, unregisterPeer, type WsAuthContext } from '../../utils/wsHub'

/** Server -> client push for the shop-access approval flow (see server/utils/wsHub.ts).
 *  Auth reuses the same `admin_session` JWT cookie as every HTTP route — the browser
 *  sends cookies on the WebSocket upgrade request automatically. */
export default defineWebSocketHandler({
  async upgrade(request) {
    const cookies = parseCookieHeader(request.headers.get('cookie') || '')
    const user = await getAuthUserFromToken(cookies[AUTH_COOKIE])
    if (!user) {
      return new Response('Unauthorized', { status: 401 })
    }
    ;(request.context as { auth?: WsAuthContext }).auth = { userId: user.id, shopId: user.shopId, role: user.role }
  },
  open(peer) {
    const auth = (peer.context as { auth?: WsAuthContext }).auth
    if (auth) registerPeer(peer, auth)
  },
  close(peer) {
    unregisterPeer(peer)
  }
})
