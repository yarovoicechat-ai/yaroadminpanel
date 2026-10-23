'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, getUser, login as apiLogin, logout as apiLogout } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (u: string, p: string, requiredRole?: string) => Promise<User>;
    logout: () => Promise<void>;
    updateUserDP: (newDPUrl: string) => void;
    updateUserPhone: (newPhone: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('admin_token');
            if (token) {
                try {
                    const user = await getUser(token);
                    if (user) {
                        setUser(user);
                    } else {
                        localStorage.removeItem('admin_token');
                        localStorage.removeItem('admin_refresh_token');
                    }
                } catch (error) {
                    console.error("Auth check failed", error);
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_refresh_token');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (username: string, password: string, requiredRole?: string): Promise<User> => {
        const data = await apiLogin(username, password) as any;
        const loggedInUserRole = String(data.user?.role || '').toLowerCase();

        if (requiredRole) {
            const normalizedReq = requiredRole.toLowerCase().replace(/[-_\s]/g, '');
            const normalizedUserRole = loggedInUserRole.replace(/[-_\s]/g, '');

            const roleEquivalents: Record<string, string[]> = {
                owner: ['owner'],
                superadmin: ['superadmin', 'owner'],
                admin: ['admin', 'owner'],
                operator: ['operator'],
                agency: ['agency'],
                bdleader: ['bdleader', 'owner'],
                bd: ['bd'],
                seller: ['coinseller', 'seller'],
                coinseller: ['coinseller', 'seller'],
                customerservice: ['customersupport', 'customerservice', 'support'],
                customersupport: ['customersupport', 'customerservice', 'support'],
            };

            const allowed = roleEquivalents[normalizedReq] || [normalizedReq];
            if (!allowed.includes(normalizedUserRole)) {
                // Clear any stored token immediately
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_refresh_token');
                localStorage.removeItem('admin_user');
                document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                document.cookie = 'admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                throw new Error(`Access Denied: You cannot login to the ${requiredRole.toUpperCase()} portal with a ${data.user?.role || 'different'} account. Please use your designated portal.`);
            }
        }

        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_refresh_token', data.refreshToken);
        // Set cookie for middleware with SameSite=Lax for seamless route transitions
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        document.cookie = `admin_refresh_token=${data.refreshToken}; path=/; max-age=86400; SameSite=Lax`;
        setUser(data.user);
        // If first login, force password change before dashboard access
        if (data.mustChangePassword === true) {
            router.push('/change-password');
        } else {
            router.push('/dashboard');
        }
        return data.user;
    };

    const logout = async () => {
        await apiLogout();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setUser(null);
        router.push('/login');
    };

    // Protect routes mechanism
    useEffect(() => {
        if (!isLoading && !user && pathname !== '/login') {
            //router.push('/login'); // Let Middleware handle this for better UX, but this is a falback
        }
    }, [user, isLoading, pathname, router]);

    const updateUserDP = (newDPUrl: string) => {
        if (user) {
            const updated = { ...user, profilePhoto: newDPUrl, avatar: newDPUrl };
            setUser(updated as any);
            localStorage.setItem('admin_user', JSON.stringify(updated));
        }
    };

    const updateUserPhone = (newPhone: string) => {
        if (user) {
            const updated = { ...user, phone: newPhone, phoneNumber: newPhone, whatsappNumber: newPhone };
            setUser(updated as any);
            localStorage.setItem('admin_user', JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserDP, updateUserPhone }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
