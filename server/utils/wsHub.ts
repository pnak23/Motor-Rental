import type { Peer } from 'crossws'

export interface WsAuthContext {
  userId: string
  shopId: string | null
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF'
}

// In-memory registry — fine for this single-instance deployment (no Redis/pub-sub needed).
const shopAdminPeers = new Map<string, Set<Peer>>()
const platformAdminPeers = new Map<string, Set<Peer>>()
const peerContext = new WeakMap<Peer, WsAuthContext>()

export function registerPeer(peer: Peer, ctx: WsAuthContext) {
  peerContext.set(peer, ctx)
  if (ctx.shopId && ctx.role === 'ADMIN') {
    if (!shopAdminPeers.has(ctx.shopId)) shopAdminPeers.set(ctx.shopId, new Set())
    shopAdminPeers.get(ctx.shopId)!.add(peer)
  } else if (!ctx.shopId && ctx.role === 'SUPER_ADMIN') {
    if (!platformAdminPeers.has(ctx.userId)) platformAdminPeers.set(ctx.userId, new Set())
    platformAdminPeers.get(ctx.userId)!.add(peer)
  }
}

export function unregisterPeer(peer: Peer) {
  const ctx = peerContext.get(peer)
  if (!ctx) return
  if (ctx.shopId) shopAdminPeers.get(ctx.shopId)?.delete(peer)
  platformAdminPeers.get(ctx.userId)?.delete(peer)
  peerContext.delete(peer)
}

function send(peer: Peer, payload: unknown) {
  try {
    peer.send(JSON.stringify(payload))
  } catch {
    // dead socket — will be cleaned up on its own close event
  }
}

export function notifyShopAdmins(shopId: string, payload: unknown) {
  for (const peer of shopAdminPeers.get(shopId) ?? []) send(peer, payload)
}

export function notifyPlatformAdmin(userId: string | null, payload: unknown) {
  if (!userId) return
  for (const peer of platformAdminPeers.get(userId) ?? []) send(peer, payload)
}
