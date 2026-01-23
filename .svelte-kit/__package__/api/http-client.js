/**
 * Manifest API HTTP Client
 *
 * Framework-agnostic HTTP client for communicating with the Manifest server.
 * All methods return typed responses matching the OpenAPI spec.
 */
import { ApiError } from "./error.js";
const DEFAULT_BASE_URL = "http://localhost:17010";
export class ManifestClient {
    baseUrl;
    constructor(config) {
        this.baseUrl = config?.baseUrl ?? DEFAULT_BASE_URL;
    }
    get apiUrl() {
        return `${this.baseUrl}/api/v1`;
    }
    async request(method, path, body) {
        const url = `${this.apiUrl}${path}`;
        const options = {
            method,
            headers: {
                "Content-Type": "application/json",
            },
        };
        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }
        let response;
        try {
            response = await fetch(url, options);
        }
        catch (error) {
            throw new ApiError(0, "Network Error", `Failed to connect to ${this.baseUrl}. Is the server running?`);
        }
        if (!response.ok) {
            const text = await response.text();
            throw new ApiError(response.status, response.statusText, text || response.statusText);
        }
        // Handle 204 No Content
        if (response.status === 204) {
            return undefined;
        }
        return response.json();
    }
    // ============================================================
    // Health
    // ============================================================
    async health() {
        return this.request("GET", "/health");
    }
    async isHealthy() {
        try {
            const result = await this.health();
            return result.status === "ok";
        }
        catch {
            return false;
        }
    }
    // ============================================================
    // Projects
    // ============================================================
    async listProjects() {
        return this.request("GET", "/projects");
    }
    async createProject(input) {
        return this.request("POST", "/projects", input);
    }
    async getProject(id) {
        return this.request("GET", `/projects/${id}`);
    }
    async updateProject(id, input) {
        return this.request("PUT", `/projects/${id}`, input);
    }
    async deleteProject(id) {
        return this.request("DELETE", `/projects/${id}`);
    }
    // ============================================================
    // Project Directories
    // ============================================================
    async listProjectDirectories(projectId) {
        return this.request("GET", `/projects/${projectId}/directories`);
    }
    async addProjectDirectory(projectId, input) {
        return this.request("POST", `/projects/${projectId}/directories`, input);
    }
    async removeDirectory(directoryId) {
        return this.request("DELETE", `/directories/${directoryId}`);
    }
    // ============================================================
    // Versions
    // ============================================================
    async listProjectVersions(projectId) {
        return this.request("GET", `/projects/${projectId}/versions`);
    }
    async createVersion(projectId, input) {
        return this.request("POST", `/projects/${projectId}/versions`, input);
    }
    async getVersion(id) {
        return this.request("GET", `/versions/${id}`);
    }
    async updateVersion(id, input) {
        return this.request("PUT", `/versions/${id}`, input);
    }
    async deleteVersion(id) {
        return this.request("DELETE", `/versions/${id}`);
    }
    // ============================================================
    // Features
    // ============================================================
    async listFeatures() {
        return this.request("GET", "/features");
    }
    async listProjectFeatures(projectId) {
        return this.request("GET", `/projects/${projectId}/features`);
    }
    async listRootFeatures(projectId) {
        return this.request("GET", `/projects/${projectId}/features/roots`);
    }
    async getFeatureTree(projectId) {
        return this.request("GET", `/projects/${projectId}/features/tree`);
    }
    async createFeature(projectId, input) {
        return this.request("POST", `/projects/${projectId}/features`, input);
    }
    async getFeature(id) {
        return this.request("GET", `/features/${id}`);
    }
    async updateFeature(id, input) {
        return this.request("PUT", `/features/${id}`, input);
    }
    async deleteFeature(id) {
        return this.request("DELETE", `/features/${id}`);
    }
    async listChildren(featureId) {
        return this.request("GET", `/features/${featureId}/children`);
    }
    async getFeatureHistory(featureId) {
        return this.request("GET", `/features/${featureId}/history`);
    }
    async listFeatureSessions(featureId) {
        return this.request("GET", `/features/${featureId}/sessions`);
    }
    // ============================================================
    // Sessions
    // ============================================================
    async createSession(input) {
        return this.request("POST", "/sessions", input);
    }
    async getSession(id) {
        return this.request("GET", `/sessions/${id}`);
    }
    async getSessionStatus(id) {
        return this.request("GET", `/sessions/${id}/status`);
    }
    async completeSession(id, input) {
        return this.request("POST", `/sessions/${id}/complete`, input);
    }
    async listSessionTasks(sessionId) {
        return this.request("GET", `/sessions/${sessionId}/tasks`);
    }
    // ============================================================
    // Tasks
    // ============================================================
    async createTask(sessionId, input) {
        return this.request("POST", `/sessions/${sessionId}/tasks`, input);
    }
    async getTask(id) {
        return this.request("GET", `/tasks/${id}`);
    }
    async updateTask(id, input) {
        return this.request("PUT", `/tasks/${id}`, input);
    }
    // ============================================================
    // Project Discovery
    // ============================================================
    /**
     * Find the project that contains the given directory path.
     * Useful for auto-detecting the project from the workspace folder.
     */
    async findProjectByDirectory(directoryPath) {
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
export function createClient(config) {
    return new ManifestClient(config);
}
