'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface PermissionGateProps {
  allowedRoles?: string[];
  action?: 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'APPROVE' | 'REJECT' | 'EXPORT' | 'BLOCK' | 'SUSPEND' | 'REFUND' | 'ADJUST_WALLET';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  allowedRoles = [],
  action,
  fallback = null,
  children
}: PermissionGateProps) {
  const { user } = useAuth();

  if (!user) return <>{fallback}</>;

  const userRole = String(user.role || '').toLowerCase();

  // Owner bypass
  if (userRole === 'owner') return <>{children}</>;

  // Check role whitelist
  if (allowedRoles.length > 0) {
    const hasRole = allowedRoles.some(r => r.toLowerCase() === userRole);
    if (!hasRole) return <>{fallback}</>;
  }

  // Check sensitive action permissions
  if (action === 'ADJUST_WALLET' || action === 'REFUND') {
    if (!['owner', 'superadmin', 'admin'].includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  if (action === 'DELETE' || action === 'BLOCK') {
    if (!['owner', 'superadmin', 'admin', 'operator'].includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
