const { McpServer } = require('@mcp-framework/server');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const multer = require('multer');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const libre = require('libreoffice-convert');

// Promisify the libre conversion function
const libreConvert = promisify(libre.convert);

// Create temp and output directories if they don't exist
const tempDir = path.join(__dirname, '../tmp');
const outputDir = path.join(__dirname, '../output');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Create Express app
const app = express();
app.use(express.json());

// Initialize MCP server
const server = new McpServer({
  title: 'Excel to PDF Converter',
  description: 'An MCP server that converts Excel (.xls/.xlsx) and Apple Numbers (.numbers) files to PDF',
  version: '1.0.0',
  baseUrl: process.env.MCP_BASE_URL || 'http://localhost:3000',
  resources: [
    {
      name: 'excel-to-pdf',
      description: 'Convert Excel files (.xls, .xlsx) to PDF',
      inputs: {
        file: {
          type: 'file',
          required: true,
          description: 'The Excel file to convert'
        }
      },
      outputs: {
        pdf: {
          type: 'file',
          description: 'The converted PDF file'
        }
      }
    },
    {
      name: 'numbers-to-pdf',
      description: 'Convert Apple Numbers files (.numbers) to PDF',
      inputs: {
        file: {
          type: 'file',
          required: true,
          description: 'The Numbers file to convert'
        }
      },
      outputs: {
        pdf: {
          type: 'file',
          description: 'The converted PDF file'
        }
      }
    }
  ]
});

// Mount MCP server on Express
app.use(server.middleware());

// Implement Excel to PDF conversion
app.post('/convert/excel-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(outputDir, `${path.basename(inputPath, path.extname(inputPath))}.pdf`);
    
    // Check file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return res.status(400).json({ error: 'Invalid file format. Only .xlsx and .xls files are supported.' });
    }

    // Using libreoffice-convert for the conversion
    const file = fs.readFileSync(inputPath);
    const pdfBuffer = await libreConvert(file, '.pdf', undefined);
    
    // Write the PDF to the output directory
    fs.writeFileSync(outputPath, pdfBuffer);
    
    // Clean up temp file
    fs.unlinkSync(inputPath);
    
    // Return the PDF file path
    return res.json({ 
      success: true, 
      filePath: outputPath,
      message: 'Excel file successfully converted to PDF'
    });
  } catch (error) {
    console.error('Error converting Excel to PDF:', error);
    return res.status(500).json({ error: 'Error converting Excel to PDF', details: error.message });
  }
});

// Implement Numbers to PDF conversion
app.post('/convert/numbers-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const inputPath = req.file.path;
    const outputPath = path.join(outputDir, `${path.basename(inputPath, path.extname(inputPath))}.pdf`);
    
    // Check file extension
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext !== '.numbers') {
      return res.status(400).json({ error: 'Invalid file format. Only .numbers files are supported.' });
    }

    // Numbers files are actually ZIP files containing XML and other resources
    // For simplicity, we'll use libreoffice-convert as it can handle Numbers files
    const file = fs.readFileSync(inputPath);
    const pdfBuffer = await libreConvert(file, '.pdf', undefined);
    
    // Write the PDF to the output directory
    fs.writeFileSync(outputPath, pdfBuffer);
    
    // Clean up temp file
    fs.unlinkSync(inputPath);
    
    // Return the PDF file path
    return res.json({ 
      success: true, 
      filePath: outputPath,
      message: 'Numbers file successfully converted to PDF'
    });
  } catch (error) {
    console.error('Error converting Numbers to PDF:', error);
    return res.status(500).json({ error: 'Error converting Numbers to PDF', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Excel to PDF MCP server running on http://localhost:${PORT}`);
  console.log(`MCP documentation available at http://localhost:${PORT}/mcp`);
});

module.exports = app;
