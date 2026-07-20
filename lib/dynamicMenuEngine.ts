import { ENTERPRISE_MODULES, EnterpriseModule } from './moduleRegistry';

export interface GeneratedMenuItem {
    name: string;
    href: string;
    icon: string;
    category: string;
}

export function generateDynamicMenuItems(role: string, userPermissions: string[] = []): GeneratedMenuItem[] {
    const userRole = (role || '').toLowerCase();

    return ENTERPRISE_MODULES.filter(module => {
        // Owner and SuperAdmin see all modules
        if (userRole === 'owner' || userRole === 'superadmin') return true;

        // Check explicit permission
        if (userPermissions.length > 0) {
            return userPermissions.some(p => p.toLowerCase() === module.key.toLowerCase());
        }

        // Role fallbacks
        if (userRole === 'admin') return ['users', 'hosts', 'recruitment', 'employees', 'finance'].includes(module.key);
        if (userRole === 'operator') return ['users', 'hosts', 'recruitment'].includes(module.key);
        if (userRole === 'agency') return ['hosts', 'recruitment', 'finance'].includes(module.key);

        return false;
    }).map(module => ({
        name: module.name,
        href: module.defaultRoute,
        icon: module.icon,
        category: module.name
    }));
}
