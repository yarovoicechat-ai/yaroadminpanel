export interface RoleDefinition {
  name: string;
  allowedRoutes: string[];
  allowedModules: string[];
  allowedActions: string[];
}

const SUPER_ADMIN_DENIED_ROUTES = [
  '/users',
  '/super-admins',
  '/admins',
  '/avatar-requests',
  '/bios',
  '/host-management',
  '/recharges',
  '/withdrawals',
  '/sellers',
];

const ADMIN_DENIED_ROUTES = [
  '/users',
  '/super-admins',
  '/admins',
  '/avatar-requests',
  '/bios',
  '/host-management',
  '/recharges',
  '/withdrawals',
  '/sellers',
];

const OPERATOR_DENIED_ROUTES = [
  '/operators',
  '/organization',
  '/tasks',
  '/events',
  '/settings',
  '/security',
  '/ai',
  '/analytics/live-map',
  '/health',
  '/owner',
  '/finance/ledger',
  '/compliance',
  '/logs',
  '/api-center',
  '/sellers',
  '/deletions',
  '/bans',
  '/messages',
  '/kyc',
  '/withdrawals',
  '/moderation',
];

export const ROLE_PERMISSION_MATRIX: Record<string, RoleDefinition> = {
  owner: {
    name: 'Owner',
    allowedRoutes: ['*'],
    allowedModules: ['*'],
    allowedActions: ['*'],
  },

  superAdmin: {
    name: 'Super Admin',
    allowedRoutes: ['*'],
    allowedModules: ['*'],
    allowedActions: ['*'],
  },

  admin: {
    name: 'Admin',
    allowedRoutes: ['*'],
    allowedModules: ['*'],
    allowedActions: ['*'],
  },

  operator: {
    name: 'Operator',
    allowedRoutes: [
      '/dashboard',
      '/users',
      '/recharges',
      '/recharges/user',
      '/recharges/seller',
      '/admins',
      '/admins/add',
      '/admins/create',
      '/admins/request',
      '/ads',
      '/agencies',
      '/agencies/add',
      '/agencies/create',
      '/agencies/request',
      '/banners',
      '/calls',
      '/cms',
      '/customer-support',
      '/customer-support/add',
      '/customer-support/create',
      '/customer-support/list',
      '/customer-support/request',
      '/employees',
      '/help-support',
      '/host-levels',
      '/host-management',
      '/hosts',
      '/hosts/add',
      '/hosts/create',
      '/avatar-requests',
      '/bios',
      '/hosts/request',
      '/profile',
      '/referrals',
      '/referrals/links',
      '/reports',
      '/rooms',
      '/super-admins',
      '/super-admins/create',
      '/super-admins/request',
    ],
    allowedModules: [
      'Dashboard',
      'Users',
      'Finance',
      'Recharge',
      'SuperAdmin',
      'Admin',
      'Agency',
      'Host',
      'CustomerSupport',
      'Reports',
      'HelpSupport',
      'Settings',
      'Calls',
      'Rooms',
      'Banner',
      'HostLevels',
      'VIP',
      'CMS',
      'Ads',
      'Employees',
      'Profile',
    ],
    allowedActions: ['*'],
  },

  agency: {
    name: 'Agency',
    allowedRoutes: [
      '/dashboard',
      '/referrals',
      '/referrals/links',
      '/hosts/create',
      '/hosts/request',
      '/hosts',
      '/my-hosts',
      '/host-management',
      '/verification',
      '/agency/wallet',
      '/wallet',
      '/agency/commission',
      '/commission',
      '/agency/reports',
      '/reports',
      '/profile',
    ],
    allowedModules: [
      'Dashboard',
      'Host',
      'Wallet',
      'Commission',
      'Reports',
      'Profile',
    ],
    allowedActions: [
      'view',
      'create',
      'edit',
      'export',
    ],
  },

  host: {
    name: 'Host',
    allowedRoutes: [], // Web Login Disabled (HTTP 403)
    allowedModules: [],
    allowedActions: [],
  },

  coinSeller: {
    name: 'Coin Seller',
    allowedRoutes: [
      '/dashboard',
      '/referrals',
      '/referrals/links',
      '/seller/wallet',
      '/wallet',
      '/recharges/user',
      '/recharges/seller',
      '/seller/transactions',
      '/transactions',
      '/seller/reports',
      '/reports',
      '/profile',
    ],
    allowedModules: [
      'Dashboard',
      'Wallet',
      'Recharge',
      'Transactions',
      'Reports',
      'Profile',
    ],
    allowedActions: [
      'view',
      'recharge',
      'export',
    ],
  },

  customerSupport: {
    name: 'Customer Support',
    allowedRoutes: [
      '/dashboard',
      '/referrals',
      '/referrals/links',
      '/help-support',
      '/support-tickets',
      '/reports',
      '/complaints',
      '/profile',
    ],
    allowedModules: [
      'Dashboard',
      'CustomerSupport',
      'Complaints',
      'Reports',
      'Profile',
    ],
    allowedActions: [
      'view',
      'search',
      'reply',
      'export',
    ],
  },
};

/**
 * Check if a route is allowed for a given role
 */
export const isRouteAllowed = (role: string, route: string): boolean => {
  if (!role || role === 'owner') return true;
  const roleDef = ROLE_PERMISSION_MATRIX[role];
  if (!roleDef) return true;

  const path = route.split('?')[0].split('#')[0];

  if (role === 'superAdmin' && SUPER_ADMIN_DENIED_ROUTES.some(
    (denied) => path === denied || path.startsWith(`${denied}/`)
  )) {
    return false;
  }

  if (role === 'admin' && ADMIN_DENIED_ROUTES.some(
    (denied) => path === denied || path.startsWith(`${denied}/`)
  )) {
    return false;
  }

  if (role === 'operator' && OPERATOR_DENIED_ROUTES.some(
    (denied) => path === denied || path.startsWith(`${denied}/`)
  )) {
    return false;
  }

  if (roleDef.allowedRoutes.includes('*')) return true;

  return roleDef.allowedRoutes.some((allowed) => {
    if (allowed === path) return true;
    if (allowed.endsWith('/*') && path.startsWith(allowed.slice(0, -2))) return true;
    if (path.startsWith(allowed + '/')) return true;
    return false;
  });
};

/**
 * Check if an action is permitted for a role on a module
 */
export const hasPermission = (role: string, moduleName: string, actionName: string): boolean => {
  const roleDef = ROLE_PERMISSION_MATRIX[role];
  if (!roleDef) return false;
  if (roleDef.allowedActions.includes('*')) return true;

  const moduleMatch = roleDef.allowedModules.includes('*') || roleDef.allowedModules.includes(moduleName);
  const actionMatch = roleDef.allowedActions.includes(actionName) || roleDef.allowedActions.includes('manage');

  return moduleMatch && actionMatch;
};
