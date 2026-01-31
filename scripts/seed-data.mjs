// Script to seed Vercel KV with initial data from Excel file
// Run: node scripts/seed-data.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to use Vercel KV if available
let kv;
try {
  kv = require('@vercel/kv');
} catch (e) {
  console.log('Vercel KV not available - using in-memory fallback');
  kv = null;
}

const DATA_KEY = 'transport-data';

async function loadExcelData() {
  const excelPath = path.join(__dirname, '../src/assets/Data/DataTransportsFile-updated.xlsx');
  try {
    if (fs.existsSync(excelPath)) {
      // Dynamic import for xlsx
      const XLSX = await import('xlsx');
      const workbook = XLSX.readFile(excelPath);
      const firstSheet = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
      console.log(`Loaded ${data.length} records from Excel file`);
      return data;
    }
  } catch (error) {
    console.error('Error loading Excel file:', error.message);
  }
  return [];
}

async function seedData() {
  const data = await loadExcelData();

  if (data.length === 0) {
    console.log('No data to seed');
    return;
  }

  if (kv) {
    try {
      await kv.set(DATA_KEY, data);
      console.log(`Seeded ${data.length} records to Vercel KV`);
    } catch (error) {
      console.error('Error seeding to KV:', error.message);
    }
  } else {
    console.log('In-memory mode - data would be seeded to:', DATA_KEY);
    console.log('Data:', JSON.stringify(data.slice(0, 3), null, 2), '...');
  }
}

seedData();
