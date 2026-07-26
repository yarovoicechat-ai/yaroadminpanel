'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission } from '@/config/rbacMatrix';

export interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    moduleName: string;
    actionName: string;
    fallback?: React.ReactNode;
}

export const PermissionButton: React.FC<PermissionButtonProps> = ({
    moduleName,
    actionName,
    fallback = null,
    children,
    ...props
}) => {
    const { user } = useAuth();
    const role = user?.role || 'user';

    const allowed = hasPermission(role, moduleName, actionName);

    if (!allowed) {
        return <>{fallback}</>;
    }

    return <button {...props}>{children}</button>;
};

export const usePermission = () => {
    const { user } = useAuth();
    const role = user?.role || 'user';

    return {
        role,
        can: (moduleName: string, actionName: string) => hasPermission(role, moduleName, actionName),
        isOwner: role === 'owner',
    };
};
