const PAGE_WIDTH = 794
const PAGE_HEIGHT = 1123
const PAGE_PAD = 56
const PDF_WIDTH = 595.28
const PDF_HEIGHT = 841.89

function wrapLine(ctx, text, maxWidth) {
  if (!text) return ['']
  const lines = []
  let current = ''
  Array.from(text).forEach((char) => {
    const next = current + char
    if (current && ctx.measureText(next).width > maxWidth) {
      lines.push(current)
      current = char
      return
    }
    current = next
  })
  if (current) lines.push(current)
  return lines
}

function renderPages(lines) {
  const pages = []
  const maxWidth = PAGE_WIDTH - PAGE_PAD * 2
  let canvas
  let ctx
  let y = PAGE_PAD

  function startPage() {
    canvas = document.createElement('canvas')
    canvas.width = PAGE_WIDTH
    canvas.height = PAGE_HEIGHT
    ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
    ctx.fillStyle = '#0f172a'
    ctx.textBaseline = 'top'
    y = PAGE_PAD
  }

  startPage()
  lines.forEach((line, index) => {
    const isTitle = index === 0
    const isHead = line.startsWith('【')
    const fontSize = isTitle ? 28 : isHead ? 18 : 15
    const lineHeight = fontSize + (isTitle ? 14 : 10)
    ctx.font = `${isTitle || isHead ? 700 : 400} ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`
    wrapLine(ctx, line, maxWidth).forEach((text) => {
      if (y + lineHeight > PAGE_HEIGHT - PAGE_PAD) {
        pages.push(canvas)
        startPage()
        ctx.font = `${isTitle || isHead ? 700 : 400} ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`
      }
      if (text) ctx.fillText(text, PAGE_PAD, y)
      y += line ? lineHeight : 8
    })
  })
  pages.push(canvas)
  return pages
}

function canvasToJpeg(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error('无法生成报告图片'))
        return
      }
      resolve(new Uint8Array(await blob.arrayBuffer()))
    }, 'image/jpeg', 0.86)
  })
}

function encodePdf(jpegs) {
  const chunks = []
  let offset = 0
  const offsets = [0]

  function pushText(value) {
    const bytes = new TextEncoder().encode(value)
    chunks.push(bytes)
    offset += bytes.length
  }

  function pushBytes(bytes) {
    chunks.push(bytes)
    offset += bytes.length
  }

  function addObject(parts) {
    offsets.push(offset)
    const id = offsets.length - 1
    pushText(`${id} 0 obj\n`)
    parts.forEach((part) => {
      if (typeof part === 'string') pushText(part)
      else pushBytes(part)
    })
    pushText('\nendobj\n')
  }

  pushText('%PDF-1.3\n')
  const kids = jpegs.map((_, index) => `${3 + index * 3} 0 R`).join(' ')
  addObject([`<< /Type /Catalog /Pages 2 0 R >>`])
  addObject([`<< /Type /Pages /Kids [${kids}] /Count ${jpegs.length} >>`])

  jpegs.forEach((jpeg) => {
    const pageId = offsets.length
    const content = `q\n${PDF_WIDTH} 0 0 ${PDF_HEIGHT} 0 0 cm\n/Im0 Do\nQ\n`
    addObject([
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_WIDTH} ${PDF_HEIGHT}] /Contents ${pageId + 1} 0 R /Resources << /XObject << /Im0 ${pageId + 2} 0 R >> >> >>`,
    ])
    addObject([`<< /Length ${content.length} >>\nstream\n${content}endstream`])
    addObject([
      `<< /Type /XObject /Subtype /Image /Width ${PAGE_WIDTH} /Height ${PAGE_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      jpeg,
      '\nendstream',
    ])
  })

  const xrefStart = offset
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`
  for (let index = 1; index < offsets.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  }
  xref += `trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  pushText(xref)

  const total = chunks.reduce((sum, part) => sum + part.length, 0)
  const output = new Uint8Array(total)
  let cursor = 0
  chunks.forEach((part) => {
    output.set(part, cursor)
    cursor += part.length
  })
  return output
}

export async function downloadReportPdf(lines, filename) {
  const pages = renderPages(lines)
  const jpegs = []
  for (const page of pages) jpegs.push(await canvasToJpeg(page))
  const bytes = encodePdf(jpegs)
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
