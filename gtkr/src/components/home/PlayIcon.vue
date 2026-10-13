<script setup>
defineProps({
  color: { type: String, default: '#fff' },
  size: { type: Number, default: 13 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24">
    <path d="M6 4 L20 12 L6 20 Z" :fill="color" />
  </svg>
</template>
