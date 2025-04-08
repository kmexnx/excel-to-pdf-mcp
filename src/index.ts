#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';

// Import our tool definitions
import { allToolDefinitions } from './handlers/index.js';

// --- Server Setup ---
const server = new Server(
  {
    name: 'excel-to-pdf-mcp',
    version: '1.0.0',
    description: 'MCP Server for converting Excel (.xls, .xlsx) and Apple Numbers (.numbers) files to PDF',
  },
  {
    capabilities: { tools: {} },
  }
);

// Helper function to convert Zod schema to JSON schema for MCP
const generateInputSchema = (schema: any): object => {
  return zodToJsonSchema(schema, { target: 'openApi3' }) as unknown as object;
};

// Handle ListTools requests
server.setRequestHandler(ListToolsRequestSchema, () => {
  // Map the tool definitions to the format expected by the SDK
  const availableTools = allToolDefinitions.map((def) => ({
    name: def.name,
    description: def.description,
    inputSchema: generateInputSchema(def.schema),
  }));
  
  return { tools: availableTools };
});

// Handle CallTool requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Find the requested tool
  const toolDefinition = allToolDefinitions.find((def) => def.name === request.params.name);

  if (!toolDefinition) {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  }

  // Call the handler
  return toolDefinition.handler(request.params.arguments);
});

// Verify environment before starting the server
async function verifyEnvironment(): Promise<void> {
  console.error('[Excel to PDF MCP] Verifying environment...');
  
  // Create temporary directory
  try {
    const { ensureTempDir } = await import('./utils/pathUtils.js');
    await ensureTempDir();
  } catch (error) {
    console.error('[Excel to PDF MCP] Error creating temp directory:', error);
  }
  
  // Check if LibreOffice is installed
  try {
    const { checkLibreOfficeInstalled } = await import('./handlers/convertExcel.js');
    const libreOfficeInstalled = await checkLibreOfficeInstalled();
    
    if (!libreOfficeInstalled) {
      console.error('[Excel to PDF MCP] WARNING: LibreOffice not found in PATH. Conversions will fail!');
    } else {
      console.error('[Excel to PDF MCP] Found LibreOffice installation. Environment looks good.');
    }
  } catch (error) {
    console.error('[Excel to PDF MCP] Error checking for LibreOffice:', error);
  }
}

// --- Server Start ---
async function main(): Promise<void> {
  // Verify environment before starting
  await verifyEnvironment();
  
  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Excel to PDF MCP] Server running on stdio');
}

main().catch((error: unknown) => {
  console.error('[Excel to PDF MCP] Server error:', error);
  process.exit(1);
});
