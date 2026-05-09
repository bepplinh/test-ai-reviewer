export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AIReviewIssue {
  severity: SeverityLevel;
  type: string;
  message: string;
  suggestion: string;
  filePath: string | null;
  line: number | null;
}

export interface AIReviewResponse {
  summary: string;
  issues: AIReviewIssue[];
}
