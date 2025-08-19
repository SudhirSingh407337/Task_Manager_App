// Supabase Configuration
// Replace these with your actual Supabase project credentials
// You can get these from your Supabase dashboard at https://supabase.com/dashboard

const SUPABASE_CONFIG = {
    // Your Supabase project URL
    url: 'https://mpdszduuqifekoomyhcn.supabase.co',
    
    // Your Supabase anon/public key - PASTE YOUR COPIED KEY HERE
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZHN6ZHV1cWlmZWtvb215aGNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5ODI3MzgsImV4cCI6MjA2OTU1ODczOH0.2_XdyVdt_1tmeAc0nIi-2A7z-2fvRRfIyL3spnOVqoI',
};

// Instructions to set up Supabase:
/*
1. Go to https://supabase.com/dashboard
2. Create a new project
3. Go to Settings > API
4. Copy your Project URL and anon/public key
5. Replace the values above
6. Create the tasks table using the SQL below:

CREATE TABLE tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    completed BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can insert their own tasks" ON tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON tasks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" ON tasks
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
*/
