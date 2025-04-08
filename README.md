# Excel to PDF MCP Server

An MCP (Model Context Protocol) server that can convert Excel (.xls/.xlsx) and Apple Numbers (.numbers) files to PDF.

## Features

- Convert Excel files (.xls, .xlsx) to PDF
- Convert Apple Numbers files (.numbers) to PDF
- Runs as an MCP server for AI assistant integration
- Easily installable and runnable via npx

## Requirements

- Node.js 14 or higher
- LibreOffice (for the conversion process)

## Installation

### Install LibreOffice

#### On macOS:
```bash
brew install libreoffice
```

#### On Ubuntu/Debian:
```bash
apt-get install libreoffice
```

#### On Windows:
Download and install from [LibreOffice official website](https://www.libreoffice.org/download/download/).

### Run with npx

```bash
npx excel-to-pdf-mcp
```

## Usage

Once the server is running, it can be accessed by AI assistants via the MCP protocol.

The server exposes the following endpoints:

- `/convert/excel-to-pdf` - Convert Excel files to PDF
- `/convert/numbers-to-pdf` - Convert Numbers files to PDF

## License

MIT
