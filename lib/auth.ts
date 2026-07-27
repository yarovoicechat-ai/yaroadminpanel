import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './apiEndpoints';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'superAdmin' | 'admin' | 'coinSeller' | 'host' | 'user';
    mithiId?: string;
    meethiId?: string;
    employeeCode?: string;
    specialCode?: string;
    referralCode?: string;
}

function normalizeUser(user: any): User {
    return {
        id: user._id || user.id || user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        mithiId: user.mithiId || user.meethiId,
        meethiId: user.meethiId || user.mithiId,
        employeeCode: user.employeeCode,
        specialCode: user.specialCode,
        referralCode: user.referralCode,
    };
}

export async function login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    try {
        const response = await apiClient.post(API_ENDPOINTS.ADMIN.LOGIN, {
            email,
            password,
        });

        if (response.success && response.data) {
            const { user, token, refreshToken } = response.data;

            // Store token and user in localStorage
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_refresh_token', refreshToken);
            localStorage.setItem('admin_user', JSON.stringify(user));

            return {
                user: normalizeUser(user),

                token,
                refreshToken,
            };
        }

        throw new Error('Login failed');
    } catch (error: any) {
        throw new Error(error.message || 'Invalid credentials');
    }
}

export async function logout(): Promise<void> {
    try {
        await apiClient.post(API_ENDPOINTS.ADMIN.LOGOUT);
    } catch (error) {
        // Continue with logout even if API call fails
    } finally {
        // Clear local storage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
    }
}

export async function getUser(token: string): Promise<User | null> {
    const storedUser = localStorage.getItem('admin_user');
    try {
        // Refresh from the API so server-side role/code updates are reflected
        // without forcing the user to log out and back in.
        const response = await apiClient.get(API_ENDPOINTS.ADMIN.PROFILE);
        if (response.success && response.data) {
            const user = response.data;
            localStorage.setItem('admin_user', JSON.stringify(user));
            return normalizeUser(user);
        }

        return storedUser ? normalizeUser(JSON.parse(storedUser)) : null;
    } catch {
        // Keep the authenticated session usable during a temporary API outage.
        return storedUser ? normalizeUser(JSON.parse(storedUser)) : null;
    }
}