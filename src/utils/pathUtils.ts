import path from 'path';
import fs from 'node:fs/promises';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

// Use the server's current working directory as the project root.
export const PROJECT_ROOT = process.cwd();

console.error(`[Excel to PDF MCP - pathUtils] Project Root determined from CWD: ${PROJECT_ROOT}`);

/**
 * Resolves a user-provided relative path against the project root,
 * ensuring it stays within the project boundaries.
 * Throws McpError on invalid input, absolute paths, or path traversal.
 * @param userPath The relative path provided by the user.
 * @returns The resolved absolute path.
 */
export const resolvePath = (userPath: string): string => {
  if (typeof userPath !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, 'Path must be a string.');
  }
  
  const normalizedUserPath = path.normalize(userPath);
  if (path.isAbsolute(normalizedUserPath)) {
    throw new McpError(ErrorCode.InvalidParams, 'Absolute paths are not allowed.');
  }
  
  // Resolve against the calculated PROJECT_ROOT
  const resolved = path.resolve(PROJECT_ROOT, normalizedUserPath);
  
  // Security check: Ensure the resolved path is still within the project root
  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new McpError(ErrorCode.InvalidRequest, 'Path traversal detected. Access denied.');
  }
  
  return resolved;
};

/**
 * Creates a temporary file path for output within the project.
 * @param originalName The original filename
 * @returns A temporary file path
 */
export const createTempFilePath = (originalName: string): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const baseName = path.basename(originalName, path.extname(originalName));
  const tempName = `${baseName}-${timestamp}-${randomStr}.pdf`;
  
  return path.resolve(PROJECT_ROOT, 'temp', tempName);
};

/**
 * Ensures the existence of the temporary directory
 * @returns The absolute path to the temp directory
 */
export const ensureTempDir = async (): Promise<string> => {
  const tempDir = path.resolve(PROJECT_ROOT, 'temp');
  
  try {
    await fs.mkdir(tempDir, { recursive: true });
    console.error(`[Excel to PDF MCP] Created or verified temp directory: ${tempDir}`);
  } catch (error) {
    console.error(`[Excel to PDF MCP] Error creating temp directory: ${error}`);
    // Still return the path even if creation failed, so calling code can handle the error
  }
  
  return tempDir;
};
