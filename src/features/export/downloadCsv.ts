function escapeCsvCell(value: unknown): string {
  const raw = value === null || value === undefined ? '' : String(value)
  if (!/[",\n]/.test(raw)) return raw
  return `"${raw.replace(/"/g, '""')}"`
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => headers.map((key) => escapeCsvCell(row[key])).join(',')),
  ]
  return lines.join('\n')
}

export function downloadCsvFile<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
): void {
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

/** Stagger downloads so browsers do not block rapid multi-file exports. */
export function downloadCsvFilesSequential(
  files: Array<{ rows: Record<string, unknown>[]; filename: string }>,
  delayMs = 250,
): void {
  files.forEach(({ rows, filename }, index) => {
    window.setTimeout(() => downloadCsvFile(rows, filename), index * delayMs)
  })
}

