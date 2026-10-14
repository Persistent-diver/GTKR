<script setup>
defineProps({
  title: { type: String, default: '分析详情' },
  badge: { type: String, default: '' },
  label: { type: String, default: '分析详情' },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="bd-modal" @click.self="emit('close')">
    <div class="bd-sheet" role="dialog" aria-modal="true" :aria-label="label">
      <div class="bd-handle" aria-hidden="true"></div>
      <header class="bd-head">
        <div class="bd-title">
          <i aria-hidden="true"></i>
          <strong>{{ title }}</strong>
          <span v-if="badge">{{ badge }}</span>
        </div>
        <button type="button" class="bd-close" aria-label="关闭" @click="emit('close')">×</button>
      </header>
      <div class="bd-body">
        <div class="bd-card">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bd-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.bd-sheet {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 92vh;
  max-height: 92dvh;
  overflow: hidden;
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.35);
}

.bd-handle {
  width: 40px;
  height: 6px;
  margin: 12px auto 4px;
  border-radius: 999px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.bd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid #f1f5f9;
  flex-shrink: 0;
}

.bd-title {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.bd-title i {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #0ea5e9;
  box-shadow: 0 0 0 4px #e0f2fe;
}

.bd-title strong {
  color: #1e293b;
  font-size: 16px;
  white-space: nowrap;
}

.bd-title span {
  padding: 2px 8px;
  border: 1px solid #e0f2fe;
  border-radius: 6px;
  background: #f0f9ff;
  color: #0284c7;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.bd-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #94a3b8;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  font-family: inherit;
}

.bd-close:hover {
  background: #e2e8f0;
  color: #475569;
}

.bd-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  background: rgba(248, 250, 252, 0.9);
}

.bd-card {
  padding: 16px;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

@media (min-width: 641px) {
  .bd-modal {
    align-items: center;
    padding: 24px 16px;
  }

  .bd-sheet {
    width: min(640px, 100%);
    border-radius: 28px;
  }

  .bd-handle {
    display: none;
  }
}
</style>
