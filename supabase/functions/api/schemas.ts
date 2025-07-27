import { z } from "npm:zod/v3"

export const ComplaintSchema = z.object({
  issue: z.string().describe('The core complaint/issue'),
  frequency: z.number().describe('How often this complaint appears'),
  category: z.string().describe('Category of the complaint (e.g., UX, Performance, Security, etc.)'),
  constructiveFeedback: z.string().describe('Reformulated as constructive feedback'),
  sources: z.array(z.object({
    postId: z.string(),
    postTitle: z.string(),
    subreddit: z.string(),
    url: z.string(),
    excerpt: z.string().describe('Relevant quote from the source')
  }))
})

export const AnalysisResultSchema = z.object({
  product: z.string(),
  totalPostsAnalyzed: z.number(),
  complaints: z.array(ComplaintSchema),
  summary: z.string().describe('Executive summary of main pain points'),
  recommendedActions: z.array(z.string()).describe('Top 3-5 actionable improvements')
})

export type ComplaintAnalysis = z.infer<typeof AnalysisResultSchema>