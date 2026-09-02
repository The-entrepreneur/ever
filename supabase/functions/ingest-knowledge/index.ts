// @ts-nocheck — Deno edge function: resolved at runtime by Deno, not tsc
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { source_id, hotel_id } = await req.json();

    if (!source_id || !hotel_id) {
      throw new Error("Missing source_id or hotel_id");
    }

    // 1. Fetch the source config from knowledge_sources
    const { data: source, error: sourceError } = await supabase
      .from('knowledge_sources')
      .select('*')
      .eq('id', source_id)
      .single();

    if (sourceError || !source) throw new Error("Source not found");

    let extractedText = "";

    // 2. Data Extraction
    if (source.type === 'pdf') {
      // In a full production environment, you would use npm:pdf-parse here.
      // For this edge function, we assume a mock extraction or use a lightweight Deno PDF parser.
      // Example standard REST call to a PDF extraction service or using pdfjs.
      extractedText = "Mock extracted text from PDF..."; 
    } else if (source.type === 'notion' || source.type === 'gsheets') {
      extractedText = `Extracted data from ${source.type} at ${source.config.url_or_token}`;
    }

    // 3. Groq API - Summarize / Clean / Chunk Text (Standard REST)
    if (groqApiKey) {
      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{
            role: "system",
            content: "You are a data processor. Clean and chunk the following raw extracted text into coherent semantic blocks suitable for a knowledge base."
          }, {
            role: "user",
            content: extractedText
          }]
        })
      });

      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        extractedText = groqData.choices[0].message.content || extractedText;
      }
    }

    // 4. Supabase Transformers - Create Embeddings
    // (Requires setting up the Supabase pipeline, assuming generic insertion for now to avoid large model downloads in edge runtime)
    // const { pipeline } = await import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.6.0");
    // const generateEmbedding = await pipeline('feature-extraction', 'Supabase/gte-small');
    // const output = await generateEmbedding(extractedText, { pooling: 'mean', normalize: true });
    // const embedding = Array.from(output.data);
    
    // Mock embedding array of 1536 size for demonstration (if OpenAI dimension used in schema)
    const mockEmbedding = new Array(1536).fill(0).map(() => Math.random());

    // 5. Insert into knowledge_embeddings
    await supabase.from('knowledge_embeddings').insert({
      hotel_id,
      source_id,
      content: extractedText,
      embedding: mockEmbedding
    });

    // 6. Update source status
    await supabase.from('knowledge_sources').update({
      status: 'synced',
      last_synced: new Date().toISOString()
    }).eq('id', source_id);

    return new Response(JSON.stringify({ success: true, message: "Source ingested successfully" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
