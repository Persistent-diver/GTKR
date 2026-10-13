import { reactive } from 'vue'

export const taskCost = 2

export const account = reactive({
  balance: 268,
  records: [
    { id: 1, title: '关键词深度提炼', detail: '#glowmaker & ambient lamp · 美国', amount: -2, time: '10-12 18:24' },
    { id: 2, title: '产品描述提炼', detail: '无线磁吸护眼屏幕挂灯 · 欧洲', amount: -2, time: '10-12 16:05' },
    { id: 3, title: '账户充值', detail: '微信支付', amount: 100, time: '10-11 09:40' },
    { id: 4, title: '关键词深度提炼', detail: 'desk organizer aesthetic · 日本', amount: -2, time: '10-10 21:16' },
    { id: 5, title: '账户充值', detail: '支付宝', amount: 200, time: '10-08 11:02' },
    { id: 6, title: '关键词深度提炼', detail: 'desk setup aesthetic · 东南亚', amount: -2, time: '10-07 20:18' },
    { id: 7, title: '产品描述提炼', detail: '超静音便携桌面冷雾风扇 · 中东', amount: -2, time: '10-06 15:42' },
    { id: 8, title: '账户充值', detail: '微信支付', amount: 50, time: '10-05 09:11' },
  ],
})

let recordSeed = 9

export function recharge(amount, gift = 0) {
  const gained = amount + gift
  account.balance += gained
  account.records.unshift({
    id: recordSeed,
    title: '账户充值',
    detail: gift ? `到账 ${amount} 元，赠送 ${gift} 元` : '微信支付',
    amount: gained,
    time: '刚刚',
  })
  recordSeed += 1
  return gained
}

export function spend(title, detail, amount = taskCost) {
  account.balance -= amount
  account.records.unshift({
    id: recordSeed,
    title,
    detail,
    amount: -amount,
    time: '刚刚',
  })
  recordSeed += 1
}
