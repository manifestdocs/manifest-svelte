<script lang="ts">
  import { cn } from '$lib/utils/index.js';
  import type { Version } from '$lib/types/index.js';

  type FilterMode = 'all' | 'current' | string; // string = version ID for preview

  interface Props {
    /** Available versions for the project */
    versions: Version[];
    /** Current version ID of the project (if set) */
    currentVersionId?: string | null;
    /** Currently selected filter mode */
    value: FilterMode;
    /** Callback when filter mode changes */
    onchange?: (mode: FilterMode) => void;
    /** Additional CSS classes */
    class?: string;
  }

  let {
    versions,
    currentVersionId,
    value = 'all',
    onchange,
    class: className,
  }: Props = $props();

  // Filter to unreleased versions (no released_at date)
  const unreleasedVersions = $derived(versions.filter((v) => !v.released_at));

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    onchange?.(target.value as FilterMode);
  }
</script>

<select
  class={cn(
    'border border-input bg-background px-3 py-1.5 text-sm',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    className,
  )}
  {value}
  onchange={handleChange}
>
  <option value="all">All Versions</option>
  <option value="current"
    >Current ({currentVersionId
      ? 'v' + versions.find((v) => v.id === currentVersionId)?.name
      : 'none'})</option
  >

  {#if unreleasedVersions.length > 0}
    <option disabled>───────────</option>
    {#each unreleasedVersions as version}
      <option value={version.id}>Preview: v{version.name}</option>
    {/each}
  {/if}
</select>
