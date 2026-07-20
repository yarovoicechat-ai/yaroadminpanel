export interface EnterprisePlugin {
    id: string;
    name: string;
    version: string;
    description: string;
    isEnabled: boolean;
    routes: { path: string; label: string; icon: string }[];
    requiredPermissions: string[];
}

const registeredPlugins: EnterprisePlugin[] = [
    {
        id: 'plugin-hr',
        name: 'Human Resource Management (HR)',
        version: '1.0.0',
        description: 'Employee lifecycle, designations, attendance, leave management',
        isEnabled: true,
        routes: [{ path: '/employees', label: 'HR Directory', icon: 'UserCheck' }],
        requiredPermissions: ['hr.manage']
    },
    {
        id: 'plugin-finance',
        name: 'Finance & Earnings Engine',
        version: '1.0.0',
        description: 'Recharge rates, withdrawals, diamond-coin conversions',
        isEnabled: true,
        routes: [{ path: '/finance', label: 'Finance Hub', icon: 'DollarSign' }],
        requiredPermissions: ['finance.manage']
    },
    {
        id: 'plugin-compliance',
        name: 'Legal & Compliance Audit',
        version: '1.0.0',
        description: 'Document digital signatures, NDA verification, GDPR/KYC logs',
        isEnabled: true,
        routes: [{ path: '/compliance', label: 'Compliance Audit', icon: 'ShieldCheck' }],
        requiredPermissions: ['compliance.view']
    }
];

export function getActivePlugins(): EnterprisePlugin[] {
    return registeredPlugins.filter(p => p.isEnabled);
}

export function registerPlugin(plugin: EnterprisePlugin): void {
    const existingIdx = registeredPlugins.findIndex(p => p.id === plugin.id);
    if (existingIdx >= 0) {
        registeredPlugins[existingIdx] = plugin;
    } else {
        registeredPlugins.push(plugin);
    }
}
