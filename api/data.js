// Vercel KV Database for Transport App
// Uses Redis on Vercel, falls back to in-memory for local development

const DATA_KEY = 'transport-data';

// Try to use Vercel KV if available
let kv;
try {
  kv = require('@vercel/kv');
} catch (e) {
  // KV not available (local development)
  kv = null;
}

// In-memory storage for local development
let memoryStore = [
  { LOCATION: 'Sample Location 1', PHONE: '123-456-7890', CONTACT: 'John Doe' },
  { LOCATION: 'Sample Location 2', PHONE: '098-765-4321', CONTACT: 'Jane Smith' }
];

export async function getData() {
  if (kv) {
    try {
      const data = await kv.get(DATA_KEY);
      return data || null;
    } catch (error) {
      console.error('Error getting data from KV:', error);
      return null;
    }
  } else {
    // Local development - return in-memory data
    return memoryStore;
  }
}

export async function setData(data) {
  if (kv) {
    try {
      await kv.set(DATA_KEY, data);
      return true;
    } catch (error) {
      console.error('Error saving data to KV:', error);
      return false;
    }
  } else {
    // Local development - save to in-memory store
    memoryStore = data;
    return true;
  }
}

export { DATA_KEY };
