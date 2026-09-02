-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Create knowledge_sources table
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('pdf', 'notion', 'gsheets')),
    name VARCHAR(255) NOT NULL,
    config JSONB DEFAULT '{}'::jsonb, -- Store notion pages, gsheets URL, or storage path
    status VARCHAR(50) DEFAULT 'syncing' CHECK (status IN ('syncing', 'synced', 'error')),
    last_synced TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create knowledge_embeddings table
CREATE TABLE IF NOT EXISTS public.knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    source_id UUID REFERENCES public.knowledge_sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Text chunk
    embedding vector(1536), -- Assuming OpenAI text-embedding-ada-002 or text-embedding-3-small
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Apply RLS to new tables
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- Helper policies similar to 001_initial_schema
DO $$
DECLARE
    t_name text;
    hotel_tables text[] := ARRAY['knowledge_sources', 'knowledge_embeddings'];
BEGIN
    FOREACH t_name IN ARRAY hotel_tables
    LOOP
        EXECUTE format('CREATE POLICY "%I_super_admin" ON public.%I FOR ALL TO authenticated USING (public.get_user_role() = ''super_admin'');', t_name, t_name);
        EXECUTE format('CREATE POLICY "%I_hotel_staff" ON public.%I FOR ALL TO authenticated USING (hotel_id = public.get_user_hotel_id());', t_name, t_name);
    END LOOP;
END $$;

-- Configure Supabase Storage bucket for PDF uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('knowledge_files', 'knowledge_files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies for 'knowledge_files'
CREATE POLICY "Super admins can access all knowledge files"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'knowledge_files' AND public.get_user_role() = 'super_admin');

-- Assuming files are stored as: `hotel_id/filename.pdf`
CREATE POLICY "Hotel staff can access their hotel knowledge files"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'knowledge_files' 
  AND (storage.foldername(name))[1] = public.get_user_hotel_id()::text
);
