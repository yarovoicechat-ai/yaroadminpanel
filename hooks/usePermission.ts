'use client';

import { useAuth } from '@/contexts/AuthContext';

export interface PermissionCheck {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
    canApprove: boolean;
    canReject: boolean;
    canExport: boolean;
}

export function usePermission(moduleName?: string): PermissionCheck {
    const { user } = useAuth();

    if (!user) {
        return {
            canView: false,
            canCreate: false,
            canUpdate: false,
            canDelete: false,
            canApprove: false,
            canReject: false,
            canExport: false,
        };
    }

    const role = (user.role || '').toLowerCase();

    // Owner and SuperAdmin have full access to all modules and actions
    if (role === 'owner' || role === 'superadmin') {
        return {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: true,
            canApprove: true,
            canReject: true,
            canExport: true,
        };
    }

    // Role-based capabilities matrix
    if (role === 'admin') {
        return {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: false,
            canApprove: true,
            canReject: true,
            canExport: true,
        };
    }

    if (role === 'operator') {
        return {
            canView: true,
            canCreate: false,
            canUpdate: true,
            canDelete: false,
            canApprove: false,
            canReject: false,
            canExport: false,
        };
    }

    if (role === 'agency') {
        return {
            canView: true,
            canCreate: true,
            canUpdate: true,
            canDelete: false,
            canApprove: false,
            canReject: false,
            canExport: false,
        };
    }

    return {
        canView: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        canReject: false,
        canExport: false,
    };
}
