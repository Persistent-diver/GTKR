const GAP = 3

function update(el) {
  const track = el.__saTrack
  const thumb = el.__saThumb
  if (!track || !thumb) return
  const maxScroll = el.scrollHeight - el.clientHeight
  if (maxScroll <= 1) {
    track.style.display = 'none'
    return
  }
  track.style.display = ''
  const trackH = el.clientHeight - GAP * 2
  track.style.height = `${trackH}px`
  track.style.transform = `translateY(${el.scrollTop}px)`
  const thumbH = Math.max(28, (trackH * el.clientHeight) / el.scrollHeight)
  const maxTop = trackH - thumbH
  thumb.style.height = `${thumbH}px`
  thumb.style.transform = `translateY(${(el.scrollTop / maxScroll) * maxTop}px)`
}

export default {
  mounted(el) {
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    el.classList.add('sa-host')
    const track = document.createElement('div')
    track.className = 'sa-track'
    const thumb = document.createElement('div')
    thumb.className = 'sa-thumb'
    track.appendChild(thumb)
    el.appendChild(track)
    el.__saTrack = track
    el.__saThumb = thumb
    el.__saUpdate = () => update(el)
    el.addEventListener('scroll', el.__saUpdate, { passive: true })
    el.__saResize = new ResizeObserver(el.__saUpdate)
    el.__saResize.observe(el)
    el.__saMut = new MutationObserver(el.__saUpdate)
    el.__saMut.observe(el, { childList: true, subtree: true })
    update(el)
  },
  updated(el) {
    update(el)
  },
  unmounted(el) {
    el.removeEventListener('scroll', el.__saUpdate)
    el.__saResize?.disconnect()
    el.__saMut?.disconnect()
    el.__saTrack?.remove()
    el.classList.remove('sa-host')
    delete el.__saTrack
    delete el.__saThumb
    delete el.__saUpdate
    delete el.__saResize
    delete el.__saMut
  },
}
