export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';
export type ReviewCategory =
  | 'SECURITY'
  | 'VALIDATION'
  | 'CLEAN_CODE'
  | 'PERFORMANCE'
  | 'BUG_RISK';

export interface ReviewIssueDto {
  severity: Severity;
  category: ReviewCategory;
  message: string;
  suggestion: string;
  filePath?: string;
  line?: number;
}

export interface AIReviewResponse {
  summary: string;
  issues: ReviewIssueDto[];
}
