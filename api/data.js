// Supabase Database for Transport App
// Free tier: 500MB database

const DATA_KEY = 'transport-data';

// Try to use Supabase if configured
let supabase = null;
let supabaseClient = null;

// Supabase config (set these in Vercel environment variables)
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// In-memory storage for local development (fallback)
let memoryStore = [
  { LOCATION: 'Sample Location 1', PHONE: '123-456-7890', CONTACT: 'John Doe' },
  { LOCATION: 'Sample Location 2', PHONE: '098-765-4321', CONTACT: 'Jane Smith' }
];

// Initialize Supabase
function initSupabase() {
  if (supabaseClient) return supabaseClient;
  
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('Supabase not configured - using in-memory storage');
    return null;
  }
  
  try {
    // Dynamic import to avoid build issues
    const createClientModule = require('@supabase/supabase-js');
    if (createClientModule && createClientModule.createClient) {
      supabaseClient = createClientModule.createClient(SUPABASE_URL, SUPABASE_KEY);
      console.log('Supabase client initialized');
      return supabaseClient;
    }
  } catch (error) {
    console.error('Failed to initialize Supabase:', error.message);
  }
  
  return null;
}

export async function getData() {
  const client = initSupabase();
  
  if (client) {
    try {
      const { data, error } = await client
        .from('app_data')
        .select('data')
        .eq('key', DATA_KEY)
        .single();
      
      if (error) {
        console.error('Supabase error:', error.message);
        // Fall back to in-memory
        return memoryStore;
      }
      
      if (data && data.data) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting data from Supabase:', error);
      // Fall back to in-memory
      return memoryStore;
    }
  } else {
    // Local development - return in-memory data
    return memoryStore;
  }
}

export async function setData(data) {
  const client = initSupabase();
  
  if (client) {
    try {
      // Upsert - update if exists, insert if not
      const { error } = await client
        .from('app_data')
        .upsert({ key: DATA_KEY, data: data, updated_at: new Date().toISOString() });
      
      if (error) {
        console.error('Supabase error:', error.message);
        // Still save to in-memory as fallback
        memoryStore = data;
        return true;
      }
      return true;
    } catch (error) {
      console.error('Error saving data to Supabase:', error);
      // Fall back to in-memory
      memoryStore = data;
      return true;
    }
  } else {
    // Local development - save to in-memory store
    memoryStore = data;
    return true;
  }
}

export { DATA_KEY };
