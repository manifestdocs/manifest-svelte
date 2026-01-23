/**
 * API Error class for HTTP errors from the Manifest API.
 */
export class ApiError extends Error {
    status;
    statusText;
    constructor(status, statusText, message) {
        super(message);
        this.status = status;
        this.statusText = statusText;
        this.name = 'ApiError';
    }
}
