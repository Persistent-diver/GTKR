<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import SectionHead from './SectionHead.vue'
import { gaugePanelHeight } from '../../data/boardLayout.js'
import { comments, videos } from '../../data/demo.js'
import '../../assets/home/comment.css'

const listEl = ref(null)
const active = ref(null)
const copied = ref(false)
const visibleCount = 5
const showMore = ref(comments.map(() => false))
let copyTimer = 0
const rows = comments.map((item) => {
  const video = videos.find((entry) => entry.no === item.videoNo)
  return {
    ...item,
    parts: video ? video.parts : [],
    category: video ? video.category : '',
    gradient: video ? video.gradient : '',
    no: video ? video.no : '',
    link: video ? video.link : '',
    likes: video ? video.likes : '',
    commentCount: video ? video.comments : '',
  }
})

watch(active, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function openComment(row) {
  copied.value = false
  active.value = row
}

async function copyLink() {
  if (!active.value?.link) return
  const text = active.value.link
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

function closeComment() {
  active.value = null
}

function onKeydown(event) {
  if (event.key === 'Escape') closeComment()
}

function applyHeight() {
  const list = listEl.value
  if (!list) return
  if (gaugePanelHeight.value > 0) {
    list.style.maxHeight = `${gaugePanelHeight.value}px`
    return
  }
  const items = list.querySelectorAll('.comment-item')
  if (items.length <= visibleCount) {
    list.style.maxHeight = 'none'
  } else {
    const lastVisible = items[visibleCount - 1]
    list.style.maxHeight = `${lastVisible.offsetTop + lastVisible.offsetHeight}px`
  }
}

watch(gaugePanelHeight, applyHeight)

async function refreshLayout() {
  const list = listEl.value
  if (!list) return
  showMore.value = rows.map(() => false)
  await nextTick()
  applyHeight()
  const items = list.querySelectorAll('.comment-item')
  showMore.value = rows.map((row, index) => {
    const rowEl = items[index]
    if (!rowEl) return false
    const origin = rowEl.querySelector('.comment-origin')
    const trans = rowEl.querySelector('.comment-trans')
    const truncated = (el) => el && el.scrollWidth > el.clientWidth + 1
    return truncated(origin) || truncated(trans)
  })
}

onMounted(() => {
  refreshLayout()
  window.addEventListener('resize', refreshLayout)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', refreshLayout)
  window.removeEventListener('keydown', onKeydown)
  window.clearTimeout(copyTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="section">
    <SectionHead num="03" title="评论板块" sub="评论区在问什么，比标题更接近购买理由" />
    <div class="card comment-card">
      <div ref="listEl" v-scroll-always class="comment-list">
        <div v-for="(row, index) in rows" :key="index" class="comment-item" @click="openComment(row)">
          <div class="comment-mark">评论内容：</div>
          <div class="comment-quote-row">
            <div class="comment-quote">
              <p class="comment-origin">{{ row.origin }}</p>
              <p class="comment-trans"><span class="comment-badge">译</span>{{ row.text }}</p>
            </div>
            <span class="comment-guide" aria-hidden="true">
              <svg width="26" height="22" viewBox="0 0 26 22">
                <path d="M6 5h10.8c3.1 0 5.4 2.3 5.4 5.4s-2.3 5.4-5.4 5.4H8.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
                <path d="M11.4 12.6 7.4 15.8 11.4 19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
          </div>
          <div class="comment-meta" >
            <span class="comment-mark">视频内容：</span>
            <span v-if="row.category" class="comment-cat">{{ row.category }}</span>
            <span class="comment-video-desc">
              <template v-for="(part, partIndex) in row.parts" :key="partIndex">
                <b v-if="part.bold">{{ part.text }}</b>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="pop">
        <div v-if="active" class="comment-modal" @click.self="closeComment">
        <div class="comment-dialog" role="dialog" aria-modal="true" aria-label="评论详情">
          <button type="button" class="comment-close" aria-label="关闭" @click="closeComment">×</button>
          <div class="comment-detail-head">
            <div class="comment-cover" :style="{ background: active.gradient }">{{ active.no }}</div>
            <div class="comment-detail-side">
              <div class="comment-detail-label">视频内容</div>
              <div class="comment-detail-video">
                <template v-for="(part, partIndex) in active.parts" :key="partIndex">
                  <b v-if="part.bold">{{ part.text }}</b>
                  <template v-else>{{ part.text }}</template>
                </template>
              </div>
              <div class="comment-detail-stats">
                <div><span>点赞</span><b>{{ active.likes }}</b></div>
                <div><span>评论</span><b>{{ active.commentCount }}</b></div>
              </div>
              <div class="comment-detail-link">
                <span>视频链接</span>
                <code>{{ active.link }}</code>
                <button type="button" @click="copyLink">{{ copied ? '已复制' : '复制' }}</button>
              </div>
            </div>
          </div>
          <div class="comment-detail-label">评论原文</div>
          <div class="comment-origin is-full">{{ active.origin }}</div>
          <div class="comment-detail-label">评论翻译</div>
          <div class="comment-detail-trans is-full">{{ active.text }}</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
