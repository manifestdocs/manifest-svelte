// Utils
export { cn } from "./utils/index.js";
export type {
  WithoutChild,
  WithoutChildren,
  WithoutChildrenOrChild,
  WithElementRef,
} from "./utils/index.js";

// Components
export {
  // Button
  Button,
  buttonVariants,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  // Card
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction,
  // Input
  Input,
  // Textarea
  Textarea,
  // Badge
  Badge,
  badgeVariants,
  type BadgeVariant,
  // Collapsible
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  // Dialog
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  // VersionBadge
  VersionBadge,
  // VersionSelector
  VersionSelector,
} from "./components/index.js";

// Types
export type {
  // Enums
  FeatureState,
  SessionStatus,
  TaskStatus,
  AgentType,
  // Project
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectDirectory,
  AddDirectoryInput,
  ProjectWithDirectories,
  // Version
  Version,
  CreateVersionInput,
  UpdateVersionInput,
  // Feature
  Feature,
  CreateFeatureInput,
  UpdateFeatureInput,
  FeatureTreeNode,
  FeatureHistory,
  // Session
  Session,
  CreateSessionInput,
  SessionResponse,
  SessionFeatureSummary,
  SessionStatusResponse,
  CompleteSessionInput,
  SessionCompletionResult,
  // Task
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from "./types/index.js";

// API Client
export { ApiError, ManifestClient, createClient, type ManifestClientConfig } from "./api/index.js";
