/**
 * Slash command definitions for the AI chat panel.
 *
 * Each command has context-aware relevance scoring and builds
 * a focused system prompt incorporating the feature context.
 */

import type { CommandContext, SlashCommand } from './types.js';

// ---------------------------------------------------------------------------
// Persistence instructions
// ---------------------------------------------------------------------------

function persistenceInstructions(ctx: CommandContext): string {
  if (!ctx.featureId) return '';
  return [
    '',
    `Feature ID: ${ctx.featureId}`,
    '',
    'After generating your response, call update_feature to save the results:',
    `- feature_id: "${ctx.featureId}"`,
    '- Set desired_details to the COMPLETE updated feature details (merge your additions with the existing content)',
    '- Do NOT change the feature state — only set desired_details',
    'This proposes changes for the user to review via the diff view.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Content heuristics
// ---------------------------------------------------------------------------

function detailsLength(ctx: CommandContext): number {
  return (ctx.featureDetails ?? '').length;
}

function hasAcceptanceCriteria(ctx: CommandContext): boolean {
  const d = ctx.featureDetails ?? '';
  return /- \[[ x]\]/i.test(d) || /given\b.*\bwhen\b.*\bthen\b/is.test(d);
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const enhance: SlashCommand = {
  name: 'enhance',
  label: 'Enhance',
  description: 'Expand a user story into detailed feature spec',
  scope: 'leaf',
  icon: 'sparkles',
  relevance(ctx) {
    if (ctx.isVersionView) return 0;
    if (!ctx.isLeaf) return 0;
    const len = detailsLength(ctx);
    if (len < 50) return 95;
    if (len < 200) return 75;
    if (len < 500) return 40;
    return 15;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a product engineer helping flesh out a feature specification.',
      `The feature is titled "${ctx.featureTitle}".`,
      ctx.featureDetails
        ? `Current details:\n${ctx.featureDetails}`
        : 'The feature has no details yet.',
      '',
      'Write a clear, detailed specification for this feature.',
      'Include: purpose, user story, key behaviors, and edge cases.',
      'Use markdown formatting. Be specific and actionable.',
      persistenceInstructions(ctx),
    ].join('\n');
  },
};

const ac: SlashCommand = {
  name: 'ac',
  label: 'Acceptance Criteria',
  description: 'Write or refine acceptance criteria',
  scope: 'leaf',
  icon: 'check-square',
  relevance(ctx) {
    if (ctx.isVersionView) return 0;
    if (!ctx.isLeaf) return 0;
    if (hasAcceptanceCriteria(ctx)) return 50; // already has AC — offer refinement
    if (detailsLength(ctx) > 50) return 85; // has details but no AC
    return 30; // sparse — AC is premature
  },
  buildSystemPrompt(ctx) {
    const hasAC = hasAcceptanceCriteria(ctx);
    const isGherkin = ctx.acFormat === 'gherkin';
    const formatInstructions = isGherkin
      ? [
          'Write acceptance criteria using Gherkin Scenario format:',
          '',
          '```gherkin',
          `Feature: ${ctx.featureTitle}`,
          '  Scenario: [descriptive name]',
          '    Given [context]',
          '    When [action]',
          '    Then [expected outcome]',
          '```',
        ]
      : [
          'Write acceptance criteria using checkbox format:',
          '- [ ] Given [context], When [action], Then [expected result]',
        ];

    return [
      'You are a QA analyst writing acceptance criteria.',
      `Feature: "${ctx.featureTitle}"`,
      ctx.featureDetails ? `Details:\n${ctx.featureDetails}` : '',
      '',
      hasAC
        ? 'Review and refine the existing acceptance criteria. Identify gaps, ambiguities, and missing edge cases.'
        : formatInstructions.join('\n'),
      '',
      'Cover the happy path, error cases, and boundary conditions.',
      persistenceInstructions(ctx),
    ].join('\n');
  },
};

const breakdown: SlashCommand = {
  name: 'breakdown',
  label: 'Break Down',
  description: 'Split into smaller sub-features',
  scope: 'leaf',
  icon: 'git-branch',
  relevance(ctx) {
    if (ctx.isVersionView) return 0;
    if (!ctx.isLeaf) return 0;
    const len = detailsLength(ctx);
    if (len > 500) return 85;
    if (len > 300) return 70;
    if (len > 100) return 45;
    return 15;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a product engineer breaking down a feature into smaller, implementable sub-features.',
      `Feature: "${ctx.featureTitle}"`,
      ctx.featureDetails ? `Details:\n${ctx.featureDetails}` : '',
      '',
      'Propose a breakdown into 3-7 sub-features. For each:',
      '- Title (2-5 words, capability-focused)',
      '- One-paragraph description',
      '- Key acceptance criteria',
      '',
      'Order by implementation priority. Each sub-feature should be independently implementable.',
    ].join('\n');
  },
};

const plan: SlashCommand = {
  name: 'plan',
  label: 'Plan Features',
  description: 'Decompose spec into a feature tree',
  scope: 'leaf',
  icon: 'git-branch',
  relevance(ctx) {
    if (ctx.isVersionView) return 0;
    if (!ctx.isProjectRoot || !ctx.isLeaf) return 0;
    if (detailsLength(ctx) > 50) return 95;
    return 0;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a product architect decomposing a project specification into an initial feature tree.',
      `Project: "${ctx.featureTitle}"`,
      ctx.featureDetails
        ? `Project specification:\n${ctx.featureDetails}`
        : 'No specification found.',
      '',
      'Analyze this specification and propose a feature tree of 3-10 top-level features.',
      'For each feature provide:',
      '- Title (2-5 words, capability-focused — what users can DO)',
      '- A short description (1-2 sentences)',
      '- 2-4 acceptance criteria in Given/When/Then format',
      '',
      'Order features by implementation priority (most foundational first).',
      'Each feature should pass the user story test: "As a [user], I can [capability] so that [benefit]."',
      '',
      'After presenting the plan for review, call the Manifest `plan` MCP tool to create the features.',
      ctx.projectId ? `Project ID: ${ctx.projectId}` : '',
    ].join('\n');
  },
};

const organize: SlashCommand = {
  name: 'organize',
  label: 'Organize',
  description: 'Reorganize child features and priorities',
  scope: 'group',
  icon: 'layers',
  relevance(ctx) {
    if (ctx.isVersionView) return 0;
    if (ctx.isLeaf) return 0;
    return 85;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a product manager organizing a feature group.',
      `Feature group: "${ctx.featureTitle}"`,
      ctx.featureDetails ? `Current details:\n${ctx.featureDetails}` : '',
      '',
      'Suggest how to organize the child features:',
      '- Logical grouping and hierarchy',
      '- Priority ordering (what to build first)',
      '- Dependencies between features',
      '- Any features that should be split or merged',
    ].join('\n');
  },
};

const context: SlashCommand = {
  name: 'context',
  label: 'Add Context',
  description: 'Add architectural context to a feature group',
  scope: 'group',
  icon: 'book-open',
  relevance(ctx) {
    if (ctx.isVersionView) return 0;
    if (ctx.isLeaf) return 0;
    const len = detailsLength(ctx);
    if (len < 100) return 90; // sparse group — needs context
    if (len < 300) return 65;
    return 35;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a software architect writing shared context for a feature group.',
      `Feature group: "${ctx.featureTitle}"`,
      ctx.featureDetails
        ? `Current details:\n${ctx.featureDetails}`
        : 'No details yet.',
      '',
      'Write shared context that applies to all child features:',
      '- Architectural decisions and constraints',
      '- Technology choices and conventions',
      '- Cross-cutting concerns (auth, error handling, etc.)',
      '- Key interfaces and data flows',
      '',
      'This context will be inherited by all child features, so focus on decisions that affect the group as a whole.',
      persistenceInstructions(ctx),
    ].join('\n');
  },
};

// ---------------------------------------------------------------------------
// Version context helpers
// ---------------------------------------------------------------------------

function versionContextBlock(ctx: CommandContext): string {
  if (!ctx.versions || ctx.versions.length === 0) return '';

  const lines = ['## Version Overview', ''];
  for (const v of ctx.versions) {
    const pct =
      v.featureCount > 0
        ? Math.round((v.implementedCount / v.featureCount) * 100)
        : 0;
    lines.push(
      `- **${v.name}**: ${v.implementedCount}/${v.featureCount} implemented (${pct}%)`,
    );
  }

  if (ctx.unassignedFeatureCount !== undefined && ctx.unassignedFeatureCount > 0) {
    lines.push(`- **Backlog**: ${ctx.unassignedFeatureCount} unassigned features`);
  }

  if (ctx.projectId) {
    lines.push('', `Project ID: ${ctx.projectId}`);
  }

  return lines.join('\n');
}

function versionPersistenceInstructions(): string {
  return [
    '',
    'After analysis, use Manifest MCP tools to make changes:',
    '- set_feature_version to move features between versions',
    '- update_feature to change priorities or details',
    '- list_versions and find_features to gather more data if needed',
    'Present your recommendations clearly before making changes.',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Version planning commands
// ---------------------------------------------------------------------------

const scope: SlashCommand = {
  name: 'scope',
  label: 'Scope Version',
  description: 'Recommend features for the next version',
  scope: 'version',
  icon: 'target',
  relevance(ctx) {
    if (!ctx.isVersionView) return 0;
    if ((ctx.unassignedFeatureCount ?? 0) > 0) return 90;
    return 40;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a release manager helping scope the next version.',
      ctx.nextVersionName
        ? `The next version is **${ctx.nextVersionName}**.`
        : '',
      '',
      versionContextBlock(ctx),
      '',
      'Recommend which backlog features should be included in the next version.',
      'Consider:',
      '- Feature dependencies (what must ship together)',
      '- Spec completeness (features with detailed specs are more ready)',
      '- Balanced scope (avoid overloading a single release)',
      '',
      'Use find_features to examine the backlog, then present recommendations.',
      versionPersistenceInstructions(),
    ].join('\n');
  },
};

const readiness: SlashCommand = {
  name: 'readiness',
  label: 'Readiness Check',
  description: 'Assess if a version is ready to ship',
  scope: 'version',
  icon: 'clipboard-check',
  relevance(ctx) {
    if (!ctx.isVersionView) return 0;
    const next = ctx.versions?.find((v) => v.name === ctx.nextVersionName);
    if (next && next.featureCount > 0) return 90;
    return 30;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a release manager assessing version readiness.',
      ctx.nextVersionName
        ? `Evaluating version **${ctx.nextVersionName}**.`
        : '',
      '',
      versionContextBlock(ctx),
      '',
      'Assess whether this version is ready to ship. Check:',
      '- Feature completion: are all features implemented?',
      '- Spec completeness: do features have acceptance criteria?',
      '- Blockers: any features stuck in_progress or missing specs?',
      '- Gaps: any obvious missing capabilities for this release?',
      '',
      'Use get_feature on each feature in the version to inspect their specs.',
      'Give a clear ship/no-ship recommendation with specific blockers.',
    ].join('\n');
  },
};

const prioritize: SlashCommand = {
  name: 'prioritize',
  label: 'Prioritize Backlog',
  description: 'Prioritize unassigned backlog features',
  scope: 'version',
  icon: 'sort-desc',
  relevance(ctx) {
    if (!ctx.isVersionView) return 0;
    if ((ctx.unassignedFeatureCount ?? 0) > 2) return 85;
    if ((ctx.unassignedFeatureCount ?? 0) > 0) return 60;
    return 25;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a product manager prioritizing the backlog.',
      '',
      versionContextBlock(ctx),
      '',
      'Review the unassigned backlog features and recommend a priority ordering.',
      'Consider:',
      '- User value: which features matter most to users?',
      '- Dependencies: which features unblock others?',
      '- Effort vs. impact: quick wins vs. large investments',
      '- Technical risk: identify features that need early investigation',
      '',
      'Use find_features to examine backlog features in detail.',
      'Present a ranked list with brief justification for each position.',
      versionPersistenceInstructions(),
    ].join('\n');
  },
};

const releaseNotes: SlashCommand = {
  name: 'release-notes',
  label: 'Release Notes',
  description: 'Draft release notes for a version',
  scope: 'version',
  icon: 'file-text',
  relevance(ctx) {
    if (!ctx.isVersionView) return 0;
    const next = ctx.versions?.find((v) => v.name === ctx.nextVersionName);
    if (next && next.implementedCount > 0) return 85;
    return 20;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a technical writer drafting release notes.',
      ctx.nextVersionName
        ? `Drafting notes for version **${ctx.nextVersionName}**.`
        : '',
      '',
      versionContextBlock(ctx),
      '',
      'Draft release notes for this version. For each implemented feature:',
      '- Write a user-facing summary (1-2 sentences)',
      '- Group related features under clear headings',
      '- Highlight breaking changes or migration steps if applicable',
      '',
      'Use get_feature on each feature to read their specs and history.',
      'Write in a clear, professional tone suitable for a changelog.',
    ].join('\n');
  },
};

const balance: SlashCommand = {
  name: 'balance',
  label: 'Balance Versions',
  description: 'Redistribute features across versions',
  scope: 'version',
  icon: 'layers',
  relevance(ctx) {
    if (!ctx.isVersionView) return 0;
    if (!ctx.versions || ctx.versions.length < 2) return 0;
    // Check for imbalanced versions
    const counts = ctx.versions.map((v) => v.featureCount);
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    if (max - min > 3) return 85;
    if (max - min > 1) return 50;
    return 25;
  },
  buildSystemPrompt(ctx) {
    return [
      'You are a release planner balancing work across versions.',
      '',
      versionContextBlock(ctx),
      '',
      'Analyze the feature distribution across versions and recommend rebalancing.',
      'Consider:',
      '- Even workload distribution across releases',
      '- Feature dependencies (keep related features together)',
      '- Priority: higher-priority features in earlier versions',
      '- Scope creep: flag versions that are too large',
      '',
      'Use find_features and list_versions for detailed data.',
      'Present specific move recommendations (which feature to which version).',
      versionPersistenceInstructions(),
    ].join('\n');
  },
};

/** All available slash commands (alphabetical) */
export const commands: SlashCommand[] = [
  ac,
  balance,
  breakdown,
  context,
  enhance,
  organize,
  plan,
  prioritize,
  readiness,
  releaseNotes,
  scope,
];
