/**
 * API Error class for HTTP errors from the Manifest API.
 */
export declare class ApiError extends Error {
    status: number;
    statusText: string;
    constructor(status: number, statusText: string, message: string);
}
//# sourceMappingURL=error.d.ts.map