// Local development server with API endpoints
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Load data from Excel file
function loadExcelData() {
  const excelPath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
  try {
    if (fs.existsSync(excelPath)) {
      const workbook = XLSX.readFile(excelPath);
      const firstSheet = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
      console.log(`Loaded ${data.length} records from Excel file`);
      return data;
    }
  } catch (error) {
    console.error('Error loading Excel file:', error.message);
  }
  // Fallback to empty array if file doesn't exist
  return [];
}

// Initialize in-memory data from Excel file
let inMemoryData = loadExcelData();

// GET /api/excel - Load data
app.get('/api/excel', (req, res) => {
  res.json(inMemoryData);
});

// PUT /api/excel - Save data
app.put('/api/excel', (req, res) => {
  const { data } = req.body;
  if (Array.isArray(data)) {
    inMemoryData = data;
    res.json({ success: true, message: 'Data saved' });
  } else {
    res.status(400).json({ success: false, message: 'Invalid data format' });
  }
});

// GET /api/health - Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve Angular app in production mode
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, 'dist/transport-app/browser');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/api/excel`);
  console.log(`  PUT  http://localhost:${PORT}/api/excel`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
});
