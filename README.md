# Rant Radar

Turn criticism, complaints and rants into constructive feedback.

Rant Radar searches Reddit for complaints about products or services, then uses AI to transform those rants into structured, actionable insights.

## How it works

1. Enter what you want to analyze. It can be a product, service, or anything else.
2. AI searches Reddit for complaints and issues
3. Raw feedback gets transformed into organized insights
4. Get structured results with severity ratings and recommendations

## Tech Stack

**Frontend**
- SvelteKit with TypeScript
- Tailwind CSS for styling
- GSAP for animations

**Backend**
- Supabase for database, realtime and edge functions
- OpenRouter for AI model access
- Reddit API for content search

## Configuration

Add your OpenRouter API key to Supabase environment variables as `OPENROUTER_API_KEY`.
 
You also have to enable realtime subscriptions for the `jobs` table in Supabase.