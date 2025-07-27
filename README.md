# Rant Radar

Turn criticism, complaints and rants into constructive feedback.

Rant Radar searches Reddit for complaints about products or services, then uses AI to transform those rants into structured, actionable insights.

## How it works

1. Enter what you want to analyze. It can be a product, service, or anything else.
2. AI searches Reddit for complaints and issues
3. Raw feedback gets transformed into organized insights

## Tech Stack

**Frontend**
- SvelteKit with TypeScript
- Tailwind CSS for styling
- GSAP for animations

**Backend**
- Supabase for database, realtime and edge functions
- OpenRouter for AI model access
- Reddit API for content search

## Getting Started

Prerequisites:
- Node.js installed
- Supabase CLI installed
- OpenRouter API key (get one at openrouter.ai)

```bash
pnpm install
```

Add environment variables (you can copy the `.env.example` files):
- `.env` - Add your Supabase url and anon key for the frontend
- `supabase/functions/.env` - Add `OPENROUTER_API_KEY=your_key_here`

```bash
supabase start
supabase functions serve
pnpm dev
```

Enable realtime for the `jobs` table in your Supabase dashboard.