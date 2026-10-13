import { TrackEvent } from './events.js'

const AID_KEY = 'gtkr_aid'
const SID_KEY = 'gtkr_sid'
const EVENT_KEY = 'gtkr_events'
const MAX_STORED = 200
const SENSITIVE = /phone|mobile|otp|password|token|secret|identity|code/i

const queue = []
let currentRoute = { name: '', path: '' }

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function readStorage(storage, key) {
  try {
    return storage.getItem(key) || ''
  } catch {
    return ''
  }
}

function writeStorage(storage, key, value) {
  try {
    storage.setItem(key, value)
  } catch {
    // 隐私模式或配额满时只保留内存中的事件
  }
}

function anonymousId() {
  const saved = readStorage(localStorage, AID_KEY)
  if (saved) return saved
  const next = createId()
  writeStorage(localStorage, AID_KEY, next)
  return next
}

function sessionId() {
  const saved = readStorage(sessionStorage, SID_KEY)
  if (saved) return saved
  const next = createId()
  writeStorage(sessionStorage, SID_KEY, next)
  return next
}

function clip(value) {
  if (typeof value === 'string') return value.slice(0, 120)
  if (typeof value === 'number' || typeof value === 'boolean') return value
  return undefined
}

function sanitize(props) {
  const next = {}
  Object.entries(props || {}).forEach(([key, value]) => {
    if (SENSITIVE.test(key)) return
    const safe = clip(value)
    if (safe !== undefined) next[key] = safe
  })
  return next
}

function remember(events) {
  const saved = readStorage(localStorage, EVENT_KEY)
  let history = []
  try {
    history = saved ? JSON.parse(saved) : []
  } catch {
    history = []
  }
  if (!Array.isArray(history)) history = []
  const next = history.concat(events).slice(-MAX_STORED)
  writeStorage(localStorage, EVENT_KEY, JSON.stringify(next))
}

export function track(name, props) {
  const event = {
    ...sanitize(props),
    name,
    ts: Date.now(),
    aid: anonymousId(),
    sid: sessionId(),
    route: currentRoute.name,
    path: currentRoute.path,
  }
  queue.push(event)
  remember([event])
  if (import.meta.env.DEV) console.info('[track]', event.name, event)
  return event
}

export function flush() {
  if (!queue.length) return
  const batch = queue.splice(0, queue.length)
  const endpoint = import.meta.env.VITE_TRACK_ENDPOINT
  if (!endpoint || !navigator.sendBeacon) return
  navigator.sendBeacon(endpoint, new Blob([JSON.stringify({ events: batch })], { type: 'application/json' }))
}

export function getTrackedEvents() {
  const saved = readStorage(localStorage, EVENT_KEY)
  try {
    const history = saved ? JSON.parse(saved) : []
    return Array.isArray(history) ? history : []
  } catch {
    return []
  }
}

export function installTrack(router) {
  anonymousId()
  sessionId()
  router.afterEach((to, from) => {
    currentRoute = { name: String(to.name || ''), path: to.path }
    if (to.fullPath === from.fullPath) return
    track(TrackEvent.PAGE_VIEW, {
      page: currentRoute.name,
      from: String(from.name || from.path || ''),
    })
  })
  window.addEventListener('pagehide', flush)
  window.setInterval(flush, 5000)
}

export { TrackEvent }
