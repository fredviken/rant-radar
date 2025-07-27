export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobSource {
  postId: string;
  postTitle: string;
  subreddit: string;
  url: string;
  excerpt: string;
}

export interface Complaint {
  issue: string;
  frequency: number;
  category: string;
  constructiveFeedback: string;
  sources: JobSource[];
}

export interface AnalysisResult {
  product: string;
  totalPostsAnalyzed: number;
  complaints: Complaint[];
  summary: string;
  recommendedActions: string[];
}

export interface Job {
  id: string;
  query: string;
  status: JobStatus;
  created_at: string;
  result?: AnalysisResult;
  error_message?: string;
}

export interface ApiResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}