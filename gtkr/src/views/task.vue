<script setup>
import { useRouter } from 'vue-router'
import { setCurrentTask, taskRows } from '../data/task.js'
import { TrackEvent, track } from '../track'
import '../assets/task/task.css'

const router = useRouter()

function openReport(row) {
  setCurrentTask(row)
  track(TrackEvent.REPORT_OPEN, { title: row.title, mode: row.mode })
  router.push({ name: 'board', query: { from: 'tasks' } })
}
</script>

<template>
  <main class="page task">
    <div class="task-head">
      <div>
        <h1>任务列表</h1>
        <p class="task-lead">查看已提交的关键词和产品任务，并跳转到对应分析结果</p>
      </div>
    </div>

    <section class="job-list">
      <article v-for="row in taskRows" :key="row.id" class="job-card">
        <div class="job-top">
          <span class="mode-pill" :class="{ product: row.mode === 'product' }">
            <span class="icon">{{ row.mode === 'keyword' ? 'tag' : 'subtitles' }}</span>
            {{ row.mode === 'keyword' ? '关键词模式' : '产品+描述模式' }}
          </span>
          <span class="region-pill"><span class="icon">flag</span>{{ row.region }}</span>
        </div>
        <h2 class="job-title">{{ row.title }}</h2>
        <p v-if="row.mode === 'keyword' && row.translation" class="job-translation">
          <span>{{ row.lang || '译文' }}</span>
          <b>{{ row.translation }}</b>
        </p>
        <p class="job-detail">{{ row.detail }}</p>
        <button type="button" class="detail-btn" @click="openReport(row)">
          <span class="icon">{{ row.icon }}</span>{{ row.action }}
        </button>
      </article> 
    </section>
  </main>
</template>
