import { CommandResult } from "@/types/terminal"

export function out(...lines: string[]): CommandResult {
  return { lines: lines.map(content => ({ type: 'output' as const, content })) }
}

export function err(content: string): CommandResult {
  return { lines: [{ type: 'error' as const, content }] }
}
