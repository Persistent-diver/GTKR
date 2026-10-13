<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeTab = computed(() => {
  if (route.name === 'board') {
    return route.query.from === 'keywords' || route.query.from === 'product' ? 'radar' : 'tasks'
  }
  if (route.name === 'radar') return 'radar'
  return route.name
})
</script>

<template>
  <nav class="tabbar" aria-label="底部导航">
    <div class="tabbar-in">
      <router-link class="tab-link" :class="{ 'is-active': activeTab === 'radar' }" :to="{ name: 'radar' }">
        <span class="icon">radar</span>
        <span>关键词雷达</span>
      </router-link>
      <router-link class="tab-link" :class="{ 'is-active': activeTab === 'tasks' }" :to="{ name: 'tasks' }">
        <span class="icon">list_alt</span>
        <span>任务列表</span>
      </router-link>
      <router-link class="tab-link" :class="{ 'is-active': activeTab === 'me' }" :to="{ name: 'me' }">
        <span class="icon">account_circle</span>
        <span>我的</span>
      </router-link>
    </div>
  </nav>
</template>
