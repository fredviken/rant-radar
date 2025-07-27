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
import { supabase } from "./database.ts";

// Background job function
async function runAnalysis(jobId: string, query: string) {
  try {
    console.log(`Starting analysis for job ${jobId}, query: ${query}`)
    
    // Update status to processing
    await supabase
      .from('jobs')
      .update({ status: 'processing' })
      .eq('id', jobId)

    // Phase 1: Search Reddit
    const { text: agentFindings } = await generateText({
      model: openrouter(model),
      tools: { searchReddit: tools.searchReddit },
      toolChoice: "auto",
      system: `You are a rant-finding agent for "Rant Radar - Enlightened by Hate". Search Reddit comprehensively for complaints, criticisms, and negative experiences about products. Be thorough and capture specific issues with their sources.`,
      prompt: `Find complaints and criticisms about "${query}". Search for "${query} problems", "${query} sucks", "${query} issues", etc. For each complaint you find, note:
      - The specific issue/complaint
      - The Reddit post title and URL
      - Severity of the frustration
      - Which aspect it relates to (UX, Performance, Pricing, etc.)
      
      Provide a detailed summary with all the specific complaints and their source URLs.`,
      maxSteps: 32,
    });

    // Phase 2: Transform rants into constructive feedback
    const structuredAnalysis = await generateObject({
      model: openrouter(model),
      schema: AnalysisResultSchema,
      prompt: `Transform the Reddit complaints about ${query} into structured JSON feedback.

Reddit Findings:
${agentFindings}

Create a JSON object with EXACTLY this structure:

{
  "product": "${query}",
  "totalPostsAnalyzed": <number>,
  "complaints": [
    {
      "issue": "<specific problem>",
      "category": "<descriptive category name>",
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
  "summary": "<executive summary of main pain points>"
}

Include 3-7 complaints maximum. Focus on the most common and severe issues with proper source attribution.`,
    });

    // Save successful result
    await supabase
      .from('jobs')
      .update({ 
        status: 'completed',
        result: structuredAnalysis.object 
      })
      .eq('id', jobId)

    console.log(`Analysis completed for job ${jobId}`)
  } catch (error) {
    console.error(`Analysis failed for job ${jobId}:`, error)
    
    // Save error
    await supabase
      .from('jobs')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', jobId)
  }
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { query } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }) 
    }

    // Create job record
    const { data: job, error } = await supabase
      .from('jobs')
      .insert({ query })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`)
    }

    // Start background processing (don't await!)
    // @ts-ignore - 
    EdgeRuntime.waitUntil(runAnalysis(job.id, query));

    // Return job ID immediately
    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        status: 'pending'
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error in API:", error);

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
