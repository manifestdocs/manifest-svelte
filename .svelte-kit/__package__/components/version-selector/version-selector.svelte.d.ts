import type { Version } from "../../types/index.js";
type FilterMode = "all" | "current" | string;
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
declare const VersionSelector: import("svelte").Component<Props, {}, "">;
type VersionSelector = ReturnType<typeof VersionSelector>;
export default VersionSelector;
//# sourceMappingURL=version-selector.svelte.d.ts.map