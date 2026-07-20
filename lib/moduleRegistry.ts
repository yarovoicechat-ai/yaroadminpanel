export interface EnterpriseModule {
    key: string;
    name: string;
    description: string;
    icon: string;
    defaultRoute: string;
    actions: string[];
}

export const ENTERPRISE_MODULES: EnterpriseModule[] = [
    { key: 'users', name: 'Users Management', description: 'User profiles, verification & bans', icon: 'Users', defaultRoute: '/users', actions: ['View', 'Create', 'Update', 'Delete'] },
    { key: 'hosts', name: 'Live Host Management', description: 'Host verification, level & agency assignments', icon: 'Video', defaultRoute: '/hosts', actions: ['View', 'Approve', 'Reject', 'Update'] },
    { key: 'calls', name: 'Call Monitoring', description: 'Real-time call analytics & logs', icon: 'Phone', defaultRoute: '/calls', actions: ['View', 'Export'] },
    { key: 'recruitment', name: 'Recruitment Portal', description: 'Multi-subdomain recruitment & workflow', icon: 'Briefcase', defaultRoute: '/recruitment', actions: ['View', 'Create', 'Approve', 'Reject', 'Export'] },
    { key: 'employees', name: 'Employee Directory', description: 'Staff, departments & organizational hierarchy', icon: 'UserCheck', defaultRoute: '/employees', actions: ['View', 'Create', 'Update'] },
    { key: 'finance', name: 'Finance & Earnings', description: 'Recharge, withdrawals & coin price settings', icon: 'DollarSign', defaultRoute: '/finance', actions: ['View', 'Approve', 'Export'] },
    { key: 'security', name: 'Security & Audit Logs', description: 'RBAC permissions, audit logs & session control', icon: 'ShieldCheck', defaultRoute: '/security/permissions', actions: ['View', 'Create', 'Update', 'Delete'] },
    { key: 'settings', name: 'Enterprise Settings', description: 'Form builder, i18n & feature flags', icon: 'Settings', defaultRoute: '/settings/form-builder', actions: ['View', 'Update'] },
];
