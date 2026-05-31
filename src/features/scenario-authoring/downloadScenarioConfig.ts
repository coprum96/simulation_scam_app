import { downloadJsonFile, formatExportTimestamp } from '../export/downloadJson'
import type { ScenarioConfigDocument, ScenarioConfigExportBundle } from '../../types/scenarioConfig'
import { buildExportBundle } from './scenarioAuthoringPersistence'

export function downloadScenarioConfigDocument(doc: ScenarioConfigDocument): void {
  downloadJsonFile(doc, `scenario_${doc.scenarioId}_v${doc.version}.json`)
}

export function downloadScenarioConfigBundle(documents: ScenarioConfigDocument[]): void {
  const bundle: ScenarioConfigExportBundle = buildExportBundle(documents)
  downloadJsonFile(bundle, `scenario_configs_${formatExportTimestamp()}.json`)
}
