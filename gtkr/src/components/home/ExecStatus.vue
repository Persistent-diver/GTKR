<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SectionHead from './SectionHead.vue'
import { auth } from '../../data/auth.js'
import { logMessages } from '../../data/demo.js'
import { currentTask, execStatus } from '../../data/task.js'
import { TrackEvent, track } from '../../track'
import '../../assets/home/exec.css'

const status = execStatus
const finished = computed(() => status.value === '执行完成')
const taskName = computed(() => currentTask.title)
const keywordText = computed(() => currentTask.title || '未设置关键字')
const keywordRegion = computed(() => currentTask.region || '未选择地区')
const keywordLang = computed(() => currentTask.lang || '')
const keywordTranslation = computed(() => {
  const text = currentTask.translation || ''
  if (!text || text === currentTask.title) return ''
  return text
})
const startedAt = '今天 08:00'

const doingMessages = logMessages.filter((text) => text.startsWith('正在'))
const currentLog = ref(null)
const copied = ref(false)
const reelPlaying = ref(false)
const clock = new Date(2026, 9, 12, 8, 0, 0)
const feedPhoto = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCq9ufAVnjmGM0tMrl9139PWb0NTKqAlY5by-6nJuinxyaVndIwY3v2kqstwIig_l6aNpt9NY6vjtpkFii8NWe6nmK6zAFZa-O2iU4wwgbZgDW04M9WBltZ44AdFZH6WQIwqXY9_U4A2fH-_4DT0VmwdoKgIdNXvOXL1lTiF6T8uviftGsH11SbfwBShn8P2ZkbxKJWfGSLk6sgeyK_tk_YaDPvE-070_BLQW0BgQuam8ptMQnU3dqWRw'
const feedAvatar = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7eZNEL7oL6ccbMBd-JjHnzJOfets62SRiSUKQW_khZFsNYev6Uic70x27qh0ffCH7_R_jUiAqrBzTNhDya1i_yyXTplHoU3SeT2V46tDF8YsoMU83snCAQzHj8RyfSy-Myyzc9ST6Lgys9aeN3D-TqFcOK995exA_-AV2-p5yDHHd-ZRK1oKx15iHAmBzLEg5xbOJqECZlMvhR6ZJxxMfghwOGGU9KR4POqZyXhUJd-g9ef9Rm-4m5w'
const feedDisc = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2VIIYBlgyrzVR8s4nZld1XOE9QJE_7zAxmetQ5N6z6GeKU11LJaJoTiLcE6bproe_ivMuK0yNY-kb9qGQ3eM9P9ADQn_pPb-cQEX9tz6TiJ0DUSL-NJCmh6htO2Y2VC0rA_ZjSFeheMPFiJ5xoajd41Cl-yJmjEGq1xxT8dZzRw5tEDHrmmWozHpQEFXVSMX1ecXTyo_SpoPn1jnfWAGffmh3kpTlM0Efht-sHyxj0CYqCHqyyoTi8g'
let logIndex = 0
let timer = 0
let copyTimer = 0

function pad(value) {
  return value < 10 ? `0${value}` : String(value)
}

function showDoing() {
  const list = doingMessages.length ? doingMessages : logMessages
  clock.setSeconds(clock.getSeconds() + 3 + Math.floor(Math.random() * 7))
  currentLog.value = {
    time: `${pad(clock.getHours())}:${pad(clock.getMinutes())}:${pad(clock.getSeconds())}`,
    text: list[logIndex % list.length],
  }
  logIndex += 1
}

showDoing()

function maskUser(user) {
  const digits = String(user || '').replace(/\+86|\s/g, '')
  if (digits.length >= 7) return `${digits.slice(0, 3)}****${digits.slice(-4)}`
  return user || '用户'
}

async function copyShareLink() {
  if (!finished.value) return
  const sharer = encodeURIComponent(maskUser(auth.user))
  const link = `${window.location.origin}/board?share=glowmaker&sharer=${sharer}`
  track(TrackEvent.REPORT_EXPORT, { task: taskName.value, format: 'link' })
  try {
    await navigator.clipboard.writeText(link)
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = link
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
  copied.value = true
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copied.value = false
  }, 2000)
}

onMounted(() => {
  if (finished.value) return
  timer = window.setInterval(showDoing, 2200)
})

onBeforeUnmount(() => {
  window.clearInterval(timer)
  window.clearTimeout(copyTimer)
})
</script>

<template>
  <section class="section">
    <SectionHead
      num="01"
      title="执行状态"
      :sub="finished ? '任务已完成，可以分享当前报告' : '数字员工在真实地跑，每一步你都能看到'"
    />

    <div class="exec-grid" :class="{ 'is-done': finished }">
      <div class="card exec-box worker-card">
        <div class="worker-layout">
          <div class="worker-main">
            <div class="exec-title"><span class="dot"></span>数字员工</div>
            <div class="worker-avatar">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="#fff">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 21 c0 -4.4 3.6 -7 8 -7 s8 2.6 8 7" fill="#fff"></path>
              </svg>
            </div>
            <div class="worker-name">小张 · 内容分析岗</div>
            <dl class="worker-meta">
              <div>
                <dt>状态</dt>
                <dd>{{ status }}</dd>
              </div>
              <div>
                <dt>关键字</dt>
                <dd class="is-ellipsis">{{ keywordText }}</dd>
              </div>
              <div>
                <dt>地区</dt>
                <dd>{{ keywordRegion }}</dd>
              </div>
              <div v-if="keywordLang">
                <dt>语种</dt>
                <dd>{{ keywordLang }}</dd>
              </div>
              <div v-if="keywordTranslation">
                <dt>译文</dt>
                <dd>{{ keywordTranslation }}</dd>
              </div>
              <div>
                <dt>开始时间</dt>
                <dd>{{ startedAt }}</dd>
              </div>
              <div>
                <dt>今日已分析</dt>
                <dd>{{ finished ? '100 / 100' : '23 / 100' }} 条</dd>
              </div>
              <div>
                <dt>平均每条耗时</dt>
                <dd>约38秒</dd>
              </div>
            </dl>
            <p v-if="!finished && currentLog" class="worker-doing">{{ currentLog.text }}</p>
            <button v-if="finished" type="button" class="export-btn" @click="copyShareLink">
              {{ copied ? '已复制' : '复制分享链接' }}
            </button>
          </div>

          <div v-if="!finished" class="reel" :class="{ 'is-paused': !reelPlaying }">
            <div class="reel-stage" @click="reelPlaying = !reelPlaying">
              <div class="reel-slide">
                <img class="reel-photo" alt="" :src="feedPhoto" />
                <div class="reel-shade top"></div>
                <div class="reel-shade bottom"></div>

                <header class="reel-top">
                  <span class="reel-icon is-live" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M15 10l4.55-2.28A1 1 0 0121 8.62v6.76a1 1 0 01-1.45.9L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                  </span>
                  <div class="reel-tabs">
                    <span>Following</span>
                    <span class="on">For You<i></i></span>
                  </div>
                  <span class="reel-icon is-search" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M21 21l-4.35-4.35M16.65 11a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" />
                    </svg>
                  </span>
                </header>

                <div class="reel-body">
                  <div class="reel-copy">
                    <div class="reel-user">
                      <b>@20Lesley22</b>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                    <p>It is always happy to see you. <b>#BFF #feelsgood #summervibes</b></p>
                    <div class="reel-sound">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 3v10.55A3.99 3.99 0 0010 13a4 4 0 100 8 4 4 0 004-4V7h4V3h-6z" />
                      </svg>
                      <div class="reel-ticker">
                        <div class="reel-ticker-track">
                          <span>Original sound - 20Lesley22 •</span>
                          <span>Original sound - 20Lesley22 •</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <aside class="reel-side" aria-hidden="true">
                    <div class="reel-avatar">
                      <b><img alt="" :src="feedAvatar" /></b>
                      <i>+</i>
                    </div>
                    <div class="reel-act">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <em>991K</em>
                    </div>
                    <div class="reel-act">
                      <svg viewBox="0 0 24 24">
                        <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zm0 14H5.17L4 17.17V4h16v12z" />
                      </svg>
                      <em>3456</em>
                    </div>
                    <div class="reel-act">
                      <svg viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a2.1 2.1 0 000-1.4l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 100-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81A3 3 0 106 15c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 105.84 0 2.92 2.92 0 00-2.92-2.92z" />
                      </svg>
                      <em>1256</em>
                    </div>
                    <div class="reel-disc">
                      <img alt="" :src="feedDisc" />
                    </div>
                  </aside>
                </div>

                <button
                  v-if="!reelPlaying"
                  type="button"
                  class="reel-play"
                  aria-label="播放"
                  @click.stop="reelPlaying = true"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5.5v13l11-6.5-11-6.5z" />
                  </svg>
                </button>

                <footer class="reel-tabbar" aria-hidden="true">
                  <span class="on">
                    <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
                    Home
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" stroke-width="2" />
                      <path d="M16.2 7.8l-2.1 6.3-6.3 2.1 2.1-6.3 6.3-2.1z" fill="currentColor" stroke="none" />
                    </svg>
                    Discover
                  </span>
                  <span class="reel-create"><i class="cyan"></i><i class="pink"></i><b>+</b></span>
                  <span class="reel-inbox">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 01-9 8 9.86 9.86 0 01-4.26-.95L3 20l1.4-3.72A8.96 8.96 0 013 12a9 9 0 1118 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                    Inbox
                  </span>
                  <span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                    </svg>
                    Me
                  </span>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
