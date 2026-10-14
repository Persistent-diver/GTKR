<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { taskRows } from '../data/task.js'

const route = useRoute()
const taskCount = computed(() => taskRows.length)

const activeTab = computed(() => {
  if (route.name === 'board') {
    if (route.query.from === 'keywords' || route.query.from === 'product') return route.query.from
    return 'tasks'
  }
  return route.name
})
</script>

<template>
  <nav class="tabbar" aria-label="底部导航">
    <div class="tabbar-in">
      <router-link class="tab-link" :class="{ 'is-active': activeTab === 'keywords' }" :to="{ name: 'keywords' }">
        <span class="icon">tag</span>
        <span>关键词模式</span>
      </router-link>
      <router-link class="tab-link" :class="{ 'is-active': activeTab === 'product' }" :to="{ name: 'product' }">
        <span class="icon">subtitles</span>
        <span>产品+描述模式</span>
      </router-link>
      <router-link class="tab-link" :class="{ 'is-active': activeTab === 'tasks' }" :to="{ name: 'tasks' }">
        <span class="tab-icon">
          <span class="icon">list_alt</span>
          <em v-if="taskCount" class="tab-badge"><span>{{ taskCount > 99 ? '99+' : taskCount }}</span></em>
        </span>
        <span>任务列表</span>
      </router-link>
      <router-link class="tab-link" :class="{ 'is-active': activeTab === 'me' }" :to="{ name: 'me' }">
        <span class="icon">account_circle</span>
        <span>我的</span>
      </router-link>
    </div>
  </nav>
</template>
