# Excel to PDF MCP Server

[![smithery badge](https://smithery.ai/badge/@kmexnx/excel-to-pdf-mcp)](https://smithery.ai/server/@kmexnx/excel-to-pdf-mcp)

An MCP (Model Context Protocol) server that can convert Excel (.xls/.xlsx) and Apple Numbers (.numbers) files to PDF format. This tool integrates with AI assistants like Claude to enable file conversion directly through the conversation.

## Features

- Convert Excel files (.xls, .xlsx) to PDF
- Convert Apple Numbers files (.numbers) to PDF
- Integrates with AI assistants via the Model Context Protocol
- Secure file handling that respects project boundaries
- Easy installation via npm

## Requirements

- Node.js 16 or higher
- LibreOffice (for the conversion process)

## Installation

### Installing via Smithery

To install Excel to PDF Converter for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@kmexnx/excel-to-pdf-mcp):

```bash
npx -y @smithery/cli install @kmexnx/excel-to-pdf-mcp --client claude
```

### Install LibreOffice

LibreOffice is required for the conversion process. Install it according to your operating system:

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

### Install the MCP server

```bash
npm install -g excel-to-pdf-mcp
```

## Using with Claude Desktop

To use this MCP server with Claude desktop:

1. Configure your MCP settings in Claude desktop by adding this server to your `mcp_settings.json`:

```json
{
  "mcpServers": {
    "excel-to-pdf-mcp": {
      "command": "npx",
      "args": ["excel-to-pdf-mcp"],
      "name": "Excel to PDF Converter"
    }
  }
}
```

2. Make sure your Excel or Numbers files are within your project directory.

3. Once configured, Claude will be able to convert your spreadsheet files to PDF using this tool.

## Example Conversation

Here's an example of how a conversation with Claude might look when using this MCP server:

**User**: "I need to convert my quarterly_report.xlsx to PDF so I can share it with stakeholders."

**Claude**: "I can help you convert your Excel file to PDF. Let me use the Excel to PDF converter tool."

Claude would then use the tool behind the scenes:

```
Tool: convert_excel_to_pdf
Arguments: {
  "input_path": "quarterly_report.xlsx",
  "output_format": "pdf"
}
```

**Claude**: "I've converted your Excel file to PDF. You can find it at: quarterly_report-1628347658-a7b2c9.pdf in your project directory."

## Available Tools

This MCP server provides the following tools:

### 1. convert_excel_to_pdf

Converts Excel files (.xls/.xlsx) to PDF format.

**Arguments:**
- `input_path`: Relative path to the Excel file (required)
- `output_format`: Output format, currently only PDF is supported (default: "pdf")

### 2. convert_numbers_to_pdf

Converts Apple Numbers files (.numbers) to PDF format.

**Arguments:**
- `input_path`: Relative path to the Numbers file (required)
- `output_format`: Output format, currently only PDF is supported (default: "pdf")

## Development

If you want to run from source or contribute:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run the server: `npm start`

## License

MIT
