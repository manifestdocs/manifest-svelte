/**
 * Manifest Core Types
 * Common domain types shared across all Manifest applications.
 */

// ============================================================
// Enums
// ============================================================

export type FeatureState =
  | 'proposed'
  | 'in_progress'
  | 'implemented'
  | 'deprecated';
export type SessionStatus = 'active' | 'completed' | 'failed';
export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';
export type AgentType = 'claude' | 'gemini' | 'codex';

// ============================================================
// Project Types
// ============================================================

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  current_version_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  instructions?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  instructions?: string | null;
  current_version_id?: string | null;
}

export interface ProjectDirectory {
  id: string;
  project_id: string;
  path: string;
  git_remote?: string | null;
  is_primary: boolean;
  instructions?: string | null;
  created_at: string;
}

export interface AddDirectoryInput {
  path: string;
  git_remote?: string | null;
  is_primary?: boolean;
  instructions?: string | null;
}

export interface ProjectWithDirectories extends Project {
  directories: ProjectDirectory[];
}

// ============================================================
// Version Types
// ============================================================

export interface Version {
  id: string;
  project_id: string;
  name: string;
  description?: string | null;
  released_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVersionInput {
  name: string;
  description?: string | null;
}

export interface UpdateVersionInput {
  name?: string;
  description?: string | null;
  released_at?: string | null;
}

// ============================================================
// Feature Types
// ============================================================

export interface Feature {
  id: string;
  project_id: string;
  parent_id?: string | null;
  title: string;
  story?: string | null;
  details?: string | null;
  desired_details?: string | null;
  state: FeatureState;
  priority: number;
  target_version_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureInput {
  parent_id?: string | null;
  title: string;
  story?: string | null;
  details?: string | null;
  state?: FeatureState;
  priority?: number;
  target_version_id?: string | null;
}

export interface UpdateFeatureInput {
  title?: string;
  story?: string | null;
  details?: string | null;
  desired_details?: string | null;
  state?: FeatureState;
  priority?: number;
  target_version_id?: string | null;
}

export interface FeatureTreeNode extends Feature {
  children: FeatureTreeNode[];
}

export interface FeatureHistory {
  id: string;
  feature_id: string;
  session_id?: string | null;
  summary: string;
  files_changed?: string[] | null;
  author: string;
  created_at: string;
}

// ============================================================
// Session Types
// ============================================================

export interface Session {
  id: string;
  feature_id: string;
  goal: string;
  status: SessionStatus;
  created_at: string;
  completed_at?: string | null;
}

export interface CreateSessionInput {
  feature_id: string;
  goal: string;
  tasks: CreateTaskInput[];
}

export interface SessionResponse {
  session: Session;
  tasks: Task[];
}

export interface SessionFeatureSummary {
  id: string;
  title: string;
}

export interface SessionStatusResponse {
  session: Session;
  feature: SessionFeatureSummary;
  tasks: Task[];
}

export interface CompleteSessionInput {
  summary: string;
  feature_state?: FeatureState;
}

export interface SessionCompletionResult {
  session: Session;
  history_entry: FeatureHistory;
}

// ============================================================
// Task Types
// ============================================================

export interface Task {
  id: string;
  session_id: string;
  parent_id?: string | null;
  title: string;
  scope: string;
  status: TaskStatus;
  agent_type: AgentType;
  worktree_path?: string | null;
  branch?: string | null;
  created_at: string;
}

export interface CreateTaskInput {
  parent_id?: string | null;
  title: string;
  scope: string;
  agent_type: AgentType;
}

export interface UpdateTaskInput {
  status?: TaskStatus;
  worktree_path?: string | null;
  branch?: string | null;
}
