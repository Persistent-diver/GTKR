<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  name: { type: String, default: '' },
  meaning: { type: String, default: '' },
  score: { type: Number, required: true },
  label: { type: String, default: '值得做指数' },
  compact: { type: Boolean, default: false },
})

const chartEl = ref(null)
let chart

function render() {
  chart?.setOption({
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        progress: { show: true, width: props.compact ? 8 : 14, itemStyle: { color: '#0EA5E9' } },
        axisLine: { lineStyle: { width: props.compact ? 8 : 14, color: [[1, '#e2e8f0']] } },
        pointer: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          fontSize: props.compact ? 16 : 26,
          fontWeight: 800,
          color: '#0f172a',
          formatter: '{value}',
        },
        data: [{ value: Number(props.score) }],
      },
    ],
  })
}

function onResize() {
  chart?.resize()
}

onMounted(() => {
  chart = echarts.init(chartEl.value)
  render()
  window.addEventListener('resize', onResize)
})

watch(() => [props.score, props.compact], render)

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div class="gauge-card" :class="{ 'is-compact': compact }">
    <div v-if="!compact" class="gauge-name">{{ name }}</div>
    <div v-if="!compact" class="gauge-meaning">{{ meaning }}</div>
    <div class="gauge-sub">{{ label }}</div>
    <div ref="chartEl" class="gauge-chart"></div>
  </div>
</template>
