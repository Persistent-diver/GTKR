<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import GaugeCard from './GaugeCard.vue'
import SectionHead from './SectionHead.vue'
import { gaugePanelHeight } from '../../data/boardLayout.js'
import { createInitialTags } from '../../data/demo.js'
import { TrackEvent, track } from '../../track'
import '../../assets/home/tag.css'

const tags = ref(createInitialTags())
const keyword = ref('')
const listEl = ref(null)
const sortKey = ref('strength')
const sortOptions = [
  { id: 'strength', label: '关联强度', icon: 'hub' },
  { id: 'score', label: '值得做指数', icon: 'speed' },
  { id: 'plays', label: '播放量', icon: 'play_circle' },
]
const visibleCount = 3

const sortedTags = computed(() =>
  [...tags.value].sort((a, b) => (b[sortKey.value] || 0) - (a[sortKey.value] || 0)),
)

function fitListHeight() {
  const list = listEl.value
  if (!list) return
  const items = list.querySelectorAll('.tag-item')
  if (!items.length || items.length <= visibleCount) {
    list.style.maxHeight = 'none'
    gaugePanelHeight.value = list.scrollHeight
    return
  }
  const last = items[visibleCount - 1]
  const style = getComputedStyle(list)
  const extra = parseFloat(style.paddingBottom) + parseFloat(style.borderBottomWidth)
  const height = last.offsetTop + last.offsetHeight + extra
  list.style.maxHeight = `${height}px`
  gaugePanelHeight.value = height
}

function addTag() {
  const value = keyword.value.trim()
  if (!value) return
  const tag = value.startsWith('#') ? value : `#${value}`
  track(TrackEvent.TAG_ADD, { tag })
  tags.value.push({
    tag,
    meaning: '含义分析中',
    data: '已加入分析队列 · 正在抓取',
    summary: '拆解总结生成中',
    adLevel: '中',
    countries: '分析中',
    plays: 0,
    strength: 70,
    score: 70,
  })
  keyword.value = ''
  nextTick(fitListHeight)
}

function setSort(id) {
  sortKey.value = id
  nextTick(fitListHeight)
}

onMounted(() => {
  fitListHeight()
  window.addEventListener('resize', fitListHeight)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', fitListHeight)
})
</script>

<template>
  <section class="section">
    <SectionHead
      num="02"
      title="标签板块"
      sub="每条标签的关联强度和值得做指数在右上角，可按关联强度、值得做指数或播放量排序"
    />

    <div class="card">
      <div class="tag-sort" role="tablist" aria-label="标签排序">
        <button
          v-for="option in sortOptions"
          :key="option.id"
          type="button"
          class="tag-sort-btn"
          :class="{ on: sortKey === option.id }"
          :aria-label="`${option.label}，从高到低`"
          @click="setSort(option.id)"
        >
          <span class="icon" aria-hidden="true">{{ option.icon }}</span>
          {{ option.label }}
          <span v-if="sortKey === option.id" class="icon sort-mark" aria-hidden="true">arrow_downward</span>
        </button>
      </div>
      <div ref="listEl" v-scroll-always class="tag-list">
        <div v-for="item in sortedTags" :key="item.tag" class="tag-item">
          <div class="tag-body">
            <div class="tag-hash">{{ item.tag }}</div>
            <div class="tag-meaning">{{ item.meaning }}</div>
            <div class="tag-data">{{ item.data }}</div>
            <div class="tag-facts">
              <p><span>广告浓度：</span><b :class="`is-${item.adLevel}`">{{ item.adLevel }}</b></p>
              <p><span>主要国家：</span>{{ item.countries }}</p>
            </div>
            <div class="tag-summary"><span>标签内容总结：</span>{{ item.summary }}</div>
          </div>
          <div class="tag-corner">
            <div class="gauge-grid">
              <GaugeCard compact label="关联强度" :score="item.strength" />
              <GaugeCard compact label="值得做指数" :score="item.score" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
