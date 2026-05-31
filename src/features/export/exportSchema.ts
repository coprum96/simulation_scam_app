export const RESEARCH_EXPORT_SCHEMA = {
  name: 'research_export',
  version: 1,
} as const

export type ExportMetadata = {
  schemaName: typeof RESEARCH_EXPORT_SCHEMA.name
  schemaVersion: typeof RESEARCH_EXPORT_SCHEMA.version
  exportedAt: string
}

