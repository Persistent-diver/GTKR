<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SectionHead from './SectionHead.vue'
import { creators } from '../../data/demo.js'
import '../../assets/home/creator.css'

const listEl = ref(null)
const active = ref(null)
const copied = ref(false)
const visibleCount = 5
let copyTimer = 0

watch(active, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function openCreator(creator) {
  copied.value = false
  active.value = creator
}

function closeCreator() {
  active.value = null
  copied.value = false
  window.clearTimeout(copyTimer)
}

function onKeydown(event) {
  if (event.key === 'Escape') closeCreator()
}

function accountLevel(followers) {
  const wan = Number.parseFloat(String(followers).replace(/,/g, ''))
  const count = String(followers).includes('万') ? wan * 10000 : wan
  if (count >= 500000) return '头部'
  if (count >= 300000) return '腰部'
  return '尾部'
}

async function copyHome() {
  if (!active.value?.home) return
  const text = active.value.home
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.left = '-9999px'
    document.body.appendChild(area)
    area.select()
    document.execCommand('copy')
    area.remove()
  }
  copied.value = true
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

function fitListHeight() {
  const list = listEl.value
  if (!list) return
  const rows = list.querySelectorAll('.creator-row')
  if (rows.length <= visibleCount) {
    list.style.maxHeight = 'none'
    return
  }
  const lastVisible = rows[visibleCount - 1]
  list.style.maxHeight = `${lastVisible.offsetTop + lastVisible.offsetHeight}px`
}

onMounted(() => {
  fitListHeight()
  window.addEventListener('resize', fitListHeight)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', fitListHeight)
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(copyTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="section">
    <SectionHead num="05" title="博主板块" sub="这个方向里谁在讲，粉丝和互动放在一起看" />
    <div class="card creator-card">
      <div class="creator-head">
        <div>头像</div>
        <div>姓名</div>
        <div>粉丝数</div>
        <div>互动总数</div>
        <div>类别</div>
      </div>
      <div ref="listEl" v-scroll-always class="creator-list">
        <div
          v-for="creator in creators"
          :key="creator.name"
          class="creator-row"
          role="button"
          tabindex="0"
          @click="openCreator(creator)"
          @keydown.enter="openCreator(creator)"
        >
          <div class="creator-avatar" :style="{ background: creator.gradient }" aria-hidden="true">
            {{ creator.name.slice(0, 1).toUpperCase() }}
          </div>
          <div class="creator-name">@{{ creator.name }}</div>
          <div class="creator-fans">
            <span class="creator-label">粉丝数</span>
            {{ creator.followers }}
          </div>
          <div class="creator-act">
            <span class="creator-label">互动总数</span>
            {{ creator.interactions }}
          </div>
          <div class="creator-cat-wrap">
            <span class="creator-cat">{{ creator.category }}</span>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="pop">
        <div v-if="active" class="creator-modal" @click.self="closeCreator">
          <div class="creator-dialog" role="dialog" aria-modal="true" aria-label="博主详细信息">
            <button type="button" class="creator-close" aria-label="关闭" @click="closeCreator">×</button>
            <div class="creator-field">
              <span>名称</span>
              <b>@{{ active.name }}</b>
            </div>
            <div class="creator-field is-block">
              <span>简介</span>
              <p>{{ active.bio }}</p>
            </div>
            <div class="creator-shot-label">首页截图</div>
            <div class="creator-shot" :style="{ background: active.gradient }">
              <div class="creator-shot-avatar">{{ active.name.slice(0, 1).toUpperCase() }}</div>
              <div class="creator-shot-name">@{{ active.name }}</div>
              <div class="creator-shot-bio">{{ active.bio }}</div>
              <div class="creator-shot-pin">置顶 {{ active.pinned }}</div>
            </div>
            <div class="creator-field">
              <code>{{ active.home }}</code>
              <button type="button" @click="copyHome">{{ copied ? '已复制' : '复制' }}</button>
            </div>
            <section class="creator-block">
              <h3>账号定位</h3>
              <p>从名称、简介和置顶内容《{{ active.pinned }}》看，属于{{ active.track }}赛道。</p>
            </section>
            <section class="creator-block">
              <h3>人设标签</h3>
              <p>头像风格：{{ active.avatarStyle }}</p>
              <p>简介语气：{{ active.tone }}</p>
              <p>人设词：{{ active.personaTag === '无' ? '没有「95后宝妈」「十年程序员」这类人设词' : active.personaTag }}</p>
            </section>
            <section class="creator-block">
              <h3>内容形式</h3>
              <p>首页以{{ active.contentMix }}为主，{{ active.coverStyle }}。</p>
            </section>
            <section class="creator-block">
              <h3>数据表现</h3>
              <p>粉丝数 {{ active.followers }}，获赞数 {{ active.interactions }}，近期作品互动 {{ active.recent }}。</p>
              <p class="creator-judge">判断：{{ accountLevel(active.followers) }}</p>
            </section>
            <section class="creator-block">
              <h3>商业痕迹</h3>
              <p>简介里没有商务联系方式，作品里没有「广告」标注，尚未商业化。</p>
            </section>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
