<script setup>
import { onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { account, spend, taskCost } from '../data/account.js'
import { addTask, regions } from '../data/task.js'
import { targetLangs, translateVariants } from '../data/translate.js'
import { TrackEvent, track } from '../track'
import '../assets/task/task.css'

defineProps({
  embedded: { type: Boolean, default: false },
})

const router = useRouter()
const selectedRegion = ref('us')
const keyword = ref('')
const targetLang = ref('en')
const langOptions = targetLangs
const chosen = ref(null)
const variants = ref([])
const translating = ref(false)
const toast = ref(null)
const toastPinned = ref(false)
const running = ref(false)

let toastTimer = 0
let alive = true

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function scheduleHideToast() {
  window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    if (!toastPinned.value) toast.value = null
  }, 4000)
}

function showToast(title, message, action) {
  toast.value = { title, message, action }
  scheduleHideToast()
}

function openRecharge() {
  track(TrackEvent.RECHARGE_ENTRY, { from: 'keyword_task' })
  hideToast()
  router.push({ name: 'me' })
}

function holdToast() {
  toastPinned.value = true
  window.clearTimeout(toastTimer)
}

function releaseToast() {
  toastPinned.value = false
  if (toast.value) scheduleHideToast()
}

function hideToast() {
  toastPinned.value = false
  toast.value = null
  window.clearTimeout(toastTimer)
}

function resetTranslations() {
  chosen.value = null
  variants.value = []
}

watch(targetLang, () => {
  if (variants.value.length && keyword.value.trim()) runTranslate()
})

async function runTranslate() {
  const text = keyword.value.trim()
  if (!text) {
    showToast('请输入关键词', '翻译前请先填写要分析的关键词或标签')
    return
  }
  translating.value = true
  await delay(400)
  if (!alive) return
  variants.value = translateVariants(text, targetLang.value)
  chosen.value = null
  translating.value = false
  track(TrackEvent.KEYWORD_TRANSLATE, { keyword: text, lang: targetLang.value })
}

function applyVariant(item) {
  keyword.value = item.text
  chosen.value = item
  variants.value = []
}

async function submitTask() {
  if (running.value) return
  const text = keyword.value.trim() || '当前关键词'
  if (account.balance < taskCost) {
    track(TrackEvent.KEYWORD_TASK_BLOCKED, { keyword: text, balance: account.balance })
    showToast('请先充值', `当前余额 ${account.balance.toFixed(2)}，执行任务需要 ${taskCost.toFixed(2)}`, {
      label: '去充值',
      run: openRecharge,
    })
    return
  }
  running.value = true
  const region = regions.find((item) => item.id === selectedRegion.value)
  showToast('正在创建任务', `正在为「${text}」创建分析任务`)
  await delay(700)
  if (!alive) return
  const picked = chosen.value
  spend('关键词深度提炼', `${text} · ${region?.name || ''}`)
  addTask({
    mode: 'keyword',
    title: text,
    detail: picked ? '已按所选译文发起分析任务' : '已发起关键词分析任务',
    translation: picked?.text || '',
    lang: picked?.lang || '',
    region: region?.name || '',
    action: '查看分析详情',
    icon: 'insights',
  })
  track(TrackEvent.KEYWORD_TASK_SUBMIT, {
    region: selectedRegion.value,
    keyword: text,
    cost: taskCost,
  })
  showToast('任务创建成功', `「${text}」已创建，正在进入报告`)
  await delay(700)
  if (!alive) return
  running.value = false
  router.push({ name: 'board', query: { from: 'keywords' } })
}

onUnmounted(() => {
  alive = false
  window.clearTimeout(toastTimer)
})
</script>

<template>
  <div class="keyword-stage" :class="{ 'is-embedded': embedded }">
    <main class="task" :class="embedded ? 'is-embedded' : 'page'">
      <div class="task-head">
        <div>
          <h1 v-if="!embedded">关键词模式</h1>
          <p class="task-lead">输入目标关键词或社媒话题标签，选择投放地区后直接发起分析任务</p>
        </div>
      </div>

      <section class="task-card">
        <div class="mode-grid">
          <div>
            <div class="field">
              <div class="field-label">
                <span>输入目标核心关键词 / 热门标签</span>
                <span class="field-hint">支持输入主词、长尾词或社媒 #话题标签</span>
              </div>
              <div class="input-wrap keyword-field">
                <span class="icon">tag</span>
                <input
                  v-model="keyword"
                  class="with-translate"
                  type="text"
                  placeholder="例如：#glowmaker, cordless desk lamp, aesthetic decor..."
                  @input="resetTranslations"
                >
                <div class="translate-tools">
                  <button type="button" class="translate-btn" :disabled="translating" @click="runTranslate">
                    {{ translating ? '翻译中' : '翻译' }}
                  </button>
                  <select v-model="targetLang" class="translate-lang" aria-label="选择翻译语种">
                    <option v-for="item in langOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                  </select>
                </div>
              </div>
              <div v-if="variants.length" class="translate-result">
                <span class="icon">translate</span>
                <div class="translate-options">
                  <button
                    v-for="item in variants"
                    :key="item.text"
                    type="button"
                    class="translate-option"
                    title="点击替换输入内容"
                    @click="applyVariant(item)"
                  >
                    {{ item.text }}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="side-col">
            <div class="field">
              <div class="side-label">
                <span>选择国家 / 地区</span>
              </div>
              <div class="input-wrap">
                <span class="icon">public</span>
                <select v-model="selectedRegion">
                  <option v-for="region in regions" :key="region.id" :value="region.id">{{ region.name }}</option>
                </select>
                <span class="icon chevron">expand_more</span>
              </div>
            </div>
            <div class="run-row">
              <button type="button" class="run-btn" :disabled="running" @click="submitTask">
                <span class="icon">bolt</span>{{ running ? '正在创建任务' : '直接执行任务' }}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div
      class="toast"
      :class="{ show: toast }"
      role="status"
      @mouseenter="holdToast"
      @mouseleave="releaseToast"
    >
      <span class="icon">task_alt</span>
      <div>
        <strong>{{ toast?.title }}</strong>
        <p>{{ toast?.message }}</p>
      </div>
      <button v-if="toast?.action" type="button" class="toast-go" @click="toast.action.run">
        {{ toast.action.label }}
      </button>
      <button type="button" class="toast-close" aria-label="关闭" @click="hideToast">
        <span class="icon">close</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyword-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: safe center;
}

.keyword-stage.is-embedded {
  flex: none;
  display: block;
}

.keyword-stage.is-embedded .task {
  width: 100%;
  padding: 0 0 8px;
}

.keyword-stage .page {
  width: 100%;
  padding-top: 24px;
  padding-bottom: 24px;
}
</style>
