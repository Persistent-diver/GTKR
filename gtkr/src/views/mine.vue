<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { account, recharge as addBalance } from '../data/account.js'
import { logout } from '../data/auth.js'
import { TrackEvent, track } from '../track'
import alipayLogo from '../assets/pay/alipay-logo.png'
import huabeiLogo from '../assets/pay/huabei-logo.png'
import huabeiInstallment from '../assets/pay/huabei-installment.png'
import recommendBadge from '../assets/pay/recommend-badge.png'
import '../assets/mine.css'

const NICK_KEY = 'gtkr_nickname'
const INVITE_KEY = 'gtkr_invite'
const WECOM_URL = 'https://work.weixin.qq.com/ca/cawcde6743125ce5f5'
const HOTLINE = '021-62880668'
const nickPool = ['出海先锋', '蓝海猎手', '雷达行者', '关键词官', '跨境探路', '远洋选品']

const router = useRouter()
const packs = [
  { amount: 50, gift: 0 },
  { amount: 100, gift: 10 },
  { amount: 200, gift: 30 },
  { amount: 500, gift: 100 },
]
const payMethods = [
  {
    id: 'alipay',
    name: '支付宝',
    slogan: '10亿用户都在用，真安全，更放心',
    logo: alipayLogo,
    recommend: true,
  },
  {
    id: 'huabei',
    name: '花呗',
    slogan: '先付后还，更便捷',
    logo: huabeiLogo,
  },
  {
    id: 'installment',
    name: '花呗分期',
    slogan: '分期还，更轻松',
    logo: huabeiInstallment,
    wide: true,
  },
]
const selectedAmount = ref(100)
const rechargeOpen = ref(false)
const payStep = ref('amount')
const payMethod = ref('alipay')
const paying = ref(false)
const paidGain = ref(0)
const recordsOpen = ref(false)
const nickOpen = ref(false)
const nickname = ref('')
const inviteId = ref('')
const nickDraft = ref('')
const nickError = ref('')
const copyTip = ref('')
const suggestOpen = ref(true)
const suggestHint = ref(false)
const suggests = ref([
  { id: 'night', name: '自习夜灯', hint: '你近期赞过' },
  { id: 'glow', name: 'Glowmaker', hint: '欧美热搜词' },
  { id: 'tidy', name: '收纳美学', hint: '搜索 10万+' },
  { id: 'lamp', name: '磁吸挂灯', hint: '转化率 8.4%' },
])

let copyTimer = 0
let payTimer = 0

function randomSuffix() {
  return String(Math.floor(1000 + Math.random() * 9000))
}

function randomNickname(id) {
  const base = nickPool[Math.floor(Math.random() * nickPool.length)]
  return `${base}_${id || randomSuffix()}`
}

function loadProfile() {
  let id = localStorage.getItem(INVITE_KEY)
  if (!id) {
    id = randomSuffix()
    localStorage.setItem(INVITE_KEY, id)
  }
  let name = localStorage.getItem(NICK_KEY)
  if (!name) {
    name = randomNickname(id)
    localStorage.setItem(NICK_KEY, name)
  }
  inviteId.value = id
  nickname.value = name
}

loadProfile()

const avatarText = computed(() => nickname.value.slice(0, 1) || '用')
const visibleSuggests = computed(() => suggests.value.slice(0, 3))
const inviteLink = computed(() => `${window.location.origin}/login?invite=${inviteId.value}`)
const selectedPack = computed(() => packs.find((item) => item.amount === selectedAmount.value) || packs[1])
const currentMethod = computed(() => payMethods.find((item) => item.id === payMethod.value) || payMethods[0])
const payLabel = computed(() => `${currentMethod.value.name}支付¥${selectedPack.value.amount.toFixed(2)}`)

function openRecharge() {
  track(TrackEvent.RECHARGE_ENTRY, { balance: account.balance })
  copyTip.value = ''
  payStep.value = 'amount'
  payMethod.value = 'alipay'
  paying.value = false
  rechargeOpen.value = true
}

function closeRecharge() {
  if (paying.value) return
  rechargeOpen.value = false
}

function openCashier() {
  payMethod.value = 'alipay'
  paying.value = false
  payStep.value = 'cashier'
}

function backToAmount() {
  if (paying.value) return
  payStep.value = 'amount'
}

function confirmPay() {
  if (paying.value || payStep.value !== 'cashier') return
  paying.value = true
  const pack = selectedPack.value
  const method = currentMethod.value
  window.clearTimeout(payTimer)
  payTimer = window.setTimeout(() => {
    const gained = addBalance(pack.amount, pack.gift, method.name)
    track(TrackEvent.RECHARGE_SUCCESS, {
      amount: pack.amount,
      gift: pack.gift,
      gained,
      channel: method.name,
    })
    paidGain.value = gained
    paying.value = false
    payStep.value = 'success'
  }, 700)
}

function openNick() {
  nickDraft.value = nickname.value
  nickError.value = ''
  nickOpen.value = true
}

function rollNickname() {
  nickDraft.value = randomNickname(inviteId.value)
  nickError.value = ''
}

function saveNickname() {
  const next = nickDraft.value.trim()
  if (next.length < 2 || next.length > 12) {
    nickError.value = '昵称需要 2 到 12 个字'
    return
  }
  nickname.value = next
  localStorage.setItem(NICK_KEY, next)
  nickOpen.value = false
}

async function copyInvite() {
  const link = inviteLink.value
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
  copyTip.value = '推广链接已复制'
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copyTip.value = ''
  }, 2000)
}

function goConfigure(item) {
  router.push({ name: 'keywords', query: { keyword: item.name } })
}

function consult() {
  track(TrackEvent.CONTACT_CLICK)
  window.open(WECOM_URL, '_blank', 'noopener')
}

function onLogout() {
  track(TrackEvent.LOGOUT)
  logout()
  router.push({ name: 'login' })
}

onUnmounted(() => {
  window.clearTimeout(copyTimer)
  window.clearTimeout(payTimer)
})
</script>

<template>
  <main class="page mine">
    <section class="balance-card">
      <div class="profile-row">
        <span class="avatar">{{ avatarText }}</span>
        <div class="profile-main">
          <div class="nick-row">
            <strong>{{ nickname }}</strong>
            <button type="button" class="nick-edit" aria-label="修改昵称" @click="openNick">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor">
                <path d="M15.2 5.2l3.6 3.6M16.7 3.7a2.5 2.5 0 113.6 3.6L6.5 21H3v-3.6L16.7 3.7z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </button>
          </div>
          <div class="profile-meta">
            <span>ID: {{ inviteId }}</span>
          </div>
        </div>
        <button type="button" class="recharge-btn" @click="openRecharge">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor">
            <path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
          </svg>
          充值
        </button>
      </div>
      <div class="balance-foot">
        <p>账户余额 <b>{{ account.balance.toFixed(2) }}</b> <span>点</span></p>
        <button type="button" class="history-btn" @click="recordsOpen = true">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path fill="currentColor" d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
          </svg>
          明细记录
        </button>
      </div>
    </section>

    <section v-if="suggestOpen" class="suggest-card">
      <div class="suggest-head">
        <div class="suggest-title">
          <h3>你可能感兴趣的关键词</h3>
          <button type="button" class="suggest-info" aria-label="根据你的查询历史推荐" @click="suggestHint = !suggestHint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="9" stroke-width="2" />
              <path d="M12 16v-4m0-4h.01" stroke-linecap="round" stroke-width="2" />
            </svg>
          </button>
        </div>
        <button type="button" class="suggest-close" aria-label="关闭推荐" @click="suggestOpen = false">×</button>
      </div>
      <p v-if="suggestHint" class="suggest-note">根据你的查询历史推荐</p>
      <ul class="suggest-list">
        <li v-for="item in visibleSuggests" :key="item.id">
          <div>
            <strong>{{ item.name }}</strong>
            <em>{{ item.hint }}</em>
          </div>
          <button type="button" @click="goConfigure(item)">
            <span class="icon">bolt</span>去配置
          </button>
        </li>
      </ul>
    </section>

    <section class="mine-card">
      <div class="contact">
        <span class="icon">chat</span>
        <div>
          <strong>企业微信在线咨询</strong>
          <p>工作日 09:00–21:00</p>
        </div>
        <button type="button" aria-label="添加好友" @click="consult">
          <span class="icon">person_add</span>
        </button>
      </div>
      <div class="contact">
        <span class="icon">call</span>
        <div>
          <strong>服务热线</strong>
          <p>座机 {{ HOTLINE }}</p>
        </div>
        <a class="dial" :href="`tel:${HOTLINE.replace(/-/g, '')}`" aria-label="拨打">
          <span class="icon">call</span>
        </a>
      </div>
    </section>

    <section class="mine-card lang-card">
      <div class="contact">
        <span class="icon">language</span>
        <div>
          <strong>系统语言</strong>
          <p>界面显示与出海报告输出语言</p>
        </div>
        <span class="lang-lock">简体中文</span>
      </div>
    </section>

    <button type="button" class="logout-btn" @click="onLogout">退出登录</button>

    <div v-if="rechargeOpen" class="mine-modal" :class="{ 'is-cashier': payStep !== 'amount' }" @click.self="closeRecharge">
      <div
        class="mine-dialog"
        :class="{ 'is-cashier': payStep !== 'amount' }"
        role="dialog"
        aria-modal="true"
        :aria-label="payStep === 'amount' ? '充值' : '支付中心'"
      >
        <template v-if="payStep === 'amount'">
          <div class="dialog-head">
            <strong>充值</strong>
            <button type="button" class="dialog-close" aria-label="关闭" @click="closeRecharge">×</button>
          </div>
          <div class="pack-grid">
            <button
              v-for="pack in packs"
              :key="pack.amount"
              type="button"
              class="pack"
              :class="{ on: selectedAmount === pack.amount }"
              @click="selectedAmount = pack.amount"
            >
              <em v-if="pack.gift" class="pack-gift">送 {{ pack.gift }} 点</em>
              <strong>¥{{ pack.amount }}</strong>
              <span>到账 {{ pack.amount + pack.gift }} 点数</span>
            </button>
          </div>
          <button type="button" class="pay-btn" @click="openCashier">
            去支付 ¥{{ selectedPack.amount }}
          </button>

          <div class="promo">
            <div class="promo-head">
              <strong>获取推广链接</strong>
            </div>
            <p>推广新用户注册并充值，返余额 20</p>
            <div class="promo-link">
              <span>{{ inviteLink }}</span>
              <button type="button" @click="copyInvite">{{ copyTip ? '已复制' : '复制链接' }}</button>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="cashier-head">
            <button v-if="payStep === 'cashier'" type="button" class="cashier-back" aria-label="返回" @click="backToAmount">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor">
                <path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
              </svg>
            </button>
            <span v-else class="cashier-back"></span>
            <strong>支付中心</strong>
          </div>

          <div v-if="payStep === 'cashier'" class="cashier-body">
            <div class="cashier-amount">
              <p class="cashier-wait">网上支付订单等待支付</p>
              <p class="cashier-pay-label">实付金额</p>
              <p class="cashier-sum"><em>¥</em>{{ selectedPack.amount.toFixed(2) }}</p>
              <p class="cashier-arrive">支付成功后到账 {{ selectedPack.amount + selectedPack.gift }} 点</p>
            </div>
            <p class="cashier-choose">选择支付方式</p>
            <div class="cashier-list" role="radiogroup" aria-label="选择支付方式">
              <button
                v-for="item in payMethods"
                :key="item.id"
                type="button"
                class="cashier-method"
                role="radio"
                :aria-checked="payMethod === item.id"
                @click="payMethod = item.id"
              >
                <img class="cashier-logo" :class="{ wide: item.wide }" :src="item.logo" :alt="item.name" />
                <span class="cashier-meta">
                  <span class="cashier-name">
                    {{ item.name }}
                    <img v-if="item.recommend" class="cashier-badge" :src="recommendBadge" alt="推荐" />
                  </span>
                  <span class="cashier-slogan">{{ item.slogan }}</span>
                </span>
                <span class="cashier-radio" :class="{ on: payMethod === item.id }" aria-hidden="true">
                  <svg v-if="payMethod === item.id" viewBox="0 0 24 24" width="14" height="14">
                    <path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 7.6-7.6 1.4 1.4z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div v-else class="cashier-body cashier-success">
            <span class="cashier-ok" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="28" height="28">
                <path fill="currentColor" d="M9.2 16.2 4.8 11.8l1.4-1.4 3 3 7.6-7.6 1.4 1.4z" />
              </svg>
            </span>
            <strong>支付成功</strong>
            <p>{{ currentMethod.name }} ¥{{ selectedPack.amount.toFixed(2) }}</p>
            <p>余额已增加 {{ paidGain.toFixed(2) }} 点</p>
          </div>

          <div class="cashier-foot">
            <button v-if="payStep === 'cashier'" type="button" class="cashier-submit" :disabled="paying" @click="confirmPay">
              {{ paying ? '支付中...' : payLabel }}
            </button>
            <button v-else type="button" class="cashier-submit" @click="closeRecharge">完成</button>
          </div>
        </template>
      </div>
    </div>

    <div v-if="recordsOpen" class="mine-modal" @click.self="recordsOpen = false">
      <div class="mine-dialog" role="dialog" aria-modal="true" aria-label="消费充值记录">
        <div class="dialog-head">
          <strong>消费/充值记录</strong>
          <button type="button" class="dialog-close" aria-label="关闭" @click="recordsOpen = false">×</button>
        </div>
        <ul v-if="account.records.length" class="records">
          <li v-for="item in account.records" :key="item.id">
            <div>
              <strong>{{ item.title }}</strong>
              <p>{{ item.detail }}</p>
            </div>
            <div class="record-side">
              <b :class="item.amount > 0 ? 'in' : 'out'">
                {{ item.amount > 0 ? '+' : '' }}{{ item.amount.toFixed(2) }}
              </b>
              <span>{{ item.time }}</span>
            </div>
          </li>
        </ul>
        <p v-else class="empty-records">暂无记录</p>
      </div>
    </div>

    <div v-if="nickOpen" class="mine-modal" @click.self="nickOpen = false">
      <div class="mine-dialog" role="dialog" aria-modal="true" aria-label="修改昵称">
        <div class="dialog-head">
          <strong>修改昵称</strong>
          <button type="button" class="dialog-close" aria-label="关闭" @click="nickOpen = false">×</button>
        </div>
        <label class="nick-label" for="nick-input">账号昵称</label>
        <div class="nick-edit-row">
          <input id="nick-input" v-model="nickDraft" type="text" maxlength="12" placeholder="2 到 12 个字" />
          <button type="button" class="roll-btn" @click="rollNickname">随机</button>
        </div>
        <p v-if="nickError" class="nick-error">{{ nickError }}</p>
        <button type="button" class="pay-btn" @click="saveNickname">保存昵称</button>
      </div>
    </div>
  </main>
</template>
