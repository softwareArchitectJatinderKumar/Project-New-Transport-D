// Local development server with API endpoints
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Try to use Supabase if configured
let supabase = null;
try {
  const { createClient } = await import('@supabase/supabase-js');
  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
  
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Using Supabase for data storage');
  }
} catch (e) {
  console.log('Supabase not available - using in-memory storage');
}

// In-memory storage for local development (fallback)
let memoryStore = [
  { LOCATION: 'Sample Location 1', PHONE: '123-456-7890', CONTACT: 'John Doe' },
  { LOCATION: 'Sample Location 2', PHONE: '098-765-4321', CONTACT: 'Jane Smith' }
];

const DATA_KEY = 'transport-data';

// Load data from Excel file
async function loadExcelData() {
  const excelPath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
  try {
    if (fs.existsSync(excelPath)) {
      const XLSX = (await import('xlsx')).default;
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

// Initialize data
async function initializeData() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('key', DATA_KEY)
        .single();
      
      if (error || !data) {
        // No data in Supabase, load from Excel and seed
        const excelData = await loadExcelData();
        if (excelData.length > 0) {
          await supabase
            .from('app_data')
            .upsert({ key: DATA_KEY, data: excelData });
          console.log(`Seeded ${excelData.length} records to Supabase`);
        }
      } else {
        console.log('Loaded data from Supabase');
      }
    } catch (error) {
      console.error('Error initializing Supabase data:', error);
    }
  } else {
    // Use Excel data for in-memory
    memoryStore = await loadExcelData();
    if (memoryStore.length > 0) {
      console.log(`Loaded ${memoryStore.length} records from Excel file (in-memory)`);
    }
  }
}

// GET /api/excel - Load data
app.get('/api/excel', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('key', DATA_KEY)
        .single();
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json(data?.data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.json(memoryStore);
  }
});

// PUT /api/excel - Save data
app.put('/api/excel', async (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ success: false, message: 'Invalid data format' });
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('app_data')
        .upsert({ key: DATA_KEY, data: data, updated_at: new Date().toISOString() });
      
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      res.json({ success: true, message: 'Data saved to Supabase' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    memoryStore = data;
    res.json({ success: true, message: 'Data saved (in-memory)' });
  }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storage: supabase ? 'Supabase' : 'in-memory' });
});

// Initialize and start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Local server running at http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET  http://localhost:${PORT}/api/excel`);
    console.log(`  PUT  http://localhost:${PORT}/api/excel`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
  });
});

// Local development server with API endpoints
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Try to use Supabase if configured
let supabase = null;
try {
  const { createClient } = require('@supabase/supabase-js');
  const SUPABASE_URL = process.env.SUPABASE_URL || '';
  const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
  
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('Using Supabase for data storage');
  }
} catch (e) {
  console.log('Supabase not available - using in-memory storage');
}

// In-memory storage for local development (fallback)
let memoryStore = [
  { LOCATION: 'Sample Location 1', PHONE: '123-456-7890', CONTACT: 'John Doe' },
  { LOCATION: 'Sample Location 2', PHONE: '098-765-4321', CONTACT: 'Jane Smith' }
];

const DATA_KEY = 'transport-data';

// Load data from Excel file
function loadExcelData() {
  const excelPath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
  try {
    if (fs.existsSync(excelPath)) {
      const XLSX = require('xlsx');
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

// Initialize data
async function initializeData() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('key', DATA_KEY)
        .single();
      
      if (error || !data) {
        // No data in Supabase, load from Excel and seed
        const excelData = loadExcelData();
        if (excelData.length > 0) {
          await supabase
            .from('app_data')
            .upsert({ key: DATA_KEY, data: excelData });
          console.log(`Seeded ${excelData.length} records to Supabase`);
        }
      } else {
        console.log('Loaded data from Supabase');
      }
    } catch (error) {
      console.error('Error initializing Supabase data:', error);
    }
  } else {
    // Use Excel data for in-memory
    memoryStore = loadExcelData();
    if (memoryStore.length > 0) {
      console.log(`Loaded ${memoryStore.length} records from Excel file (in-memory)`);
    }
  }
}

// GET /api/excel - Load data
app.get('/api/excel', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('key', DATA_KEY)
        .single();
      
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      res.json(data?.data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.json(memoryStore);
  }
});

// PUT /api/excel - Save data
app.put('/api/excel', async (req, res) => {
  const { data } = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ success: false, message: 'Invalid data format' });
  }

  if (supabase) {
    try {
      const { error } = await supabase
        .from('app_data')
        .upsert({ key: DATA_KEY, data: data, updated_at: new Date().toISOString() });
      
      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }
      res.json({ success: true, message: 'Data saved to Supabase' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } else {
    memoryStore = data;
    res.json({ success: true, message: 'Data saved (in-memory)' });
  }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storage: supabase ? 'Supabase' : 'in-memory' });
});

// Initialize and start server
initializeData().then(() => {
  app.listen(PORT, () => {
    console.log(`Local server running at http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  GET  http://localhost:${PORT}/api/excel`);
    console.log(`  PUT  http://localhost:${PORT}/api/excel`);
    console.log(`  GET  http://localhost:${PORT}/api/health`);
  });
});
