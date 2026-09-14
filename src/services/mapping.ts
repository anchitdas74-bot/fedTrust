import type { RiskAction, SHAPContribution } from '../types';

/** Backend scores are 0-1 fractions; the UI displays 0-100 percentages. */
export function toPercent(value: number | null | undefined): number {
  return Math.round((value ?? 0) * 100);
}

/** Maps backend `Decision`/`action` values ("approved" | "step_up_verification" | "blocked") to the UI's RiskAction labels. */
export function mapDecisionToAction(decision: string | null | undefined): RiskAction {
  switch (decision) {
    case 'approved':
      return 'Approve';
    case 'step_up_verification':
      return 'Step-Up Verification';
    case 'blocked':
      return 'Block';
    default:
      return 'Approve';
  }
}

interface BackendFeatureExplanation {
  feature: string;
  impact: number;
  direction: 'raises_risk' | 'lowers_risk';
  message: string;
}

/** Maps the backend's FeatureExplanation list to the UI's SHAPContribution shape. */
export function mapShapExplanations(explanations: BackendFeatureExplanation[] | null | undefined): SHAPContribution[] {
  return (explanations ?? []).map((item) => ({
    feature: item.feature.replace(/_/g, ' '),
    displayValue: item.message,
    contribution: item.direction === 'raises_risk' ? toPercent(item.impact) : -toPercent(item.impact),
    isPositive: item.direction === 'raises_risk',
  }));
}
