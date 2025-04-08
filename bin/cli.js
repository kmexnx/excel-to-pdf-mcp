#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const pkg = require('../package.json');

// Define the program
program
  .name('excel-to-pdf-mcp')
  .description('MCP server for converting Excel and Numbers files to PDF')
  .version(pkg.version)
  .option('-p, --port <port>', 'Port to run the server on', '3000')
  .option('-h, --host <host>', 'Host to bind the server to', 'localhost')
  .option('--base-url <url>', 'Base URL for the MCP server', '')
  .parse(process.argv);

const options = program.opts();

// Set environment variables
process.env.PORT = options.port;
if (options.baseUrl) {
  process.env.MCP_BASE_URL = options.baseUrl;
} else {
  process.env.MCP_BASE_URL = `http://${options.host}:${options.port}`;
}

console.log(`Starting Excel to PDF MCP server...`);
console.log(`Version: ${pkg.version}`);
console.log(`Server will be available at: ${process.env.MCP_BASE_URL}`);

// Check if LibreOffice is installed
const checkLibreOffice = () => {
  return new Promise((resolve, reject) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'where' : 'which';
    const libreOfficeCmd = isWindows ? 'soffice.exe' : 'libreoffice';
    
    const proc = spawn(command, [libreOfficeCmd]);
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    
    proc.on('error', () => {
      resolve(false);
    });
  });
};

// Run the application
const runApp = async () => {
  try {
    // Check dependencies
    const libreOfficeInstalled = await checkLibreOffice();
    
    if (!libreOfficeInstalled) {
      console.error('\x1b[31m%s\x1b[0m', 'Error: LibreOffice is not installed or not found in PATH.');
      console.log('\x1b[33m%s\x1b[0m', 'Please install LibreOffice:');
      console.log('  - macOS: brew install libreoffice');
      console.log('  - Ubuntu/Debian: apt-get install libreoffice');
      console.log('  - Windows: Download from https://www.libreoffice.org/download/download/');
      process.exit(1);
    }
    
    // Create temp and output directories
    const tempDir = path.join(__dirname, '../tmp');
    const outputDir = path.join(__dirname, '../output');
    
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Start the server
    require('../src/index');
    
  } catch (error) {
    console.error('Error starting the server:', error);
    process.exit(1);
  }
};

runApp();
