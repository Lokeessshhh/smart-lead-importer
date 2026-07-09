import express from 'express';
import cors from 'cors';
import multer from 'multer';
import Papa from 'papaparse';
import { extractBatch } from './services/extractService.js';

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configure Multer for in-memory CSV file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // limit to 50MB as per spec
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed.'));
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

/**
 * Endpoint: POST /api/upload
 * Accepts a CSV file, parses it, and returns headers and raw rows.
 * Used for client preview (Step 2) if they want to run it through backend.
 */
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const csvContent = req.file.buffer.toString('utf-8');
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        res.json({
          filename: req.file.originalname,
          size: req.file.size,
          headers: results.meta.fields || [],
          rows: results.data || []
        });
      },
      error: (err) => {
        console.error('PapaParse error:', err);
        res.status(400).json({ error: `Failed to parse CSV: ${err.message}` });
      }
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ error: `Internal server error: ${error.message}` });
  }
});

/**
 * Endpoint: POST /api/extract
 * Accepts a batch of raw rows and headers, runs AI extraction, and returns structured records.
 */
app.post('/api/extract', async (req, res) => {
  const { headers, rows } = req.body;

  if (!headers || !rows) {
    return res.status(400).json({ error: 'Missing headers or rows in request body.' });
  }

  try {
    const mappedRecords = await extractBatch(headers, rows);
    res.json({ records: mappedRecords });
  } catch (error) {
    console.error('Extraction endpoint error:', error);
    res.status(500).json({ error: `AI Extraction failed: ${error.message}` });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err);
  res.status(400).json({ error: err.message || 'An unexpected error occurred.' });
});

app.listen(port, () => {
  console.log(`[Server] GrowEasy CSV Importer Backend running on port ${port}`);
});
