<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import SectionHead from './SectionHead.vue'
import { trendDates, trendSeries } from '../../data/demo.js'
import '../../assets/home/trend.css'

const chartEl = ref(null)
let chart
let narrow = false

function chartOption(isNarrow) {
  return {
    tooltip: { trigger: 'axis', confine: true },
    legend: {
      type: isNarrow ? 'scroll' : 'plain',
      data: trendSeries.map((item) => item.name),
      top: 0,
      left: isNarrow ? 0 : 'center',
      right: isNarrow ? 0 : undefined,
      textStyle: { color: '#64748b', fontSize: isNarrow ? 11 : 12 },
    },
    grid: { left: 8, right: isNarrow ? 12 : 16, top: isNarrow ? 52 : 44, bottom: 8, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendDates,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b', fontSize: isNarrow ? 11 : 12 },
    },
    yAxis: {
      type: 'value',
      name: '当日新增播放量（万）',
      nameTextStyle: { color: '#64748b', fontSize: isNarrow ? 11 : 12 },
      splitLine: { lineStyle: { color: '#eef2f7' } },
      axisLabel: { color: '#64748b', fontSize: isNarrow ? 11 : 12 },
    },
    series: trendSeries.map((item) => ({
      name: item.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: isNarrow ? 6 : 7,
      data: item.data,
      lineStyle: { width: 3, color: item.color },
      itemStyle: { color: item.color },
    })),
  }
}

function onResize() {
  if (!chart || !chartEl.value) return
  const nextNarrow = chartEl.value.clientWidth < 680
  if (nextNarrow !== narrow) {
    narrow = nextNarrow
    chart.setOption(chartOption(narrow), true)
  }
  chart.resize()
}

onMounted(() => {
  narrow = chartEl.value.clientWidth < 680
  chart = echarts.init(chartEl.value)
  chart.setOption(chartOption(narrow))
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
  chart = null
})
</script>

<template>
  <section class="section">
    <SectionHead num="06" title="TOP10趋势板块" sub="这个标签在涨还是在跌，一周走势看得清清楚楚" />
    <div class="card trend-chart">
      <div ref="chartEl" class="chart"></div>
    </div>
  </section>
</template>
