/**
 * Manifest API HTTP Client
 *
 * Framework-agnostic HTTP client for communicating with the Manifest server.
 * All methods return typed responses matching the OpenAPI spec.
 */

import { ApiError } from './error.js';
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectWithDirectories,
  ProjectDirectory,
  AddDirectoryInput,
  Version,
  CreateVersionInput,
  UpdateVersionInput,
  Feature,
  CreateFeatureInput,
  UpdateFeatureInput,
  FeatureTreeNode,
  FeatureHistory,
  Session,
  CreateSessionInput,
  SessionResponse,
  SessionStatusResponse,
  CompleteSessionInput,
  SessionCompletionResult,
  Task,
  CreateTaskInput,
  UpdateTaskInput,
} from '$lib/types/index.js';

export interface ManifestClientConfig {
  baseUrl?: string;
}

const DEFAULT_BASE_URL = 'http://localhost:17010';

export class ManifestClient {
  private baseUrl: string;

  constructor(config?: ManifestClientConfig) {
    this.baseUrl = config?.baseUrl ?? DEFAULT_BASE_URL;
  }

  private get apiUrl(): string {
    return `${this.baseUrl}/api/v1`;
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<T> {
    const url = `${this.apiUrl}${path}`;

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      throw new ApiError(
        0,
        'Network Error',
        `Failed to connect to ${this.baseUrl}. Is the server running?`,
      );
    }

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(
        response.status,
        response.statusText,
        text || response.statusText,
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  // ============================================================
  // Health
  // ============================================================

  async health(): Promise<{ status: string }> {
    return this.request('GET', '/health');
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.health();
      return result.status === 'ok';
    } catch {
      return false;
    }
  }

  // ============================================================
  // Projects
  // ============================================================

  async listProjects(): Promise<Project[]> {
    return this.request('GET', '/projects');
  }

  async createProject(input: CreateProjectInput): Promise<Project> {
    return this.request('POST', '/projects', input);
  }

  async getProject(id: string): Promise<ProjectWithDirectories> {
    return this.request('GET', `/projects/${id}`);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    return this.request('PUT', `/projects/${id}`, input);
  }

  async deleteProject(id: string): Promise<void> {
    return this.request('DELETE', `/projects/${id}`);
  }

  // ============================================================
  // Project Directories
  // ============================================================

  async listProjectDirectories(projectId: string): Promise<ProjectDirectory[]> {
    return this.request('GET', `/projects/${projectId}/directories`);
  }

  async addProjectDirectory(
    projectId: string,
    input: AddDirectoryInput,
  ): Promise<ProjectDirectory> {
    return this.request('POST', `/projects/${projectId}/directories`, input);
  }

  async removeDirectory(directoryId: string): Promise<void> {
    return this.request('DELETE', `/directories/${directoryId}`);
  }

  // ============================================================
  // Versions
  // ============================================================

  async listProjectVersions(projectId: string): Promise<Version[]> {
    return this.request('GET', `/projects/${projectId}/versions`);
  }

  async createVersion(
    projectId: string,
    input: CreateVersionInput,
  ): Promise<Version> {
    return this.request('POST', `/projects/${projectId}/versions`, input);
  }

  async getVersion(id: string): Promise<Version> {
    return this.request('GET', `/versions/${id}`);
  }

  async updateVersion(id: string, input: UpdateVersionInput): Promise<Version> {
    return this.request('PUT', `/versions/${id}`, input);
  }

  async deleteVersion(id: string): Promise<void> {
    return this.request('DELETE', `/versions/${id}`);
  }

  // ============================================================
  // Features
  // ============================================================

  async listFeatures(): Promise<Feature[]> {
    return this.request('GET', '/features');
  }

  async listProjectFeatures(projectId: string): Promise<Feature[]> {
    return this.request('GET', `/projects/${projectId}/features`);
  }

  async listRootFeatures(projectId: string): Promise<Feature[]> {
    return this.request('GET', `/projects/${projectId}/features/roots`);
  }

  async getFeatureTree(projectId: string): Promise<FeatureTreeNode[]> {
    return this.request('GET', `/projects/${projectId}/features/tree`);
  }

  async createFeature(
    projectId: string,
    input: CreateFeatureInput,
  ): Promise<Feature> {
    return this.request('POST', `/projects/${projectId}/features`, input);
  }

  async getFeature(id: string): Promise<Feature> {
    return this.request('GET', `/features/${id}`);
  }

  async updateFeature(id: string, input: UpdateFeatureInput): Promise<Feature> {
    return this.request('PUT', `/features/${id}`, input);
  }

  async deleteFeature(id: string): Promise<void> {
    return this.request('DELETE', `/features/${id}`);
  }

  async listChildren(featureId: string): Promise<Feature[]> {
    return this.request('GET', `/features/${featureId}/children`);
  }

  async getFeatureHistory(featureId: string): Promise<FeatureHistory[]> {
    return this.request('GET', `/features/${featureId}/history`);
  }

  async listFeatureSessions(featureId: string): Promise<Session[]> {
    return this.request('GET', `/features/${featureId}/sessions`);
  }

  // ============================================================
  // Sessions
  // ============================================================

  async createSession(input: CreateSessionInput): Promise<SessionResponse> {
    return this.request('POST', '/sessions', input);
  }

  async getSession(id: string): Promise<Session> {
    return this.request('GET', `/sessions/${id}`);
  }

  async getSessionStatus(id: string): Promise<SessionStatusResponse> {
    return this.request('GET', `/sessions/${id}/status`);
  }

  async completeSession(
    id: string,
    input: CompleteSessionInput,
  ): Promise<SessionCompletionResult> {
    return this.request('POST', `/sessions/${id}/complete`, input);
  }

  async listSessionTasks(sessionId: string): Promise<Task[]> {
    return this.request('GET', `/sessions/${sessionId}/tasks`);
  }

  // ============================================================
  // Tasks
  // ============================================================

  async createTask(
    sessionId: string,
    input: Omit<CreateTaskInput, 'parent_id'>,
  ): Promise<Task> {
    return this.request('POST', `/sessions/${sessionId}/tasks`, input);
  }

  async getTask(id: string): Promise<Task> {
    return this.request('GET', `/tasks/${id}`);
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<void> {
    return this.request('PUT', `/tasks/${id}`, input);
  }

  // ============================================================
  // Project Discovery
  // ============================================================

  /**
   * Find the project that contains the given directory path.
   * Useful for auto-detecting the project from the workspace folder.
   */
  async findProjectByDirectory(
    directoryPath: string,
  ): Promise<ProjectWithDirectories | null> {
    const projects = await this.listProjects();

    for (const project of projects) {
      const fullProject = await this.getProject(project.id);
      for (const dir of fullProject.directories) {
        if (directoryPath.startsWith(dir.path)) {
          return fullProject;
        }
      }
    }

    return null;
  }
}

/**
 * Create a new ManifestClient instance.
 */
export function createClient(config?: ManifestClientConfig): ManifestClient {
  return new ManifestClient(config);
}
