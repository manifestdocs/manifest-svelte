<script lang="ts">
  import type {
    HTMLInputAttributes,
    HTMLInputTypeAttribute,
  } from 'svelte/elements';
  import { cn, type WithElementRef } from '$lib/utils/index.js';

  type InputType = Exclude<HTMLInputTypeAttribute, 'file'>;

  type Props = WithElementRef<
    Omit<HTMLInputAttributes, 'type'> &
      (
        | { type: 'file'; files?: FileList }
        | { type?: InputType; files?: undefined }
      )
  >;

  let {
    ref = $bindable(null),
    value = $bindable(),
    type,
    files = $bindable(),
    class: className,
    'data-slot': dataSlot = 'input',
    ...restProps
  }: Props = $props();
</script>

{#if type === 'file'}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      'border-input bg-card placeholder:text-muted-foreground flex w-full min-w-0 rounded-md border px-3 py-2 text-[14px] font-medium text-foreground transition-colors outline-none ring-0 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-destructive',
      className,
    )}
    type="file"
    bind:files
    bind:value
    {...restProps}
  />
{:else}
  <input
    bind:this={ref}
    data-slot={dataSlot}
    class={cn(
      'border-input bg-card placeholder:text-muted-foreground flex w-full min-w-0 rounded-md border px-3 py-2 text-[14px] text-foreground transition-colors outline-none ring-0 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50',
      'aria-invalid:border-destructive',
      className,
    )}
    {type}
    bind:value
    {...restProps}
  />
{/if}
