<script lang="ts">
	import { cn, type WithElementRef, type WithoutChildren } from "$lib/utils/index.js";
	import type { HTMLTextareaAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		value = $bindable(),
		class: className,
		"data-slot": dataSlot = "textarea",
		...restProps
	}: WithoutChildren<WithElementRef<HTMLTextareaAttributes>> = $props();
</script>

<textarea
	bind:this={ref}
	data-slot={dataSlot}
	class={cn(
		"border-input bg-card placeholder:text-muted-foreground text-foreground flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-[14px] transition-colors outline-none ring-0 focus:border-ring aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
		className
	)}
	bind:value
	{...restProps}
></textarea>
