const phrases = [
  { source: '屏幕挂灯', us: 'monitor light bar', eu: 'Monitorleuchte', jp: 'モニターライト', sea: 'screen light bar', me: 'إضاءة شاشة' },
  { source: '氛围灯', us: 'ambient lamp', eu: 'Ambienteleuchte', jp: '雰囲気ランプ', sea: 'cozy ambient light', me: 'إضاءة أجواء' },
  { source: '台灯', us: 'desk lamp', eu: 'Schreibtischlampe', jp: 'デスクライト', sea: 'study desk lamp', me: 'مصباح مكتب' },
  { source: '护眼', us: 'eye-care', eu: 'augenschonend', jp: '目に優しい', sea: 'eye-friendly', me: 'مريح للعين' },
  { source: '桌面', us: 'desk setup', eu: 'Schreibtisch', jp: 'デスク周り', sea: 'desk setup ideas', me: 'مكتب' },
  { source: '收纳', us: 'organizer', eu: 'Aufbewahrung', jp: '収納', sea: 'desk organizer', me: 'تنظيم' },
  { source: '灯带', us: 'LED light strip', eu: 'LED-Lichtleiste', jp: 'LEDテープライト', sea: 'room LED strip', me: 'شريط إضاءة' },
  { source: '加湿器', us: 'humidifier', eu: 'Luftbefeuchter', jp: '加湿器', sea: 'mini humidifier', me: 'جهاز ترطيب' },
  { source: '风扇', us: 'desk fan', eu: 'Tischventilator', jp: '卓上扇風機', sea: 'quiet desk fan', me: 'مروحة مكتب' },
  { source: '支架', us: 'phone stand', eu: 'Handyhalterung', jp: 'スマホスタンド', sea: 'phone holder', me: 'حامل هاتف' },
  { source: '露营灯', us: 'camping lantern', eu: 'Campinglampe', jp: 'キャンプランタン', sea: 'portable lantern', me: 'فانوس تخييم' },
  { source: '出租屋', us: 'rental room makeover', eu: 'Mietwohnung umgestalten', jp: '賃貸リメイク', sea: 'small room makeover', me: 'تجديد غرفة مستأجرة' },
  { source: 'glowmaker', us: 'glow maker', eu: 'Glow-Maker', jp: 'グロウメーカー', sea: 'glow maker aesthetic', me: 'صانع التوهج' },
  { source: 'ambient lamp', us: 'ambient lamp', eu: 'Ambienteleuchte', jp: 'アンビエントランプ', sea: 'ambient lamp aesthetic', me: 'مصباح أجواء' },
  { source: 'desk lamp', us: 'desk lamp', eu: 'Schreibtischlampe', jp: 'デスクランプ', sea: 'desk lamp setup', me: 'مصباح مكتب' },
  { source: 'aesthetic', us: 'aesthetic', eu: 'ästhetisch', jp: 'おしゃれ', sea: 'aesthetic', me: 'جمالي' },
]

export const targetLangs = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁体中文' },
  { value: 'en', label: '英语' },
  { value: 'ja', label: '日语' },
  { value: 'ko', label: '韩语' },
  { value: 'de', label: '德语' },
  { value: 'fr', label: '法语' },
  { value: 'es', label: '西班牙语' },
  { value: 'pt', label: '葡萄牙语' },
  { value: 'ru', label: '俄语' },
  { value: 'ar', label: '阿拉伯语' },
  { value: 'th', label: '泰语' },
  { value: 'vi', label: '越南语' },
  { value: 'id', label: '印尼语' },
  { value: 'ms', label: '马来语' },
  { value: 'hi', label: '印地语' },
  { value: 'it', label: '意大利语' },
  { value: 'nl', label: '荷兰语' },
  { value: 'tr', label: '土耳其语' },
  { value: 'pl', label: '波兰语' },
]

// 词库有真实译文的语种，其余语种走兜底短语
const glossByLang = { en: 'us', ja: 'jp', de: 'eu', ar: 'me' }

function applyPhrases(text, key) {
  const sorted = [...phrases].sort((a, b) => b.source.length - a.source.length)
  let next = text
  let changed = false
  sorted.forEach((item) => {
    const pattern = new RegExp(item.source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig')
    if (!pattern.test(next)) return
    changed = true
    next = next.replace(pattern, item[key])
  })
  return { text: next.replace(/\s+/g, ' ').trim(), changed }
}

const fallback = {
  'zh-CN': () => '家居装饰灵感',
  'zh-TW': () => '家居裝飾靈感',
  en: () => 'home decor ideas',
  ja: () => 'インテリアのおすすめ',
  ko: () => '홈 데코 아이디어',
  de: () => 'Wohndeko Ideen',
  fr: () => 'idées déco maison',
  es: () => 'ideas de decoración',
  pt: () => 'ideias de decoração',
  ru: () => 'идеи для декора',
  ar: () => 'أفكار ديكور منزلي',
  th: () => 'ไอเดียแต่งบ้าน',
  vi: () => 'ý tưởng trang trí nhà',
  id: () => 'ide dekorasi rumah',
  ms: () => 'idea hiasan rumah',
  hi: () => 'होम डेकोर आइडिया',
  it: () => 'idee per la casa',
  nl: () => 'woondecoratie ideeën',
  tr: () => 'ev dekorasyon fikirleri',
  pl: () => 'pomysły na dekorację',
}

export function translateKeyword(raw, langValue = 'en') {
  const source = raw.trim()
  const hashed = source.startsWith('#')
  const body = hashed ? source.slice(1).trim() : source
  const glossKey = glossByLang[langValue]
  const translated = glossKey ? applyPhrases(body, glossKey) : { changed: false }
  const text = translated.changed ? translated.text : (fallback[langValue] || fallback.en)()
  const option = targetLangs.find((item) => item.value === langValue)
  return {
    lang: option ? option.label : langValue,
    text: hashed ? `#${text}` : text,
  }
}

// 各语种的长尾后缀，用于生成第 3 个候选译文
const tails = {
  'zh-CN': '热门推荐',
  'zh-TW': '熱門推薦',
  en: 'ideas 2026',
  ja: '人気アイテム',
  ko: '인기 아이템',
  de: 'Ideen 2026',
  fr: 'idées 2026',
  es: 'ideas 2026',
  pt: 'ideias 2026',
  ru: 'идеи 2026',
  ar: 'أفكار 2026',
  th: 'ไอเดียยอดนิยม',
  vi: 'ý tưởng hay',
  id: 'ide populer',
  ms: 'idea popular',
  hi: 'लोकप्रिय आइडिया',
  it: 'idee popolari',
  nl: 'populaire ideeën',
  tr: 'popüler fikirler',
  pl: 'popularne pomysły',
}

// 一次生成 3 个候选译文：标准直译 / 话题标签版 / 长尾组合版
export function translateVariants(raw, langValue = 'en') {
  const base = translateKeyword(raw, langValue)
  const plain = base.text.replace(/^#/, '').trim()
  const candidates = [
    base.text,
    `#${plain.replace(/\s+/g, '')}`,
    `${plain} ${tails[langValue] || tails.en}`,
  ]
  const seen = new Set()
  return candidates
    .filter((text) => {
      const key = text.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 3)
    .map((text) => ({ lang: base.lang, text }))
}
