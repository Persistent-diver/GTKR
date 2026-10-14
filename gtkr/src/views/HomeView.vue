<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommentBoard from '../components/home/CommentBoard.vue'
import ContentTopics from '../components/home/ContentTopics.vue'
import CreatorBoard from '../components/home/CreatorBoard.vue'
import ExecStatus from '../components/home/ExecStatus.vue'
import TagBoard from '../components/home/TagBoard.vue'
import TrendBoard from '../components/home/TrendBoard.vue'
import { auth } from '../data/auth.js'
import { currentTask, execStatus } from '../data/task.js'
import { TrackEvent, track } from '../track'
import { downloadReportPdf } from '../utils/reportPdf.js'

const route = useRoute()
const router = useRouter()
const shared = computed(() => Boolean(route.query.share))
const fromTasks = computed(() => route.query.from === 'tasks')
const copied = ref(false)
let copyTimer = 0
const sharer = computed(() => {
  const value = route.query.sharer
  return typeof value === 'string' && value ? value : '分享用户'
})
const modeLabel = computed(() => (currentTask.mode === 'product' ? '产品分析' : '关键词分析'))
const finished = computed(() => execStatus.value === '执行完成')

function goLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

function goTasks() {
  router.push({ name: 'tasks' })
}

function maskUser(user) {
  const digits = String(user || '').replace(/\+86|\s/g, '')
  if (digits.length >= 7) return `${digits.slice(0, 3)}****${digits.slice(-4)}`
  return user || '用户'
}

async function shareReport() {
  if (!finished.value) return
  const name = encodeURIComponent(maskUser(auth.user))
  const link = `${window.location.origin}/board?share=1&sharer=${name}`
  track(TrackEvent.REPORT_EXPORT, { task: currentTask.title, format: 'link' })
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
  }, 1600)
}

function downloadReport() {
  const lines = [
    currentTask.title || '分析报告',
    `【方式】${modeLabel.value}`,
    `【地区】${currentTask.region || '未选择地区'}`,
  ]
  if (currentTask.lang) lines.push(`【语种】${currentTask.lang}`)
  if (currentTask.translation && currentTask.translation !== currentTask.title) {
    lines.push(`【译文】${currentTask.translation}`)
  }
  track(TrackEvent.REPORT_EXPORT, { task: currentTask.title, format: 'pdf' })
  const filename = `${(currentTask.title || '分析报告').replace(/[\\/:*?"<>|]/g, ' ')}.pdf`
  downloadReportPdf(lines, filename)
}
</script>

<template>
  <main class="page">
    <header v-if="fromTasks" class="report-bar">
      <button type="button" class="report-icon" aria-label="返回任务列表" @click="goTasks">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
          <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </button>
      <div class="report-copy">
        <strong>{{ currentTask.title }}</strong>
        <span>{{ modeLabel }} · {{ currentTask.region || '未选择地区' }}</span>
      </div>
      <button v-if="finished" type="button" class="report-icon" :aria-label="copied ? '分享链接已复制' : '分享报告'" @click="shareReport">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
          <circle cx="6" cy="12" r="2.2" stroke-width="2" />
          <circle cx="17" cy="7" r="2.2" stroke-width="2" />
          <circle cx="17" cy="17" r="2.2" stroke-width="2" />
          <path d="M8 11.2l7-3.2M8 12.8l7 3.2" stroke-width="2" />
        </svg>
      </button>
      <!--<button type="button" class="report-icon" aria-label="下载报告" @click="downloadReport">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
          <path d="M12 4v10m0 0l-4-4m4 4l4-4M5 19h14" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
        </svg>
      </button>-->
    </header>
    <div v-if="shared" class="share-from">
      <span class="share-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path fill="currentColor" d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-3.3 0-8 1.7-8 5v1h16v-1c0-3.3-4.7-5-8-5z" />
        </svg>
      </span>
      <div class="share-copy">
        <span>分享人</span>
        <b>{{ sharer }}</b>
      </div>
    </div>
    <ExecStatus />
    <TagBoard />
    <CommentBoard />
    <ContentTopics />
    <CreatorBoard />
    <TrendBoard />
    <div v-if="shared && !auth.loggedIn" class="share-login">
      <button type="button" @click="goLogin">注册登录</button>
    </div>
  </main>
</template>
