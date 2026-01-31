// Supabase Database for Transport App
// Free tier: 500MB database

const DATA_KEY = 'transport-data';

// Try to use Supabase if configured
let supabase;
try {
  supabase = require('@supabase/supabase-js');
} catch (e) {
  supabase = null;
}

// Supabase config (set these in Vercel environment variables)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// In-memory storage for local development (fallback)
let memoryStore = [
  { LOCATION: 'Sample Location 1', PHONE: '123-456-7890', CONTACT: 'John Doe' },
  { LOCATION: 'Sample Location 2', PHONE: '098-765-4321', CONTACT: 'Jane Smith' }
];

let supabaseClient = null;

if (supabase && SUPABASE_URL && SUPABASE_KEY) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Using Supabase for data storage');
}

export async function getData() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('app_data')
        .select('data')
        .eq('key', DATA_KEY)
        .single();
      
      if (error) {
        console.error('Supabase error:', error.message);
        return null;
      }
      
      if (data && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting data from Supabase:', error);
      return null;
    }
  } else {
    // Local development - return in-memory data
    return memoryStore;
  }
}

export async function setData(data) {
  if (supabaseClient) {
    try {
      // Upsert - update if exists, insert if not
      const { error } = await supabaseClient
        .from('app_data')
        .upsert({ key: DATA_KEY, data: data, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('Supabase error:', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error saving data to Supabase:', error);
      return false;
    }
  } else {
    // Local development - save to in-memory store
    memoryStore = data;
    return true;
  }
}

export { DATA_KEY };
