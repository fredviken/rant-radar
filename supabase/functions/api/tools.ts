import { generateObject, tool } from "npm:ai"
import { z } from "npm:zod/v3"
import { openrouter, model } from "./config.ts"

interface RedditPost {
  kind: string
  data: {
    id: string
    title: string
    subreddit: string
    score: number
    permalink: string
    num_comments: number
    selftext?: string
  }
}

interface RedditComment {
  kind: string
  data: {
    id: string
    body?: string
    score: number
    replies?: RedditListing
  }
}

interface RedditListing {
  kind: string
  data: {
    children: (RedditPost | RedditComment)[]
  }
}

interface ExtractedComment {
  id: string
  body: string
  score: number
  replies: ExtractedComment[]
}

// Helper function to extract comments recursively
function extractComments(commentData: RedditListing | string): ExtractedComment[] {
  const comments: ExtractedComment[] = []
  
  // Reddit sometimes returns empty strings for "more" comments
  if (typeof commentData === 'string' || !commentData?.data?.children) {
    return comments
  }
  
  for (const child of commentData.data.children) {
    if (child.kind === 't1' && 'body' in child.data && child.data.body) {
      const comment = child as RedditComment
      comments.push({
        id: comment.data.id,
        body: comment.data.body || '',
        score: comment.data.score,
        replies: comment.data.replies ? extractComments(comment.data.replies) : []
      })
    }
  }
  
  return comments
}

// Reddit search tool
// In tools.ts, add logging to each tool
export const searchReddit = tool({
  description: 'Search Reddit for posts about a product',
  parameters: z.object({
    query: z.string().describe('Search query'),
    subreddit: z.string().optional().describe('Specific subreddit to search'),
    sort: z.enum(['relevance', 'top', 'new']).default('relevance'),
    timeFilter: z.enum(['day', 'week', 'month', 'year', 'all']).default('month')
  }),
  execute: async ({ query, subreddit, sort, timeFilter }) => {
    console.log('SearchReddit called with:', { query, subreddit, sort, timeFilter })
    
    const searchUrl = subreddit 
      ? `https://www.reddit.com/r/${subreddit}/search.json`
      : `https://www.reddit.com/search.json`
    
    const url = `${searchUrl}?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeFilter}&limit=36`
    console.log('Fetching:', url)
    
    const response = await fetch(url, {
      headers: { 
        'User-Agent': 'RantRadar/1.0 (Deno Edge Function)'
      }
    })
    
    if (!response.ok) {
      console.error('Reddit API error:', response.status)
      throw new Error(`Reddit API error: ${response.status}`)
    }
    
    const data = await response.json() as { data: { children: RedditPost[] } }
    console.log(`Found ${data.data.children.length} posts`)
    
    return data.data.children.map((post) => ({
      id: post.data.id,
      title: post.data.title,
      subreddit: post.data.subreddit,
      score: post.data.score,
      url: `https://reddit.com${post.data.permalink}`,
      numComments: post.data.num_comments,
      selftext: post.data.selftext?.slice(0, 500)
    }))
  }
})

// Get comments tool
export const getComments = tool({
  description: 'Get comments from a Reddit post',
  parameters: z.object({
    postId: z.string(),
    subreddit: z.string()
  }),
  execute: async ({ postId, subreddit }) => {
    console.log('GetComments called for:', { postId, subreddit })
    
    const url = `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=100`
    console.log('Fetching comments:', url)
    
    const response = await fetch(url, { 
      headers: { 
        'User-Agent': 'RantRadar/1.0 (Deno Edge Function)'
      }
    })
    
    if (!response.ok) {
      console.error('Comments API error:', response.status)
      throw new Error(`Reddit API error: ${response.status}`)
    }
    
    const data = await response.json() as [unknown, RedditListing]
    const comments = extractComments(data[1])
    console.log(`Extracted ${comments.length} comments`)
    
    // Flatten and return top comments by score
    const topComments = comments
      .slice(0, 20)
      .map(c => ({
        body: c.body,
        score: c.score
      }))
    
    console.log(`Returning ${topComments.length} top comments`)
    return topComments
  }
})

// Analyze complaint tool
export const analyzeComplaint = tool({
  description: 'Extract and analyze complaints from Reddit content using LLM',
  parameters: z.object({
    content: z.string().describe('Reddit post/comment content'),
    postMetadata: z.object({
      id: z.string(),
      title: z.string(),
      subreddit: z.string(),
      url: z.string()
    })
  }),
  execute: async ({ content, postMetadata }) => {
    console.log('AnalyzeComplaint called for post:', postMetadata.id)
    console.log('Content length:', content.length)
    
    const analysisSchema = z.object({
      hasComplaint: z.boolean(),
      complaints: z.array(z.object({
        issue: z.string(),
        category: z.string().describe('Category of the complaint'),
        excerpt: z.string().max(200)
      }))
    })

    try {
      const analysis = await generateObject({
        model: openrouter(model),
        schema: analysisSchema,
        prompt: `Analyze this Reddit content for complaints/criticism. Extract specific issues:
        
Content: ${content}

Look for: frustrations, complaints, negative comparisons, feature requests born from pain points.
Focus on identifying the core issue and categorizing it appropriately.`
      })
      
      const result = analysis.object as z.infer<typeof analysisSchema>
      console.log('Analysis completed:', {
        hasComplaint: result.hasComplaint,
        complaintsFound: result.complaints.length
      })

      return {
        hasComplaint: result.hasComplaint,
        complaints: result.complaints,
        metadata: postMetadata
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      return {
        hasComplaint: false,
        complaints: [],
        metadata: postMetadata
      }
    }
  }
})

// Export all tools
export const tools = {
  searchReddit,
  getComments,
  analyzeComplaint
}