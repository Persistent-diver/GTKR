<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import BoardDialog from './BoardDialog.vue'
import PlayIcon from './PlayIcon.vue'
import SectionHead from './SectionHead.vue'
import { keywords, videos } from '../../data/demo.js'
import { TrackEvent, track } from '../../track'
import '../../assets/home/content.css'

const listEl = ref(null)
const active = ref(null)
const player = ref(null)
const playing = ref(false)
const copied = ref(false)
const cloudCopied = ref('')
const visibleCount = 5
let copyTimer = 0
let cloudTimer = 0

watch(active, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

function openVideo(video) {
  active.value = video
  copied.value = false
  playing.value = false
  track(TrackEvent.VIDEO_OPEN, { no: video.no, title: video.title })
}

function closeVideo() {
  if (player.value) player.value.pause()
  active.value = null
  copied.value = false
  playing.value = false
  window.clearTimeout(copyTimer)
}

async function startPlay() {
  if (active.value) track(TrackEvent.VIDEO_PLAY, { no: active.value.no, title: active.value.title })
  playing.value = true
  await nextTick()
  try {
    await player.value?.play()
  } catch {
    // 浏览器拦住自动播放时，控件仍可手动播放
  }
}

function onKeydown(event) {
  if (event.key === 'Escape') closeVideo()
}

async function writeText(text) {
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
}

async function copyCloud(text) {
  await writeText(text)
  cloudCopied.value = text
  window.clearTimeout(cloudTimer)
  cloudTimer = window.setTimeout(() => {
    cloudCopied.value = ''
  }, 1600)
}

async function copyLink() {
  if (!active.value) return
  track(TrackEvent.VIDEO_LINK_COPY, { no: active.value.no, title: active.value.title })
  await writeText(active.value.link)
  copied.value = true
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

function fitListHeight() {
  const list = listEl.value
  if (!list) return
  const rows = list.querySelectorAll('.video-row')
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
  window.clearTimeout(cloudTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="section">
    <SectionHead
      num="04"
      title="内容拆解板块"
      :sub="`机器人把视频逐条拆开，告诉你这个方向都在讲什么`"
    />

    <div class="card cloud">
      <div class="cloud-title">
        这个方向整体在讲什么 —— 关键词云图
        <span v-if="cloudCopied" class="cloud-copied">已复制 {{ cloudCopied }}</span>
      </div>
      <div class="cloud-wrap">
        <button
          v-for="word in keywords"
          :key="word.text"
          type="button"
          :class="`cw-${word.level}`"
          :aria-label="`复制${word.text}`"
          @click="copyCloud(word.text)"
        >{{ word.text }}</button>
      </div>
    </div>

    <div class="card video-card">
      <div class="video-head">
        <div>视频封面</div>
        <div>视频分类</div>
        <div class="v-col3">这条视频在讲什么（20字）</div>
      </div>
      <div ref="listEl" v-scroll-always class="video-list">
      <div
        v-for="video in videos"
        :key="video.no"
        class="video-row"
        role="button"
        tabindex="0"
        @click="openVideo(video)"
        @keydown.enter="openVideo(video)"
      >
        <div class="v-cover" :style="{ background: video.gradient }">
          {{ video.no }}
        </div>
        <div>
          <span class="v-cat">{{ video.category }}</span>
        </div>
        <div class="v-desc">
          <template v-for="(part, index) in video.parts" :key="index">
            <b v-if="part.bold">{{ part.text }}</b>
            <template v-else>{{ part.text }}</template>
          </template>
          <div class="v-metrics">
            <span>播放量 <b>{{ video.plays }}</b></span>
            <span>点赞量 <b>{{ video.likes }}</b></span>
            <span>评论量 <b>{{ video.comments }}</b></span>
          </div>
        </div>
      </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="pop">
        <BoardDialog v-if="active" badge="视频详情" :label="active.title" @close="closeVideo">
          <div class="vm-layout" :class="{ 'is-playing': playing }">
            <button
              v-if="!playing"
              type="button"
              class="vm-cover"
              :style="{ background: active.gradient }"
              aria-label="播放"
              @click="startPlay"
            >
              <span class="vm-no">{{ active.no }}</span>
              <span class="vm-play" aria-hidden="true">
                <PlayIcon color="#0f172a" :size="16" />
              </span>
            </button>
            <video
              v-else
              ref="player"
              class="vm-cover vm-player"
              src="/preview.mp4"
              controls
              playsinline
            ></video>
            <div class="vm-body">
              <div class="vm-intro">
                <div class="vm-block">
                  <span class="vm-k">视频标题：</span>
                  <div class="vm-v">
                    <b>{{ active.origin }}</b>
                    <div class="vm-tr"><span class="icon" aria-hidden="true">translate</span>{{ active.title }}</div>
                  </div>
                </div>
                <div class="vm-line">博主名：<b>{{ active.author }}</b></div>
                <div class="vm-desc">
                  <span>视频内容：</span>
                  <template v-for="(part, index) in active.parts" :key="index">
                    <b v-if="part.bold">{{ part.text }}</b>
                    <template v-else>{{ part.text }}</template>
                  </template>
                </div>
              </div>
              <div class="vm-stats">
                <div><span>播放</span><b>{{ active.plays }}</b></div>
                <div><span>点赞</span><b>{{ active.likes }}</b></div>
                <div><span>评论</span><b>{{ active.comments }}</b></div>
              </div>
              <div class="vm-link">
                <span>视频链接</span>
                <code>{{ active.link }}</code>
                <button type="button" @click="copyLink">{{ copied ? '已复制' : '复制' }}</button>
              </div>
            </div>
          </div>
        </BoardDialog>
      </Transition>
    </Teleport>
  </section>
</template>
