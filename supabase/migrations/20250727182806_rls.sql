-- Enable RLS on jobs table
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to SELECT from jobs table
CREATE POLICY "Allow public read access on jobs" ON jobs
    FOR SELECT
    USING (true);
