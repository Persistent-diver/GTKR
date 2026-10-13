<script setup>
defineProps({
  num: { type: String, required: true },
  title: { type: String, required: true },
  sub: { type: String, required: true },
})
</script>

<template>
  <div class="sec-head">
    <div class="sec-num">{{ num }}</div>
    <div>
      <div class="sec-title">{{ title }}</div>
      <div class="sec-sub">{{ sub }}</div>
    </div>
  </div>
</template>
