type Word = { text: string; x1: number; y1: number; x2: number; y2: number; page?: number }

export async function extractWordsFromPdf(file: File): Promise<Word[]> {
  const { GlobalWorkerOptions, getDocument } = await import("pdfjs-dist")
  GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.394/pdf.worker.min.js"
  const ab = await file.arrayBuffer()
  const loadingTask = getDocument({ data: ab })
  const pdf = await loadingTask.promise
  const words: Word[] = []
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const viewport = page.getViewport({ scale: 1 })
    const content = await page.getTextContent()
    for (const item of content.items as any[]) {
      if (!item?.str || !item?.transform) continue
      const [a, b, c, d, e, f] = item.transform as number[]
      const x1 = e
      const y1 = f
      const width = item.width || Math.abs(a)
      const height = Math.abs(d)
      const x2 = x1 + width
      const y2 = y1 + height
      const pt = viewport.convertToViewportPoint(x1, y1)
      const pt2 = viewport.convertToViewportPoint(x2, y2)
      words.push({ text: String(item.str), x1: pt[0], y1: pt[1], x2: pt2[0], y2: pt2[1], page: p })
    }
  }
  return words
}
