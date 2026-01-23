<script lang="ts">
	import { cn } from "../../utils/index.js";

	interface Props {
		/** Version name to display (e.g., "1.0.0", "2.0.0-beta") */
		name: string;
		/** Additional CSS classes */
		class?: string;
	}

	let { name, class: className }: Props = $props();
</script>

<span
	class={cn(
		"inline-flex items-center px-1.5 py-0.5 text-xs font-medium",
		"bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
		className
	)}
>
	[v{name}]
</span>
