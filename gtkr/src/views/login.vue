<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '../data/auth.js'
import { TrackEvent, track } from '../track'

const router = useRouter()
const route = useRoute()
const identity = ref('')
const otp = ref('')
const remember = ref(true)
const submitting = ref(false)
const submitPhase = ref('idle')
const otpSeconds = ref(0)
const otpSent = ref(false)

let otpTimer = 0
let alive = true

const pains = [
  '小店出单少，先别怪产品——查查标签关键词选对没有？',
  '竞品在用什么标签关键词，你知道吗？翻主页翻到吐也看不全',
  '想找蓝海标签关键词，不知道哪里竞争小？等找到，蓝海早变红海了',
  '查到的数据都是上周的，热点早凉了？',
  '内容做了，播放还是几百——问题可能就出在标签关键词上',
  '想找达人，不知道搜什么标签关键词才能挖到对的人？',
]

const industries = [
  '3C电子',
  'B2B工厂',
  '服装鞋帽',
  '美妆个护',
  '家居生活',
  '宠物用品',
  '食品饮料',
  '珠宝配饰',
  '运动户外',
  '母婴用品',
  '汽车配件',
  '游戏应用',
]

const industryRows = [
  { names: industries.filter((_, index) => index % 2 === 0), duration: '34s', reverse: false },
  { names: industries.filter((_, index) => index % 2 === 1), duration: '19s', reverse: true },
]

const painCursor = ref(0)
const visiblePainCount = 2
const visiblePains = computed(() =>
  Array.from({ length: visiblePainCount }, (_, offset) => {
    const index = (painCursor.value + offset) % pains.length
    return { index, text: pains[index] }
  }),
)
const painMeasureEl = ref(null)
const painSlot = ref(0)
const painListStyle = computed(() => ({
  '--pain-count': visiblePainCount,
  ...(painSlot.value ? { '--pain-slot': `${painSlot.value}px` } : {}),
}))
let painRotateTimer = 0
let painResizeObserver

const otpButtonText = computed(() => {
  if (otpSeconds.value > 0) return `${otpSeconds.value}s 重发`
  return otpSent.value ? '重新获取' : '获取验证码'
})

function fitPainSlots() {
  const root = painMeasureEl.value
  if (!root) return
  const max = Math.max(...[...root.children].map((el) => el.offsetHeight))
  if (max > 0) painSlot.value = max
}

onMounted(() => {
  fitPainSlots()
  if (painMeasureEl.value && 'ResizeObserver' in window) {
    painResizeObserver = new ResizeObserver(fitPainSlots)
    painResizeObserver.observe(painMeasureEl.value)
  }
  document.fonts?.ready.then(() => {
    if (alive) fitPainSlots()
  })
  painRotateTimer = window.setInterval(() => {
    painCursor.value = (painCursor.value + 1) % pains.length
  }, 2800)
})

onUnmounted(() => {
  alive = false
  window.clearInterval(otpTimer)
  window.clearInterval(painRotateTimer)
  painResizeObserver?.disconnect()
})

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function sendOtp() {
  if (otpSeconds.value > 0) return
  if (!identity.value.trim()) {
    track(TrackEvent.OTP_SEND, { result: 'empty' })
    window.alert('请先输入认证手机号码')
    return
  }
  track(TrackEvent.OTP_SEND, { result: 'sent' })
  otpSent.value = true
  otpSeconds.value = 60
  window.clearInterval(otpTimer)
  otpTimer = window.setInterval(() => {
    otpSeconds.value -= 1
    if (otpSeconds.value <= 0) {
      otpSeconds.value = 0
      window.clearInterval(otpTimer)
    }
  }, 1000)
}

async function submit() {
  if (submitting.value) return
  submitting.value = true
  submitPhase.value = 'loading'
  track(TrackEvent.LOGIN_SUBMIT)
  await delay(1000)
  if (!alive) return
  submitPhase.value = 'success'
  login(identity.value.trim())
  track(TrackEvent.LOGIN_SUCCESS)
  await delay(700)
  if (!alive) return
  const redirect = route.query.redirect
  await router.push(typeof redirect === 'string' ? redirect : { name: 'keywords' })
}
</script>

<template>
  <main class="auth">
    <div class="auth-wrap">
      <header class="brand">
        <div class="pulse">
          <span class="pulse-dot"></span>
          <span>RADAR ENGINE v4.2 ONLINE</span>
        </div>
        <h1>跨境出海关键词雷达</h1>
        <p class="brand-sub">智能海外社媒内容分析中枢</p>
        <div class="pain">
          <ul ref="painMeasureEl" class="pain-measure" aria-hidden="true">
            <li v-for="item in pains" :key="item">{{ item }}</li>
          </ul>
          <TransitionGroup name="pain-swap" tag="ul" class="pain-list" :style="painListStyle">
            <li v-for="item in visiblePains" :key="item.index">{{ item.text }}</li>
          </TransitionGroup>
        </div>
      </header>

      <section class="card">
        <div class="metrics">
          <div class="stat">
            <div class="stat-icon teal">
              <span class="icon">travel_explore</span>
            </div>
            <div class="stat-text">
              <div class="stat-label">已服务分析关键词数量</div>
              <div class="stat-value">20,000+</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon violet">
              <span class="icon">verified</span>
            </div>
            <div class="stat-text">
              <div class="stat-label">分析视频数量超</div>
              <div class="stat-value">1,800,000+</div>
            </div>
          </div>
        </div>
        <div class="card-head">
          <h2>
            <span class="head-mark"></span>
            <span>欢迎登录系统</span>
          </h2>
        </div>

        <form @submit.prevent="submit">
          <div class="field">
            <label for="identity-input">安全绑定手机号</label>
            <div class="control">
              <span class="icon lead">alternate_email</span>
              <input
                id="identity-input"
                v-model="identity"
                name="identity"
                type="text"
                required
                placeholder="+86 138 0000 0000"
              />
            </div>
          </div>

          <div class="field">
            <label for="otp-input">6位动态安全码</label>
            <div class="otp-row">
              <div class="control">
                <span class="icon lead">pin</span>
                <input
                  id="otp-input"
                  v-model="otp"
                  class="otp"
                  type="text"
                  inputmode="numeric"
                  maxlength="6"
                  required
                  placeholder="••••••"
                />
              </div>
              <button
                class="otp-btn"
                type="button"
                :disabled="otpSeconds > 0"
                @click="sendOtp"
              >
                {{ otpButtonText }}
              </button>
            </div>
          </div>

          <button
            class="submit"
            :class="{ success: submitPhase === 'success' }"
            type="submit"
            :disabled="submitting"
          >
            <template v-if="submitPhase === 'loading'">
              <span class="icon spin">progress_activity</span>
              验证凭证中...
            </template>
            <template v-else-if="submitPhase === 'success'">
              <span class="icon">check_circle</span>
              验证成功，启动中枢
            </template>
            <template v-else>
              <span>立即登录并进入雷达中枢</span>
              <span class="icon">arrow_forward</span>
            </template>
          </button>
        </form>
      </section>

      <div class="pain">
        <h3>全球卖家都在用</h3>
        <div class="industries">
          <div v-for="(row, rowIndex) in industryRows" :key="rowIndex" class="industry-row">
            <div
              class="industry-track"
              :class="{ reverse: row.reverse }"
              :style="{ animationDuration: row.duration }"
            >
              <span v-for="copy in 2" :key="copy" class="industry-set">
                <span v-for="name in row.names" :key="`${copy}-${name}`">{{ name }}</span>
              </span>
            </div>
          </div>
        </div>
        <p>只要你想知道海外用户在看什么，就用得上</p>
      </div>
    </div>
  </main>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px calc(24px + env(safe-area-inset-bottom));
  background: #f1f5f9;
  color: #131b2e;
  font-family: "Hanken Grotesk", "Microsoft YaHei", "PingFang SC", sans-serif;
}

.auth-wrap {
  width: 100%;
  max-width: 480px;
}

.icon {
  font-family: "Material Symbols Outlined";
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
}

.brand {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pulse {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  padding: 4px 12px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 1.6s ease-in-out infinite;
}

h1 {
  font-size: 26px;
  line-height: 34px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.brand-sub {
  margin-top: 4px;
  font-size: 15px;
  line-height: 22px;
  color: #64748b;
}

.pain {
  position: relative;
  width: 100%;
  margin-top: 18px;
  text-align: center;
  min-width: 0;
}

.pain h2,
.pain h3 {
  color: #0f172a;
  font-weight: 800;
  animation: pain-in 0.5s ease both;
}

.pain h2 {
  font-size: 18px;
  line-height: 1.4;
}

.pain-measure {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  visibility: hidden;
  pointer-events: none;
}

.pain-list {
  --pain-gap: 10px;
  position: relative;
  height: calc(var(--pain-slot) * var(--pain-count) + var(--pain-gap) * (var(--pain-count) - 1));
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--pain-gap);
  overflow: hidden;
  text-align: left;
}

.pain li {
  position: relative;
  padding: 12px 14px 12px 28px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
  color: #334155;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.pain-list li {
  height: var(--pain-slot, auto);
  flex: 0 0 var(--pain-slot, auto);
  overflow: hidden;
}

.pain-swap-move,
.pain-swap-enter-active,
.pain-swap-leave-active {
  transition: opacity 0.45s ease, transform 0.45s ease;
}

.pain-swap-enter-from,
.pain-swap-leave-to {
  opacity: 0;
}

.pain-swap-enter-from {
  transform: translateY(12px);
}

.pain-swap-leave-to {
  transform: translateY(-12px);
}

.pain-swap-leave-active {
  position: absolute;
  left: 0;
  right: 0;
}

.pain li::before {
  content: "";
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
}

.pain h3 {
  margin-top: 22px;
  font-size: 18px;
  line-height: 1.4;
  animation-delay: 0.2s;
}

.industries {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 100%;
  margin-top: 14px;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}

.industry-row {
  overflow: hidden;
  max-width: 100%;
}

.industry-track {
  display: flex;
  width: max-content;
  animation: industry-marquee linear infinite;
}

.industry-track.reverse {
  animation-direction: reverse;
}

.industry-set {
  display: flex;
  gap: 8px;
  padding-right: 8px;
}

.industry-set span {
  flex-shrink: 0;
  padding: 6px 12px;
  border-radius: 999px;
  background: #e0f2fe;
  color: #0369a1;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
}

.pain > p {
  margin-top: 14px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.5;
  animation: pain-in 0.5s ease both;
  animation-delay: 0.35s;
}

@keyframes pain-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes industry-marquee {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pain h2,
  .pain h3,
  .pain li,
  .pain > p,
  .industry-track,
  .pain-swap-move,
  .pain-swap-enter-active,
  .pain-swap-leave-active {
    animation: none;
    opacity: 1;
    transform: none;
    transition: none;
  }
}

.metrics {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  padding: 10px 0;
  border: 1px solid #e0f2fe;
  border-radius: 12px;
  background: linear-gradient(90deg, rgba(240, 249, 255, 0.9), rgba(238, 242, 255, 0.9));
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  padding: 0 10px;
  text-align: left;
}

.stat + .stat {
  border-left: 1px solid #e0f2fe;
}

.stat-icon {
  width: 28px;
  height: 28px;
  border: 1px solid #e0f2fe;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .icon {
  font-size: 16px;
}

.stat-icon.teal {
  color: #0284c7;
}

.stat-icon.violet {
  border-color: #e0e7ff;
  color: #6366f1;
}

.stat-text {
  min-width: 0;
}

.stat-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
  color: #64748b;
}

.stat-value {
  font-size: 13px;
  line-height: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.stat-value span {
  font-size: 14px;
  font-weight: 400;
  color: #0d9488;
}

.card {
  padding: 16px 20px 20px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

.card-head h2 {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  color: #0f172a;
}

.head-mark {
  width: 8px;
  height: 14px;
  border-radius: 2px;
  background: #0ea5e9;
  flex-shrink: 0;
}

.node-tag {
  flex-shrink: 0;
  padding: 2px 8px;
  border: 1px solid #e0f2fe;
  border-radius: 6px;
  background: #f0f9ff;
  color: #0284c7;
  font-size: 10px;
  font-weight: 500;
}

.tls {
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
}

.tls .icon {
  margin-right: 4px;
  font-size: 15px;
  color: #0d9488;
}

.field {
  margin-top: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #0f172a;
}

.control {
  position: relative;
  display: flex;
  align-items: center;
}

.lead {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  font-size: 19px;
  pointer-events: none;
}

input[type='text'] {
  width: 100%;
  height: 46px;
  padding: 0 14px 0 40px;
  border: none;
  border-radius: 12px;
  background: #fff;
  box-shadow: inset 0 0 0 1px #e2e8f0;
  color: #0f172a;
  font: inherit;
  font-size: 15px;
  outline: none;
}

input:focus {
  box-shadow: 0 0 0 2px #0ea5e9;
}

input::placeholder {
  color: #94a3b8;
}

.otp {
  letter-spacing: 0.18em;
  font-weight: 500;
}

.otp-row {
  display: flex;
  gap: 8px;
}

.otp-row .control {
  flex: 1;
  min-width: 0;
}

.otp-btn {
  height: 46px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;
  background: #e0f2fe;
  color: #0369a1;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
}

.otp-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
  padding-top: 4px;
}

.check {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 14px;
  cursor: pointer;
}

.check input {
  width: 16px;
  height: 16px;
  accent-color: #0ea5e9;
}

.roam {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 14px;
}

.roam .icon {
  font-size: 16px;
  color: #0d9488;
}

.submit {
  width: 100%;
  height: 48px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 999px;
  background: #0ea5e9;
  color: #fff;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.28);
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.submit .icon {
  font-size: 18px;
}

.submit:disabled {
  cursor: default;
}

.submit.success {
  background: #22c55e;
  box-shadow: none;
}

.spin {
  animation: spin 0.8s linear infinite;
}

.divider {
  height: 1px;
  margin: 16px 0 0;
  background: #e2e8f0;
}


@keyframes pulse {
  50% {
    opacity: 0.45;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  h1 {
    font-size: 22px;
    line-height: 28px;
  }

  .card {
    padding: 20px 16px;
  }

  .options {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
