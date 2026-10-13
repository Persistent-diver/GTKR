import { reactive } from 'vue'

export const regions = [
  { id: 'us', name: '美国-纽约',  },
  { id: 'eu', name: '欧洲-柏林',  },
  { id: 'jp', name: '日本-东京', },
  { id: 'sea', name: '东南亚-新加坡', },
  { id: 'me', name: '中东-迪拜', },
]

export const taskRows = reactive([
  {
    id: 1,
    mode: 'keyword',
    title: '#glowmaker & ambient lamp',
    lang: '英语',
    translation: 'glow maker & ambient lamp',
    detail: '重点捕捉TikTok桌面好物美学及独居治愈语境',
    region: '美国-纽约',
    action: '查看分析详情',
    icon: 'insights',
  },
  {
    id: 2,
    mode: 'product',
    title: '无线磁吸护眼屏幕挂灯 (Screenbar Halo)',
    detail: 'Obsessed with this ambient glow lamp! Totally changed my dorm...',
    region: '欧洲-柏林',
    action: '跳转结果报告',
    icon: 'summarize',
  },
  {
    id: 3,
    mode: 'keyword',
    title: 'desk organizer aesthetic #wfh',
    lang: '日语',
    translation: 'デスク整理 在宅ワーク',
    detail: '针对日韩极简办公收纳博主高频挂车视频归纳',
    region: '日本-东京',
    action: '查看分析详情',
    icon: 'insights',
  },
  {
    id: 4,
    mode: 'product',
    title: '超静音便携桌面冷雾风扇',
    detail: '高客单轻奢中东夏季消暑礼品，主打冰感降温与氛围呼吸夜灯',
    region: '中东-迪拜',
    action: '跳转结果报告',
    icon: 'summarize',
  },
])

let taskSeed = 5

export const currentTask = reactive({
  id: taskRows[0].id,
  mode: taskRows[0].mode,
  title: taskRows[0].title,
  region: taskRows[0].region || '',
  translation: taskRows[0].translation || '',
  lang: taskRows[0].lang || '',
})

export function setCurrentTask(row) {
  currentTask.id = row.id
  currentTask.mode = row.mode
  currentTask.title = row.title
  currentTask.region = row.region || ''
  currentTask.translation = row.translation || ''
  currentTask.lang = row.lang || ''
}

export function addTask(row) {
  const task = { id: taskSeed, ...row }
  taskRows.unshift(task)
  taskSeed += 1
  setCurrentTask(task)
}

export const extractedKeywords = [
  { name: '# 屏幕挂灯护眼', badge: '爆款潜力 98%', tone: 'success', meta: '月搜索指数 420K+', rate: '转化率 14.8%' },
  { name: '# 桌面好物Dupe', badge: '热度飙升 310%', tone: 'orange', meta: 'TikTok播放 1.8M', rate: '转化率 18.2%' },
  { name: '# 极简数码桌搭', badge: '高转化标签', tone: 'primary', meta: '月搜索指数 380K', rate: '转化率 12.5%' },
  { name: '# 程序员氛围感', badge: '高客单带货', tone: 'success', meta: '点赞互动率 8.6%', rate: '转化率 16.0%' },
  { name: '# 考研深夜自习灯', badge: '情绪刚需词', tone: 'orange', meta: '播放量 920K', rate: '转化率 19.4%' },
  { name: '# 无眩光屏幕照明', badge: '功能对冲词', tone: 'primary', meta: '竞品攻防词', rate: '转化率 13.9%' },
  { name: '# 桌面收纳神器', badge: '高频痛点词', tone: 'success', meta: '社媒热词 #desksetup', rate: '转化率 15.3%' },
  { name: '# 治愈系办公角', badge: '自然引流词', tone: 'orange', meta: '视频赞藏比 1:4', rate: '转化率 11.7%' },
  { name: '# 护眼黑科技', badge: '信任状背书', tone: 'primary', meta: '完播率 +24%', rate: '转化率 17.5%' },
  { name: '# 沉浸式开箱', badge: '冲动下单王', tone: 'success', meta: 'ASMR/开箱高转化', rate: '转化率 21.1%' },
]
