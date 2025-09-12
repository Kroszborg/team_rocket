import { SCORE_THRESHOLDS, SCORE_COLORS, SCORE_LABELS } from '@/components/creative-tester/constants';

export const getScoreColor = (score: number): string => {
  if (score >= SCORE_THRESHOLDS.excellent) return SCORE_COLORS.excellent;
  if (score >= SCORE_THRESHOLDS.good) return SCORE_COLORS.good;
  return SCORE_COLORS.poor;
};

export const getScoreLabel = (score: number): string => {
  if (score >= SCORE_THRESHOLDS.excellent) return SCORE_LABELS.excellent;
  if (score >= SCORE_THRESHOLDS.good) return SCORE_LABELS.good;
  if (score >= SCORE_THRESHOLDS.fair) return SCORE_LABELS.fair;
  return SCORE_LABELS.poor;
};

export const getScoreVariant = (score: number): "default" | "secondary" | "destructive" => {
  if (score >= SCORE_THRESHOLDS.excellent) return "default";
  if (score >= SCORE_THRESHOLDS.good) return "secondary";
  return "destructive";
};