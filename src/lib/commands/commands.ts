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

function hasBddSpecs(ctx: CommandContext): boolean {
	const d = ctx.featureDetails ?? '';
	return /\b(scenario|feature|background)\b/i.test(d) && /\b(given|when|then)\b/i.test(d);
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

const enhance: SlashCommand = {
	name: 'enhance',
	label: 'Enhance',
	description: 'Flesh out a sparse feature description',
	scope: 'leaf',
	icon: 'sparkles',
	relevance(ctx) {
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
		if (!ctx.isLeaf) return 0;
		if (hasAcceptanceCriteria(ctx)) return 50; // already has AC — offer refinement
		if (detailsLength(ctx) > 50) return 85; // has details but no AC
		return 30; // sparse — AC is premature
	},
	buildSystemPrompt(ctx) {
		const hasAC = hasAcceptanceCriteria(ctx);
		return [
			'You are a QA analyst writing acceptance criteria.',
			`Feature: "${ctx.featureTitle}"`,
			ctx.featureDetails ? `Details:\n${ctx.featureDetails}` : '',
			'',
			hasAC
				? 'Review and refine the existing acceptance criteria. Identify gaps, ambiguities, and missing edge cases.'
				: 'Write acceptance criteria using checkbox format:',
			hasAC ? '' : '- [ ] Given [context], When [action], Then [expected result]',
			'',
			'Cover the happy path, error cases, and boundary conditions.',
			persistenceInstructions(ctx),
		].join('\n');
	},
};

const specs: SlashCommand = {
	name: 'specs',
	label: 'BDD Specs',
	description: 'Generate BDD scenarios from AC',
	scope: 'leaf',
	icon: 'test-tube',
	relevance(ctx) {
		if (!ctx.isLeaf) return 0;
		if (hasBddSpecs(ctx)) return 40; // already has specs
		if (hasAcceptanceCriteria(ctx)) return 90; // has AC — natural next step
		if (detailsLength(ctx) > 300) return 60; // detailed but no AC
		return 20;
	},
	buildSystemPrompt(ctx) {
		return [
			'You are a BDD specialist writing Gherkin-style specifications.',
			`Feature: "${ctx.featureTitle}"`,
			ctx.featureDetails ? `Details:\n${ctx.featureDetails}` : '',
			'',
			hasBddSpecs(ctx)
				? 'Review the existing BDD scenarios. Add missing scenarios, improve clarity, and ensure coverage.'
				: 'Write BDD scenarios in Gherkin format:',
			'',
			'```gherkin',
			`Feature: ${ctx.featureTitle}`,
			'  Scenario: [descriptive name]',
			'    Given [context]',
			'    When [action]',
			'    Then [expected outcome]',
			'```',
			'',
			'Cover happy paths, error paths, and edge cases.',
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

const implement: SlashCommand = {
	name: 'implement',
	label: 'Implement',
	description: 'Generate implementation guidance',
	scope: 'leaf',
	icon: 'code',
	relevance(ctx) {
		if (!ctx.isLeaf) return 0;
		const hasDetail = detailsLength(ctx) > 200;
		const hasAC = hasAcceptanceCriteria(ctx);
		if (hasDetail && hasAC) return 90;
		if (hasDetail) return 60;
		if (hasAC) return 55;
		return 20;
	},
	buildSystemPrompt(ctx) {
		return [
			'You are a senior software engineer planning implementation.',
			`Feature: "${ctx.featureTitle}"`,
			ctx.featureDetails ? `Specification:\n${ctx.featureDetails}` : '',
			'',
			'Provide implementation guidance:',
			'1. Files to create or modify',
			'2. Key interfaces and data structures',
			'3. Implementation steps in priority order',
			'4. Testing strategy',
			'',
			'Be specific about code patterns, naming, and architecture decisions.',
			'Reference the specification to ensure full coverage.',
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
		if (ctx.isLeaf) return 10;
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
		if (ctx.isLeaf) return 10;
		const len = detailsLength(ctx);
		if (len < 100) return 90; // sparse group — needs context
		if (len < 300) return 65;
		return 35;
	},
	buildSystemPrompt(ctx) {
		return [
			'You are a software architect writing shared context for a feature group.',
			`Feature group: "${ctx.featureTitle}"`,
			ctx.featureDetails ? `Current details:\n${ctx.featureDetails}` : 'No details yet.',
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

/** All available slash commands */
export const commands: SlashCommand[] = [
	enhance,
	ac,
	specs,
	breakdown,
	implement,
	organize,
	context,
];
