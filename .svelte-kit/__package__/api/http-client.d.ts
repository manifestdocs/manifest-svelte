/**
 * Manifest API HTTP Client
 *
 * Framework-agnostic HTTP client for communicating with the Manifest server.
 * All methods return typed responses matching the OpenAPI spec.
 */
import type { Project, CreateProjectInput, UpdateProjectInput, ProjectWithDirectories, ProjectDirectory, AddDirectoryInput, Version, CreateVersionInput, UpdateVersionInput, Feature, CreateFeatureInput, UpdateFeatureInput, FeatureTreeNode, FeatureHistory, Session, CreateSessionInput, SessionResponse, SessionStatusResponse, CompleteSessionInput, SessionCompletionResult, Task, CreateTaskInput, UpdateTaskInput } from "../types/index.js";
export interface ManifestClientConfig {
    baseUrl?: string;
}
export declare class ManifestClient {
    private baseUrl;
    constructor(config?: ManifestClientConfig);
    private get apiUrl();
    private request;
    health(): Promise<{
        status: string;
    }>;
    isHealthy(): Promise<boolean>;
    listProjects(): Promise<Project[]>;
    createProject(input: CreateProjectInput): Promise<Project>;
    getProject(id: string): Promise<ProjectWithDirectories>;
    updateProject(id: string, input: UpdateProjectInput): Promise<Project>;
    deleteProject(id: string): Promise<void>;
    listProjectDirectories(projectId: string): Promise<ProjectDirectory[]>;
    addProjectDirectory(projectId: string, input: AddDirectoryInput): Promise<ProjectDirectory>;
    removeDirectory(directoryId: string): Promise<void>;
    listProjectVersions(projectId: string): Promise<Version[]>;
    createVersion(projectId: string, input: CreateVersionInput): Promise<Version>;
    getVersion(id: string): Promise<Version>;
    updateVersion(id: string, input: UpdateVersionInput): Promise<Version>;
    deleteVersion(id: string): Promise<void>;
    listFeatures(): Promise<Feature[]>;
    listProjectFeatures(projectId: string): Promise<Feature[]>;
    listRootFeatures(projectId: string): Promise<Feature[]>;
    getFeatureTree(projectId: string): Promise<FeatureTreeNode[]>;
    createFeature(projectId: string, input: CreateFeatureInput): Promise<Feature>;
    getFeature(id: string): Promise<Feature>;
    updateFeature(id: string, input: UpdateFeatureInput): Promise<Feature>;
    deleteFeature(id: string): Promise<void>;
    listChildren(featureId: string): Promise<Feature[]>;
    getFeatureHistory(featureId: string): Promise<FeatureHistory[]>;
    listFeatureSessions(featureId: string): Promise<Session[]>;
    createSession(input: CreateSessionInput): Promise<SessionResponse>;
    getSession(id: string): Promise<Session>;
    getSessionStatus(id: string): Promise<SessionStatusResponse>;
    completeSession(id: string, input: CompleteSessionInput): Promise<SessionCompletionResult>;
    listSessionTasks(sessionId: string): Promise<Task[]>;
    createTask(sessionId: string, input: Omit<CreateTaskInput, "parent_id">): Promise<Task>;
    getTask(id: string): Promise<Task>;
    updateTask(id: string, input: UpdateTaskInput): Promise<void>;
    /**
     * Find the project that contains the given directory path.
     * Useful for auto-detecting the project from the workspace folder.
     */
    findProjectByDirectory(directoryPath: string): Promise<ProjectWithDirectories | null>;
}
/**
 * Create a new ManifestClient instance.
 */
export declare function createClient(config?: ManifestClientConfig): ManifestClient;
//# sourceMappingURL=http-client.d.ts.map