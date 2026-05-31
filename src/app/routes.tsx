import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './AppLayout'
import { ScenarioHubPage } from '../features/scenarios/ScenarioHubPage'
import { BankingFlowPage } from '../features/banking/BankingFlowPage'
import { WalletFlowPage } from '../features/wallet/WalletFlowPage'
import { SessionReplayPage } from '../features/session-replay'
import { DashboardPage } from '../features/dashboard'
import {
  AnalyticsComparePage,
  AnalyticsFlagDrilldownPage,
  AnalyticsRuleDrilldownPage,
  AnalyticsScenarioDrilldownPage,
  AnalyticsSessionExplainPage,
} from '../features/analytics'
import {
  ScenarioAuthoringEditorPage,
  ScenarioAuthoringListPage,
} from '../features/scenario-authoring'
import {
  RiskRuleAuthoringEditorPage,
  RiskRuleAuthoringListPage,
} from '../features/risk-rule-authoring'
import { AuthoringRouteGuard, GovernanceLoginPage } from '../features/governance'
import { ROUTES } from '../config'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <ScenarioHubPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'dashboard/compare', element: <AnalyticsComparePage /> },
      { path: 'dashboard/scenario/:scenarioId', element: <AnalyticsScenarioDrilldownPage /> },
      { path: 'dashboard/flag/:flagId', element: <AnalyticsFlagDrilldownPage /> },
      { path: 'dashboard/rule/:ruleId', element: <AnalyticsRuleDrilldownPage /> },
      { path: 'dashboard/session/:sessionId', element: <AnalyticsSessionExplainPage /> },
      { path: 'admin/login', element: <GovernanceLoginPage /> },
      {
        element: <AuthoringRouteGuard />,
        children: [
          { path: 'authoring', element: <ScenarioAuthoringListPage /> },
          { path: 'authoring/new', element: <ScenarioAuthoringEditorPage /> },
          { path: 'authoring/:scenarioId', element: <ScenarioAuthoringEditorPage /> },
          { path: 'risk-authoring', element: <RiskRuleAuthoringListPage /> },
          { path: 'risk-authoring/new', element: <RiskRuleAuthoringEditorPage /> },
          { path: 'risk-authoring/:ruleId', element: <RiskRuleAuthoringEditorPage /> },
        ],
      },
      { path: 'banking/:scenarioId', element: <BankingFlowPage /> },
      { path: 'wallet/:scenarioId', element: <WalletFlowPage /> },
      { path: 'sessions/:sessionId', element: <SessionReplayPage /> },
      { path: '*', element: <Navigate to={ROUTES.scenarios} replace /> },
    ],
  },
])
