/**
 * Example of using the Excel to PDF MCP server directly via API calls
 * 
 * Usage:
 * 1. Start the server: npx excel-to-pdf-mcp
 * 2. Run this script with an Excel file: node convert-excel.js path/to/file.xlsx
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.error('Please provide a file path as an argument');
  process.exit(1);
}

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

// Check file extension
const fileExt = path.extname(filePath).toLowerCase();
let endpoint;

if (fileExt === '.xlsx' || fileExt === '.xls') {
  endpoint = 'excel-to-pdf';
} else if (fileExt === '.numbers') {
  endpoint = 'numbers-to-pdf';
} else {
  console.error(`Unsupported file format: ${fileExt}`);
  process.exit(1);
}

// Convert the file
async function convertToPdf() {
  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await fetch(`http://localhost:3000/convert/${endpoint}`, {
      method: 'POST',
      body: form
    });

    const result = await response.json();

    if (result.error) {
      console.error(`Error: ${result.error}`);
      if (result.details) {
        console.error(`Details: ${result.details}`);
      }
      process.exit(1);
    }

    console.log(`Success! File converted to PDF: ${result.filePath}`);
    console.log(`Message: ${result.message}`);
  } catch (error) {
    console.error('Error converting file:', error.message);
    process.exit(1);
  }
}

console.log(`Converting ${filePath} to PDF...`);
convertToPdf();
