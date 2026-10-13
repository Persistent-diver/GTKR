<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CommentBoard from '../components/home/CommentBoard.vue'
import ContentTopics from '../components/home/ContentTopics.vue'
import CreatorBoard from '../components/home/CreatorBoard.vue'
import ExecStatus from '../components/home/ExecStatus.vue'
import TagBoard from '../components/home/TagBoard.vue'
import TrendBoard from '../components/home/TrendBoard.vue'
import { auth } from '../data/auth.js'

const route = useRoute()
const router = useRouter()
const shared = computed(() => Boolean(route.query.share))
const sharer = computed(() => {
  const value = route.query.sharer
  return typeof value === 'string' && value ? value : '分享用户'
})

function goLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}
</script>

<template>
  <main class="page">
    <div v-if="shared" class="share-from">
      <span>分享人</span>
      <b>{{ sharer }}</b>
    </div>
    <ExecStatus />
    <TagBoard />
    <CommentBoard />
    <ContentTopics />
    <CreatorBoard />
    <TrendBoard />
    <div v-if="shared && !auth.loggedIn" class="share-login">
      <button type="button" @click="goLogin">注册登录</button>
    </div>
  </main>
</template>
