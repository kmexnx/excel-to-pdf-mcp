// Import tool definitions
import { convertExcelToolDefinition } from './convertExcel.js';
import { convertNumbersToolDefinition } from './convertNumbers.js';

// Import Zod for typing
import type { z } from 'zod';

// Define the structure for a tool definition
export interface ToolDefinition {
  name: string;
  description: string;
  schema: z.ZodType<unknown>;
  // Define the specific return type expected by the SDK for tool handlers
  handler: (args: unknown) => Promise<{ content: { type: string; text: string }[] }>;
}

// Aggregate all tool definitions
export const allToolDefinitions: ToolDefinition[] = [
  convertExcelToolDefinition,
  convertNumbersToolDefinition
];
