<script setup>
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { account, spend, taskCost } from '../data/account.js'
import { addTask, extractedKeywords, regions } from '../data/task.js'
import { targetLangs } from '../data/translate.js'
import { TrackEvent, track } from '../track'
import '../assets/task/task.css'

defineProps({
  embedded: { type: Boolean, default: false },
})

const router = useRouter()

const selectedRegion = ref('us')
const productName = ref('')
const productDesc = ref('')
const extractPhase = ref('idle')
const keywords = ref([])
const keywordListEl = ref(null)
const resultEl = ref(null)
const mobileKeywordCount = 5
const dimKeywords = ref(false)
const flashed = ref(false)
const selected = ref([])
const runningName = ref('')
const toast = ref(null)
const toastPinned = ref(false)
const targetLang = ref('en')
const langOptions = targetLangs

let toastTimer = 0
let flashTimer = 0
let extractTimer = 0
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
  track(TrackEvent.RECHARGE_ENTRY, { from: 'product_task' })
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

function fitKeywordList() {
  const list = keywordListEl.value
  if (!list) return
  const cards = list.querySelectorAll('.kw-card')
  const mobile = window.matchMedia('(max-width: 720px)').matches
  if (!mobile || cards.length <= mobileKeywordCount) {
    list.style.maxHeight = 'none'
    return
  }
  const last = cards[mobileKeywordCount - 1]
  const style = getComputedStyle(list)
  const extra = parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth)
  list.style.maxHeight = `${last.offsetTop + last.offsetHeight + extra}px`
}

async function extractKeywords() {
  if (extractPhase.value === 'loading') return
  extractPhase.value = 'loading'
  track(TrackEvent.PRODUCT_EXTRACT, {
    region: selectedRegion.value,
    product: productName.value.trim(),
  })
  dimKeywords.value = true
  flashed.value = false
  await delay(1200)
  if (!alive) return
  extractPhase.value = 'done'
  keywords.value = extractedKeywords.map((item) => ({ ...item }))
  dimKeywords.value = false
  await nextTick()
  fitKeywordList()
  resultEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  flashed.value = true
  track(TrackEvent.PRODUCT_EXTRACT_SUCCESS, { count: keywords.value.length })
  showToast('关键词深度提炼完毕', `已依据「${productName.value.trim() || '当前产品'}」生成 ${keywords.value.length} 个高爆款转化词库，点击执行任务即可调度数字员工！`)
  window.clearTimeout(flashTimer)
  flashTimer = window.setTimeout(() => {
    flashed.value = false
  }, 1000)
  window.clearTimeout(extractTimer)
  extractTimer = window.setTimeout(() => {
    extractPhase.value = 'idle'
  }, 3500)
}

async function runKeyword(name) {
  if (runningName.value) return
  if (account.balance < taskCost) {
    track(TrackEvent.PRODUCT_TASK_BLOCKED, { keyword: name, balance: account.balance })
    showToast('请先充值', `当前余额 ${account.balance.toFixed(2)}，执行任务需要 ${taskCost.toFixed(2)}`, {
      label: '去充值',
      run: openRecharge,
    })
    return
  }
  runningName.value = name
  selected.value = [name]
  const region = regions.find((item) => item.id === selectedRegion.value)
  showToast('正在创建任务', `正在为「${name}」创建分析任务`)
  await delay(700)
  if (!alive) return
  spend('关键词任务', `${name} · ${region?.name || ''}`)
  addTask({
    mode: 'product',
    title: name,
    detail: `基于产品「${productName.value.trim() || '当前产品'}」提炼的高转化分析任务`,
    region: region?.name || '',
    action: '跳转结果报告',
    icon: 'summarize',
  })
  track(TrackEvent.PRODUCT_TASK_RUN, { keyword: name, cost: taskCost })
  showToast('任务创建成功', `「${name}」已创建，正在进入报告`)
  await delay(700)
  if (!alive) return
  runningName.value = ''
  router.push({ name: 'board', query: { from: 'product' } })
}

onMounted(() => {
  window.addEventListener('resize', fitKeywordList)
})

onUnmounted(() => {
  alive = false
  window.clearTimeout(toastTimer)
  window.clearTimeout(flashTimer)
  window.clearTimeout(extractTimer)
  window.removeEventListener('resize', fitKeywordList)
})
</script>

<template>
  <div class="product-stage" :class="{ 'is-embedded': embedded }">
    <main class="task" :class="embedded ? 'is-embedded' : 'page'">
      <div class="task-head">
        <div>
          <h1 v-if="!embedded">产品+描述模式</h1>
          <p class="task-lead">填写产品名称和详细描述，AI 洞察社媒内容并提炼高转化关键词</p>
        </div>
      </div>

      <section class="task-card">
        <div class="mode-grid">
          <div>
            <div class="field">
              <div class="field-label"><span>产品名称 / 品类</span></div>
              <div class="input-wrap">
                <span class="icon">inventory_2</span>
                <input
                  v-model="productName"
                  type="text"
                  placeholder="例如：无线磁吸护眼屏幕挂灯 (Screenbar Halo)"
                >
              </div>
            </div>
            <div class="field">
              <div class="field-label">
                <span>产品详细描述 / 竞品文案</span>
                <span class="field-hint">支持输入核心功能、参数或社媒高赞文案</span>
              </div>
              <textarea v-model="productDesc" rows="4" placeholder="例如: 免打孔无痕吸顶，三档色温无极调光，非对称光路不刺眼不照屏幕..."></textarea>
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
            <div class="field" style="margin-top:0;">
              <div class="side-label">
                <span>选择语种</span>
              </div>
              <div class="input-wrap">
                <span class="icon">translate</span>
                <select v-model="targetLang" aria-label="选择语种">
                  <option v-for="item in langOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
                </select>
                <span class="icon chevron">expand_more</span>
              </div>
            </div>
            <div class="run-row">
              <button
                type="button"
                class="extract-btn"
                :class="{ done: extractPhase === 'done' }"
                :disabled="extractPhase === 'loading'"
                @click="extractKeywords"
              >
                <template v-if="extractPhase === 'loading'">
                  <span class="icon spin">sync</span>AI 深度洞察全球社媒趋势中...
                </template>
                <template v-else-if="extractPhase === 'done'">
                  <span class="icon">check_circle</span>提炼完成 (已生成 10 个高转化词)
                </template>
                <template v-else>
                  <span class="icon">auto_awesome</span>AI提炼关键字 (免费)
                </template>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section v-if="keywords.length" ref="resultEl">
        <div class="task-card">
          <div class="result-head">
            <div class="result-title">
              <span class="icon">format_list_bulleted_add</span>
              提炼生成的 {{ keywords.length }} 个高转化关键词
              <span class="count-pill">{{ keywords.length }} 个精选词库</span>
            </div>
          </div>
          <div ref="keywordListEl" class="kw-grid" :class="{ dim: dimKeywords }">
            <div
              v-for="item in keywords"
              :key="item.name"
              class="kw-card"
              :class="{ on: selected.includes(item.name), flash: flashed }"
            >
              <span class="kw-top">
                <span class="kw-name">{{ item.name }}</span>
                <span class="badge" :class="item.tone">{{ item.badge }}</span>
              </span>
              <button type="button" class="kw-go" :disabled="runningName === item.name" @click="runKeyword(item.name)">
                <template v-if="runningName === item.name">
                  <span class="icon spin">sync</span>正在创建任务
                </template>
                <template v-else>
                  <span class="icon">rocket_launch</span>点击执行任务
                </template>
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
.product-stage {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: safe center;
}

.product-stage.is-embedded {
  flex: none;
  display: block;
}

.product-stage.is-embedded .task {
  width: 100%;
  padding: 0 0 8px;
}

.product-stage .page {
  width: 100%;
  padding-top: 24px;
  padding-bottom: 24px;
}
</style>
