/**
 * Types for slash commands in the AI chat panel.
 *
 * Commands are context-aware — they adapt based on whether a leaf feature
 * or feature group is selected, and on the feature's current content.
 */

/** Whether the command targets a single feature, a group, or version planning */
export type CommandScope = 'leaf' | 'group' | 'version';

/** Version summary for planning context */
export interface VersionSummary {
  id: string;
  name: string;
  featureCount: number;
  implementedCount: number;
}

/** Context passed to commands for relevance scoring and prompt building */
export interface CommandContext {
  featureId: string | null;
  featureTitle: string;
  featureDetails: string;
  projectId?: string;
  isLeaf: boolean;
  isProjectRoot?: boolean;
  /** Version summaries for planning commands */
  versions?: VersionSummary[];
  /** Name of the next version to ship */
  nextVersionName?: string;
  /** Number of features not assigned to any version */
  unassignedFeatureCount?: number;
  /** Whether the chat is in the version/plan view */
  isVersionView?: boolean;
  /** Format for acceptance criteria output: checkbox (default) or gherkin */
  acFormat?: 'checkbox' | 'gherkin';
}

/** A slash command definition */
export interface SlashCommand {
  /** Command name without slash prefix (e.g. 'enhance') */
  name: string;
  /** Human-readable label */
  label: string;
  /** Short description shown in the menu */
  description: string;
  /** Which scope this command applies to */
  scope: CommandScope;
  /** Icon identifier for the menu */
  icon: string;
  /** Score 0-100 based on current feature context. 0 = hidden. */
  relevance(ctx: CommandContext): number;
  /** Build a system prompt for this command given the context */
  buildSystemPrompt(ctx: CommandContext): string;
}

/** Result of parsing user input for a command */
export interface ParsedCommand {
  /** Matched command, or null if no command detected */
  command: SlashCommand | null;
  /** Any text after the command name */
  args: string;
  /** The original raw input */
  raw: string;
}

/** A command match with scoring info for the autocomplete menu */
export interface CommandMatch {
  command: SlashCommand;
  /** Combined score: relevance + fuzzy match quality */
  score: number;
  /** Character index ranges to highlight in the command name */
  highlights: [number, number][];
}
