import { z } from 'zod';
import fs from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';
import { resolvePath, createTempFilePath, ensureTempDir } from '../utils/pathUtils.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import type { ToolDefinition } from './index.js';

// Import the libre office converter
import libre from 'libreoffice-convert';
const libreConvert = promisify(libre.convert);

// --- Zod Schema for Convert Numbers Arguments ---
const ConvertNumbersArgsSchema = z.object({
  input_path: z.string().min(1).describe('Relative path to the Numbers file (.numbers) to convert'),
  output_format: z.enum(['pdf']).default('pdf').describe('Output format (currently only PDF is supported)')
}).strict();

type ConvertNumbersArgs = z.infer<typeof ConvertNumbersArgsSchema>;

// --- Helper Function to Check LibreOffice Installation ---
async function checkLibreOfficeInstalled(): Promise<boolean> {
  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'where' : 'which';
    const commandArg = isWindows ? 'soffice.exe' : 'libreoffice';
    
    const { exec } = await import('node:child_process');
    const execPromise = promisify(exec);
    
    await execPromise(`${command} ${commandArg}`);
    return true;
  } catch (error) {
    return false;
  }
}

// --- Handler Function ---
export const handleConvertNumbersFunc = async (
  args: unknown
): Promise<{ content: { type: string; text: string }[] }> => {
  // Ensure LibreOffice is installed
  const libreOfficeInstalled = await checkLibreOfficeInstalled();
  if (!libreOfficeInstalled) {
    throw new McpError(
      ErrorCode.InvalidRequest,
      'LibreOffice is not installed or not found in PATH. Please install LibreOffice to use this tool.'
    );
  }

  // Parse and validate arguments
  let parsedArgs: ConvertNumbersArgs;
  try {
    parsedArgs = ConvertNumbersArgsSchema.parse(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new McpError(
        ErrorCode.InvalidParams,
        `Invalid arguments: ${error.errors.map(e => `${e.path.join('.')} (${e.message})`).join(', ')}`
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InvalidParams, `Argument validation failed: ${message}`);
  }

  try {
    // Ensure temp directory exists
    const tempDir = ensureTempDir();
    await fs.mkdir(tempDir, { recursive: true });
    
    // Resolve input path
    const inputPath = resolvePath(parsedArgs.input_path);
    
    // Check file extension
    const ext = path.extname(inputPath).toLowerCase();
    if (ext !== '.numbers') {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid file format. Only .numbers files are supported.'
      );
    }
    
    // Read the input file
    const fileContent = await fs.readFile(inputPath);
    
    // Create output path
    const outputPath = createTempFilePath(path.basename(inputPath));
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Convert to PDF
    const pdfBuffer = await libreConvert(fileContent, '.pdf', undefined);
    
    // Write the output file
    await fs.writeFile(outputPath, pdfBuffer);
    
    // Create a relative path for the result
    const relativeOutputPath = path.relative(process.cwd(), outputPath);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            output_path: relativeOutputPath,
            message: 'Numbers file successfully converted to PDF',
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('[Excel to PDF MCP] Error in conversion:', error);
    
    // Handle specific errors
    if (error instanceof McpError) {
      throw error; // Re-throw MCP errors
    }
    
    if (error instanceof Error) {
      if ('code' in error && error.code === 'ENOENT') {
        throw new McpError(ErrorCode.InvalidParams, `File not found: ${parsedArgs.input_path}`);
      }
      
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Error converting Numbers to PDF: ${error.message}`
      );
    }
    
    // Generic error
    throw new McpError(
      ErrorCode.InvalidRequest,
      `Unknown error during Numbers to PDF conversion`
    );
  }
};

// --- Tool Definition ---
export const convertNumbersToolDefinition: ToolDefinition = {
  name: 'convert_numbers_to_pdf',
  description: 'Converts Apple Numbers files (.numbers) to PDF format',
  schema: ConvertNumbersArgsSchema,
  handler: handleConvertNumbersFunc,
};
