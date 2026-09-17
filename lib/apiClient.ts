// API Client with automatic token injection and error handling

const getApiBaseUrl = () => {
    if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
        return process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || 'http://localhost:3001';
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

console.log("API_BASE_URL =", API_BASE_URL);

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
}

class ApiClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getEffectiveBaseUrl(): string {
        if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
            return process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL || 'http://localhost:3001';
        }
        return process.env.NEXT_PUBLIC_API_BASE_URL || this.baseURL || 'http://localhost:3001';
    }

    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        // Get token from localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        let data: any;
        const contentType = response.headers.get('content-type');

        try {
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { message: text || `HTTP ${response.status} ${response.statusText}` };
            }
        } catch (e: any) {
            data = { message: `Failed to parse response: ${e.message}` };
        }

        if (!response.ok) {
            // Handle unauthorized - only redirect if not already on auth or public apply pages
            if (response.status === 401 && typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                const isAuthOrApplyPage = currentPath === '/login' || currentPath.startsWith('/login/') || currentPath.startsWith('/apply/') || currentPath === '/';
                
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
                
                if (!isAuthOrApplyPage) {
                    window.location.href = '/login';
                }
            }

            throw {
                success: false,
                message: typeof data === 'object' && (data?.message || data?.error)
                    ? (data.message || data.error)
                    : `Request failed with status ${response.status}`,
                error: typeof data === 'object' ? data?.error : undefined,
            };
        }

        // If data doesn't have a success property, but response is OK, wrap it
        if (typeof data === 'object' && data !== null && !('success' in data)) {
            return {
                success: true,
                message: 'Success',
                data: data as T
            };
        }

        return data;
    }

    private catchNetworkError(error: any): never {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw {
                success: false,
                message: `Backend server connection failed (${this.getEffectiveBaseUrl()}). Please check if the server is running.`,
            };
        }
        throw error;
    }

    async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
        try {
            const baseUrl = this.getEffectiveBaseUrl();
            const url = new URL(`${baseUrl}${endpoint}`);
            if (params) {
                Object.keys(params).forEach(key => {
                    if (params[key] !== undefined && params[key] !== null) {
                        url.searchParams.append(key, String(params[key]));
                    }
                });
            }

            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: this.getHeaders(),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        try {
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(body),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        try {
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'PATCH',
                headers: this.getHeaders(),
                body: JSON.stringify(body),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        try {
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(body),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            const baseUrl = this.getEffectiveBaseUrl();
            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'DELETE',
                headers: this.getHeaders(),
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }

    async uploadFile<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
        try {
            const baseUrl = this.getEffectiveBaseUrl();
            const headers: HeadersInit = {};

            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('admin_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${baseUrl}${endpoint}`, {
                method: 'POST',
                headers,
                body: formData,
            });

            return await this.handleResponse<T>(response);
        } catch (error) {
            this.catchNetworkError(error);
        }
    }
}

export const apiClient = new ApiClient(API_BASE_URL);
