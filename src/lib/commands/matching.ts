/**
 * Command matching and prompt building.
 *
 * Handles parsing user input for slash commands, fuzzy matching
 * for the autocomplete menu, and building the final prompt.
 */

import { commands } from './commands.js';
import type {
  CommandContext,
  CommandMatch,
  ParsedCommand,
  SlashCommand,
} from './types.js';

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/**
 * Parse user input to extract a slash command and arguments.
 * Returns null command if input doesn't start with `/` or no match found.
 */
export function parseCommand(input: string): ParsedCommand {
  const raw = input.trim();

  if (!raw.startsWith('/')) {
    return { command: null, args: raw, raw };
  }

  // Extract the command name (text after / up to first space)
  const spaceIdx = raw.indexOf(' ', 1);
  const name = spaceIdx === -1 ? raw.slice(1) : raw.slice(1, spaceIdx);
  const args = spaceIdx === -1 ? '' : raw.slice(spaceIdx + 1).trim();

  const command = commands.find((c) => c.name === name.toLowerCase()) ?? null;
  return { command, args, raw };
}

// ---------------------------------------------------------------------------
// Fuzzy matching
// ---------------------------------------------------------------------------

/**
 * Score how well a query matches a command name.
 * Returns 0-100. Prefix matches get a bonus.
 */
function fuzzyScore(
  query: string,
  name: string,
): { score: number; highlights: [number, number][] } {
  if (!query) return { score: 100, highlights: [] };

  const q = query.toLowerCase();
  const n = name.toLowerCase();

  // Exact match
  if (q === n) return { score: 100, highlights: [[0, n.length]] };

  // Prefix match — strong signal
  if (n.startsWith(q)) {
    return {
      score: 90 + (q.length / n.length) * 10,
      highlights: [[0, q.length]],
    };
  }

  // Substring match
  const subIdx = n.indexOf(q);
  if (subIdx !== -1) {
    return {
      score: 60 + (q.length / n.length) * 20,
      highlights: [[subIdx, subIdx + q.length]],
    };
  }

  // Character-by-character fuzzy match
  let qi = 0;
  const highlights: [number, number][] = [];
  let matchStart = -1;

  for (let ni = 0; ni < n.length && qi < q.length; ni++) {
    if (n[ni] === q[qi]) {
      if (matchStart === -1) matchStart = ni;
      qi++;
    } else if (matchStart !== -1) {
      highlights.push([matchStart, ni]);
      matchStart = -1;
    }
  }

  if (matchStart !== -1) {
    highlights.push([
      matchStart,
      matchStart + (qi - highlights.reduce((s, h) => s + h[1] - h[0], 0)),
    ]);
  }

  if (qi < q.length) return { score: 0, highlights: [] }; // not all chars matched

  const matchRatio = q.length / n.length;
  return { score: 30 + matchRatio * 30, highlights };
}

/**
 * Match commands against a query string, ranked by combined score.
 * Score = 60% context relevance + 40% fuzzy match quality.
 * Commands with 0 relevance are excluded.
 */
export function matchCommands(
  query: string,
  context: CommandContext,
): CommandMatch[] {
  const results: CommandMatch[] = [];

  for (const command of commands) {
    const relevance = command.relevance(context);
    if (relevance === 0) continue;

    const { score: fuzzy, highlights } = fuzzyScore(query, command.name);
    if (query && fuzzy === 0) continue; // query given but no match

    // Exact/prefix matches (fuzzy >= 90) get a large boost so they
    // always rank above weaker fuzzy matches regardless of relevance.
    const boost = fuzzy >= 90 ? 200 : 0;
    const score = relevance * 0.6 + fuzzy * 0.4 + boost;
    results.push({ command, score, highlights });
  }

  results.sort((a, b) => a.command.name.localeCompare(b.command.name));
  return results;
}

// ---------------------------------------------------------------------------
// Highlight segments (for UI rendering)
// ---------------------------------------------------------------------------

export interface HighlightSegment {
  text: string;
  highlighted: boolean;
}

/**
 * Convert a command name and highlight ranges into segments for rendering.
 */
export function getMatchHighlights(
  name: string,
  highlights: [number, number][],
): HighlightSegment[] {
  if (highlights.length === 0) {
    return [{ text: name, highlighted: false }];
  }

  const segments: HighlightSegment[] = [];
  let pos = 0;

  for (const [start, end] of highlights) {
    if (start > pos) {
      segments.push({ text: name.slice(pos, start), highlighted: false });
    }
    segments.push({ text: name.slice(start, end), highlighted: true });
    pos = end;
  }

  if (pos < name.length) {
    segments.push({ text: name.slice(pos), highlighted: false });
  }

  return segments;
}

// ---------------------------------------------------------------------------
// Prompt building
// ---------------------------------------------------------------------------

/**
 * Build system prompt and user message from a parsed command.
 * Returns null if no command was matched.
 */
export function buildPromptWithCommand(
  parsed: ParsedCommand,
  context: CommandContext,
): { systemPrompt: string; userMessage: string } | null {
  if (!parsed.command) return null;

  return {
    systemPrompt: parsed.command.buildSystemPrompt(context),
    userMessage:
      parsed.args ||
      `Help me with ${parsed.command.label.toLowerCase()} for this feature.`,
  };
}
