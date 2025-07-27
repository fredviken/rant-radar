import { z } from "npm:zod/v3"

export const ComplaintSchema = z.object({
  issue: z.string().describe('The core complaint/issue'),
  category: z.string().describe('Category of the complaint (e.g., UX, Performance, Security, etc.)'),
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
  summary: z.string().describe('Executive summary of main pain points')
})

export type ComplaintAnalysis = z.infer<typeof AnalysisResultSchema>