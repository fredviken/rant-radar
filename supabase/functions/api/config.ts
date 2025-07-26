import { createOpenRouter } from "npm:@openrouter/ai-sdk-provider";

export const model = "openai/gpt-4.1-mini";

export const openrouter = createOpenRouter({
  apiKey: Deno.env.get("OPENROUTER_API_KEY"),
});

// CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}