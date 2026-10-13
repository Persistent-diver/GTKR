<script setup>
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { account, recharge as addBalance } from '../data/account.js'
import { logout } from '../data/auth.js'
import { TrackEvent, track } from '../track'
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
const selectedAmount = ref(100)
const rechargeOpen = ref(false)
const recordsOpen = ref(false)
const nickOpen = ref(false)
const nickname = ref('')
const inviteId = ref('')
const nickDraft = ref('')
const nickError = ref('')
const rechargeTip = ref('')
const copyTip = ref('')

let tipTimer = 0
let copyTimer = 0

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
const inviteLink = computed(() => `${window.location.origin}/login?invite=${inviteId.value}`)
const selectedPack = computed(() => packs.find((item) => item.amount === selectedAmount.value) || packs[1])

function openRecharge() {
  track(TrackEvent.RECHARGE_ENTRY, { balance: account.balance })
  rechargeTip.value = ''
  copyTip.value = ''
  rechargeOpen.value = true
}

function recharge() {
  const pack = selectedPack.value
  const gained = addBalance(pack.amount, pack.gift)
  track(TrackEvent.RECHARGE_SUCCESS, { amount: pack.amount, gift: pack.gift, gained })
  rechargeTip.value = `充值成功，余额已增加 ${gained}`
  window.clearTimeout(tipTimer)
  tipTimer = window.setTimeout(() => {
    rechargeTip.value = ''
  }, 2800)
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
  window.clearTimeout(tipTimer)
  window.clearTimeout(copyTimer)
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
              <span class="icon">edit</span>
            </button>
          </div>
          <p class="balance-line">余额 <b>{{ account.balance.toFixed(2) }}</b></p>
        </div>
        <button type="button" class="recharge-btn" @click="openRecharge">充值</button>
      </div>
    </section>

    <section class="mine-card record-card">
      <div class="record-head">
        <div class="mine-title"><span class="icon">receipt_long</span>消费/充值记录</div>
        <button type="button" class="view-records" @click="recordsOpen = true">查看记录</button>
      </div>
    </section>

    <section class="mine-card">
      <div class="contact">
        <span class="icon">chat</span>
        <div>
          <strong>企业微信在线咨询</strong>
          <p>工作日 09:00–21:00</p>
        </div>
        <button type="button" @click="consult">添加好友</button>
      </div>
      <div class="contact">
        <span class="icon">call</span>
        <div>
          <strong>服务热线</strong>
          <p>座机 {{ HOTLINE }}</p>
        </div>
        <a class="dial" :href="`tel:${HOTLINE.replace(/-/g, '')}`">拨打</a>
      </div>
    </section>

    <section class="mine-card">
      <button type="button" class="logout-btn" @click="onLogout">退出登录</button>
    </section>

    <div v-if="rechargeOpen" class="mine-modal" @click.self="rechargeOpen = false">
      <div class="mine-dialog" role="dialog" aria-modal="true" aria-label="充值">
        <div class="dialog-head">
          <strong>充值</strong>
          <button type="button" class="dialog-close" aria-label="关闭" @click="rechargeOpen = false">×</button>
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
            <strong>{{ pack.amount }}</strong>
            <span>{{ pack.gift ? `赠 ${pack.gift}` : '无赠送' }}</span>
          </button>
        </div>
        <button type="button" class="pay-btn" @click="recharge">
          立即充值 {{ selectedPack.amount }}
        </button>
        <p v-if="rechargeTip" class="tip">{{ rechargeTip }}</p>

        <div class="promo">
          <div class="promo-head">
            <strong>获取推广链接</strong>
            <span>返余额 20</span>
          </div>
          <p>推广新用户注册并充值，返余额 20</p>
          <div class="promo-link">
            <span>{{ inviteLink }}</span>
            <button type="button" @click="copyInvite">{{ copyTip ? '已复制' : '获取推广链接' }}</button>
          </div>
        </div>
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
