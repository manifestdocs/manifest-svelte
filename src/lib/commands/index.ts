export type {
  CommandScope,
  CommandContext,
  SlashCommand,
  ParsedCommand,
  CommandMatch,
  VersionSummary,
} from './types.js';

export { commands } from './commands.js';

export {
  parseCommand,
  matchCommands,
  getMatchHighlights,
  buildPromptWithCommand,
  type HighlightSegment,
} from './matching.js';
