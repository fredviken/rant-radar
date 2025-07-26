// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import { createOpenRouter } from "npm:@openrouter/ai-sdk-provider";
import { generateObject, generateText } from "npm:ai";
import { corsHeaders, openrouter, model } from "./config.ts";
import { tools } from "./tools.ts";
import { AnalysisResultSchema } from "./schemas.ts";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    // const { product } = body;

    const product = "sendgrid";

    // if (!product) {
    //   throw new Error("Product parameter is required");
    // }

    // Simple test: Just search Reddit first
    console.log('🚀 Starting Reddit search for:', product)
    
    const { text: agentFindings } = await generateText({
      model: openrouter(model),
      tools: { searchReddit: tools.searchReddit }, // Only use search tool first
      toolChoice: "auto", // Changed from "required" to "auto"
      system: `You are a rant-finding agent for "Rant Radar - Enlightened by Hate". Search Reddit comprehensively for complaints, criticisms, and negative experiences about products. Be thorough and capture specific issues with their sources.`,
      prompt: `Find complaints and criticisms about "${product}". Search for "${product} problems", "${product} sucks", "${product} issues", etc. For each complaint you find, note:
      - The specific issue/complaint
      - The Reddit post title and URL
      - Severity of the frustration
      - Which aspect it relates to (UX, Performance, Pricing, etc.)
      
      Provide a detailed summary with all the specific complaints and their source URLs.`,
      maxSteps: 5, // Increased to allow for tool use + text generation
    });
    
    console.log('📊 Agent findings:', agentFindings)

    // Phase 2: Transform rants into constructive feedback
    console.log('🔄 Transforming rants into constructive feedback...')
    const structuredAnalysis = await generateObject({
      model: openrouter(model),
      schema: AnalysisResultSchema,
      prompt: `Transform the Reddit complaints about ${product} into structured JSON feedback.

Reddit Findings:
${agentFindings}

Create a JSON object with EXACTLY this structure:

{
  "product": "${product}",
  "totalPostsAnalyzed": <number>,
  "complaints": [
    {
      "issue": "<specific problem>",
      "severity": <1-10>,
      "frequency": <number>,
      "category": "<descriptive category name>",
      "constructiveFeedback": "<actionable improvement suggestion>",
      "sources": [
        {
          "postId": "<reddit post id>",
          "postTitle": "<post title>",
          "subreddit": "<subreddit name>",
          "url": "<full reddit url>",
          "excerpt": "<relevant quote>"
        }
      ]
    }
  ],
  "summary": "<executive summary of main pain points>",
  "recommendedActions": ["<action 1>", "<action 2>", "<action 3>"]
}

Include 3-5 complaints maximum. Focus on the most severe issues with proper source attribution.`,
    });

    return new Response(
      JSON.stringify(
        {
          success: true,
          data: structuredAnalysis.object,
          metadata: {
            analyzedAt: new Date().toISOString(),
            agentFindings: agentFindings // Keep raw findings for debugging
          },
        },
        null,
        2,
      ),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error in find-critiques:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/api' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
