const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'src/assets/Data');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Created directory:', uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'DataTransportsFile-updated.xlsx');
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Upload endpoint - saves the Excel file
app.post('/api/upload-excel', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.error('No file received in upload');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  console.log('File saved to:', req.file.path);
  res.json({ success: true, message: 'File uploaded successfully' });
});

// Get Excel file
app.get('/api/excel', (req, res) => {
  const filePath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// Check if Excel file exists
app.get('/api/excel/exists', (req, res) => {
  const filePath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
  res.json({ exists: fs.existsSync(filePath), path: filePath });
});

// Update Excel file
app.put('/api/excel', (req, res) => {
  try {
    const { data } = req.body;
    
    if (!data) {
      console.error('No data received in update request');
      return res.status(400).json({ error: 'No data provided' });
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(data, 'base64');
    const filePath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
    
    // Ensure directory exists
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    // Write file synchronously to ensure completion
    fs.writeFileSync(filePath, buffer);
    
    console.log('Excel file updated successfully at:', filePath);
    res.json({ success: true, message: 'File updated successfully' });
  } catch (error) {
    console.error('Error updating Excel file:', error);
    res.status(500).json({ error: 'Failed to update file', details: error.message });
  }
});

// Serve static files from Angular build (dist/browser folder)
const distPath = path.join(__dirname, 'dist/browser');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  
  // Serve the Excel file
  app.get('/assets/Data/DataTransportsFile-updated.xlsx', (req, res) => {
    const filePath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  // Fallback to index.html for Angular routes (Express 5 compatible)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Development mode - Angular runs on different port
  app.get('/assets/Data/DataTransportsFile-updated.xlsx', (req, res) => {
    const filePath = path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx');
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Transport API Server',
      status: 'running',
      note: 'Build Angular app with "npm run build" and restart server for full functionality',
      distExists: fs.existsSync(distPath)
    });
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Excel file path: ${path.join(__dirname, 'src/assets/Data/DataTransportsFile-updated.xlsx')}`);
  console.log(`========================================`);
});
