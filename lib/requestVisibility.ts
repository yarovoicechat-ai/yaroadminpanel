export type ManagedRequestRole = 'admin' | 'agency' | 'host' | 'customerSupport';

const normalizeRole = (role?: string) =>
    String(role || '').toLowerCase().replace(/[\s_-]+/g, '');

export const canViewRequestSecrets = (
    viewerRole: string | undefined,
    targetRole: ManagedRequestRole,
) => {
    const viewer = normalizeRole(viewerRole);

    if (!viewer) return false;
    if (viewer === 'superadmin') return false;
    if (viewer === 'admin') return targetRole === 'admin';
    if (viewer === 'agency') return targetRole !== 'host';
    return true;
};

export const redactApprovalCredentials = <T extends { password?: string }>(
    credentials: T,
    canView: boolean,
): T => {
    if (canView) return credentials;
    const visibleCredentials = { ...credentials };
    delete visibleCredentials.password;
    return visibleCredentials;
};
