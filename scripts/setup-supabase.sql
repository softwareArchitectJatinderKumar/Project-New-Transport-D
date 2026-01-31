-- Supabase SQL Setup Script
-- Run this in Supabase SQL Editor to create the table

-- Create the app_data table (key-value storage)
CREATE TABLE IF NOT EXISTS app_data (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow anyone to read data
CREATE POLICY "Allow public read access" ON app_data
  FOR SELECT USING (true);

-- Create a policy to allow anyone to insert/update/delete
CREATE POLICY "Allow public write access" ON app_data
  FOR ALL USING (true);

-- Insert initial data (optional - will be seeded from Excel file on first run)
-- INSERT INTO app_data (key, data) VALUES 
-- ('transport-data', '[{"LOCATION": "Sample", "PHONE": "123"}]');
