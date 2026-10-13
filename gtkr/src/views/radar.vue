<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import KeywordView from './keyword.vue'
import ProductView from './product.vue'
import '../assets/task/task.css'

const route = useRoute()
const router = useRouter()

const tabs = [
  { id: 'keyword', label: '关键词' },
  { id: 'product', label: '产品+描述' },
]

const mode = computed(() => (route.query.mode === 'product' ? 'product' : 'keyword'))

function setMode(next) {
  if (next === mode.value) return
  router.replace({ name: 'radar', query: { mode: next } })
}
</script>

<template>
  <main class="page task radar">
    <div class="task-head">
      <div>
        <h1>关键词雷达</h1>
        <p class="task-lead">在下面两个页签之间切换。关键词直接分析，产品描述先填写再提炼。</p>
      </div>
    </div>

    <div class="mode-tabs" role="tablist" aria-label="分析方式">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        class="mode-tab"
        :class="{ on: mode === tab.id }"
        :aria-selected="mode === tab.id"
        @click="setMode(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <KeywordView v-show="mode === 'keyword'" embedded />
    <ProductView v-show="mode === 'product'" embedded />
  </main>
</template>

<style scoped>
.radar {
  padding-top: 24px;
}

.mode-tabs {
  display: flex;
  gap: 4px;
  width: fit-content;
  max-width: 100%;
  margin-bottom: 20px;
  padding: 4px;
  border-radius: 999px;
  background: #e2e8f0;
}

.mode-tab {
  border: none;
  border-radius: 999px;
  background: transparent;
  padding: 8px 18px;
  color: #64748b;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.mode-tab.on {
  background: #fff;
  color: #0369a1;
}
</style>
