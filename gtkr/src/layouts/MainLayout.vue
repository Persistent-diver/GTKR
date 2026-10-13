<script setup>
import AppNav from '../components/AppNav.vue'
import BottomNav from '../components/BottomNav.vue'
</script>

<template>
  <div class="shell">
    <AppNav />
    <router-view v-slot="{ Component, route }">
      <transition name="page">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
    <BottomNav />
  </div>
</template>
