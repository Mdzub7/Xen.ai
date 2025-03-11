// First, let's create a new utility file for code comparison
import { diffLines } from 'diff';

export interface CodeDiff {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function compareCode(originalCode: string, newCode: string): CodeDiff[] {
  // Normalize line endings
  const normalizedOriginal = originalCode.replace(/\r\n/g, '\n');
  const normalizedNew = newCode.replace(/\r\n/g, '\n');
  
  // Get the differences between the two code blocks
  return diffLines(normalizedOriginal, normalizedNew);
}