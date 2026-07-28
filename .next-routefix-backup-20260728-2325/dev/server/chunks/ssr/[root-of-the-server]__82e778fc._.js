module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/admin/lib/apiClient.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// API Client with automatic token injection and error handling
__turbopack_context__.s([
    "apiClient",
    ()=>apiClient
]);
const getApiBaseUrl = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        return "TURBOPACK compile-time value", "https://api.mithichat.live";
    }
    //TURBOPACK unreachable
    ;
};
const API_BASE_URL = getApiBaseUrl();
console.log("API_BASE_URL =", API_BASE_URL);
class ApiClient {
    baseURL;
    constructor(baseURL){
        this.baseURL = baseURL;
    }
    getEffectiveBaseUrl() {
        if ("TURBOPACK compile-time truthy", 1) {
            return "TURBOPACK compile-time value", "https://api.mithichat.live";
        }
        //TURBOPACK unreachable
        ;
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        // Get token from localStorage
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return headers;
    }
    async handleResponse(response) {
        let data;
        const contentType = response.headers.get('content-type');
        try {
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = {
                    message: text || `HTTP ${response.status} ${response.statusText}`
                };
            }
        } catch (e) {
            data = {
                message: `Failed to parse response: ${e.message}`
            };
        }
        if (!response.ok) {
            // Handle unauthorized - only redirect if not already on auth or public apply pages
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            throw {
                success: false,
                message: typeof data === 'object' && (data?.message || data?.error) ? data.message || data.error : `Request failed with status ${response.status}`,
                error: typeof data === 'object' ? data?.error : undefined
            };
        }
        // If data doesn't have a success property, but response is OK, wrap it
        if (typeof data === 'object' && data !== null && !('success' in data)) {
            return {
                success: true,
                message: 'Success',
                data: data
            };
        }
        return data;
    }
    async get(endpoint, params) {
        const baseUrl = this.getEffectiveBaseUrl();
        const url = new URL(`${baseUrl}${endpoint}`);
        if (params) {
            Object.keys(params).forEach((key)=>{
                if (params[key] !== undefined && params[key] !== null) {
                    url.searchParams.append(key, String(params[key]));
                }
            });
        }
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    async post(endpoint, body) {
        const baseUrl = this.getEffectiveBaseUrl();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    }
    async patch(endpoint, body) {
        const baseUrl = this.getEffectiveBaseUrl();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    }
    async put(endpoint, body) {
        const baseUrl = this.getEffectiveBaseUrl();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body)
        });
        return this.handleResponse(response);
    }
    async delete(endpoint) {
        const baseUrl = this.getEffectiveBaseUrl();
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        return this.handleResponse(response);
    }
    async uploadFile(endpoint, formData) {
        const baseUrl = this.getEffectiveBaseUrl();
        const headers = {};
        // Get token from localStorage (don't set Content-Type for FormData)
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const response = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });
        return this.handleResponse(response);
    }
}
const apiClient = new ApiClient(API_BASE_URL);
}),
"[project]/admin/lib/apiEndpoints.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Centralized API endpoint definitions
__turbopack_context__.s([
    "API_ENDPOINTS",
    ()=>API_ENDPOINTS
]);
const API_ENDPOINTS = {
    // Admin Authentication
    ADMIN: {
        LOGIN: '/api/admin/login',
        LOGOUT: '/api/admin/logout',
        PROFILE: '/api/admin/profile',
        UPDATE_PROFILE: '/api/admin/profile',
        SETTINGS: '/api/admin/settings',
        UPDATE_SETTINGS: '/api/admin/settings',
        // SuperAdmin: Manage Admins (legacy)
        CREATE_ADMIN: '/api/admin/create-admin',
        LIST_ADMINS: '/api/admin/list-admins',
        BLOCK_ADMIN: (id)=>`/api/admin/block-admin/${id}`,
        // Role Hierarchy: Employee Management
        CREATE_EMPLOYEE: '/api/admin/employees/create',
        LIST_EMPLOYEES: '/api/admin/employees/list',
        BLOCK_EMPLOYEE: (id)=>`/api/admin/employees/block/${id}`,
        OVERRIDE_LINKAGE: (id)=>`/api/admin/employees/override/${id}`
    },
    // Public Application Forms
    PUBLIC: {
        APPLY: '/api/public/apply',
        VERIFY_CODE: (code)=>`/api/public/verify-code/${code}`
    },
    // Dashboard Analytics
    DASHBOARD: {
        STATS: '/api/admin/dashboard/stats',
        REVENUE_CHART: '/api/admin/dashboard/revenue-chart',
        EARNINGS_CHART: '/api/admin/dashboard/earnings-chart',
        CALL_TRENDS: '/api/admin/dashboard/call-trends',
        COIN_DISTRIBUTION: '/api/admin/dashboard/coin-distribution'
    },
    // User Management
    USERS: {
        LIST: '/api/user',
        GET: (id)=>`/api/user/${id}`,
        UPDATE: (id)=>`/api/user/${id}`,
        DELETE: (id)=>`/api/user/${id}`,
        BLOCK: (id)=>`/api/user/block/${id}`,
        UNBLOCK: (id)=>`/api/user/unblock/${id}`,
        UPLOAD_IMAGE: (id)=>`/api/user/upload/${id}`
    },
    // Host Management
    HOSTS: {
        LIST: '/api/admin/hosts/list',
        APPLICATIONS: '/api/admin/hosts/applications',
        GET: (id)=>`/api/host/${id}`,
        APPROVE: (id)=>`/api/admin/hosts/approve/${id}`,
        BLOCK: (id)=>`/api/admin/hosts/block/${id}`,
        SEND_FORM: (id)=>`/api/host/send-form/${id}`
    },
    // Call Management
    CALLS: {
        HISTORY: '/api/admin/calls/history',
        RANKING: '/api/call/ranking',
        LEVELS: '/api/call/level'
    },
    // Reports/Moderation
    REPORTS: {
        LIST: '/api/admin/reports',
        GET: (id)=>`/api/admin/reports/${id}`,
        RESOLVE: (id)=>`/api/admin/reports/${id}/resolve`,
        DISMISS: (id)=>`/api/admin/reports/${id}/dismiss`
    },
    // Coin Pricing
    COINS: {
        LIST: '/api/coinsPrice',
        GET: (id)=>`/api/coinsPrice/${id}`,
        CREATE: '/api/coinsPrice',
        UPDATE: (id)=>`/api/coinsPrice/${id}`,
        DELETE: (id)=>`/api/coinsPrice/${id}`
    },
    // Frames/Levels
    FRAMES: {
        LIST: '/api/frames',
        CREATE: '/api/frames',
        DELETE: (id)=>`/api/frames/${id}`
    },
    // Avatars
    AVATARS: {
        LIST: (gender)=>`/api/avatar/${gender}`,
        CREATE: '/api/avatar',
        DELETE: (id)=>`/api/avatar/${id}`
    },
    // Chat
    CHAT: {
        CONVERSATIONS: '/api/chat/conversations',
        MESSAGES: '/api/chat/messages'
    },
    // Withdrawals
    WITHDRAWALS: {
        PENDING: '/api/withdrawal/pending',
        PROCESS: '/api/withdrawal/process'
    },
    KYC: {
        PENDING: '/api/kyc/pending',
        PROCESS: '/api/kyc/update-status'
    },
    // Gifts
    GIFTS: {
        LIST: '/api/gift/admin-all',
        CREATE: '/api/gift/create',
        TOGGLE: (id)=>`/api/gift/${id}/toggle`,
        DELETE: (id)=>`/api/gift/${id}`
    },
    // Events
    EVENTS: {
        BROADCAST: '/api/admin/events/broadcast'
    }
};
}),
"[project]/admin/lib/auth.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getUser",
    ()=>getUser,
    "login",
    ()=>login,
    "logout",
    ()=>logout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/apiClient.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiEndpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/apiEndpoints.ts [app-ssr] (ecmascript)");
;
;
function normalizeUser(user) {
    return {
        id: user._id || user.id || user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        mithiId: user.mithiId || user.meethiId,
        meethiId: user.meethiId || user.mithiId,
        employeeCode: user.employeeCode,
        specialCode: user.specialCode,
        referralCode: user.referralCode
    };
}
async function login(email, password) {
    try {
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].post(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiEndpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].ADMIN.LOGIN, {
            email,
            password
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
                refreshToken
            };
        }
        throw new Error('Login failed');
    } catch (error) {
        throw new Error(error.message || 'Invalid credentials');
    }
}
async function logout() {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].post(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiEndpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].ADMIN.LOGOUT);
    } catch (error) {
    // Continue with logout even if API call fails
    } finally{
        // Clear local storage
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        localStorage.removeItem('admin_user');
    }
}
async function getUser(token) {
    const storedUser = localStorage.getItem('admin_user');
    try {
        // Refresh from the API so server-side role/code updates are reflected
        // without forcing the user to log out and back in.
        const response = await __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiClient$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiClient"].get(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$apiEndpoints$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["API_ENDPOINTS"].ADMIN.PROFILE);
        if (response.success && response.data) {
            const user = response.data;
            localStorage.setItem('admin_user', JSON.stringify(user));
            return normalizeUser(user);
        }
        return storedUser ? normalizeUser(JSON.parse(storedUser)) : null;
    } catch  {
        // Keep the authenticated session usable during a temporary API outage.
        return storedUser ? normalizeUser(JSON.parse(storedUser)) : null;
    }
}
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[project]/admin/contexts/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/lib/auth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AuthProvider({ children }) {
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initAuth = async ()=>{
            const token = localStorage.getItem('admin_token');
            if (token) {
                try {
                    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUser"])(token);
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
    const login = async (username, password)=>{
        const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["login"])(username, password);
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
    };
    const logout = async ()=>{
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$lib$2f$auth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["logout"])();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_refresh_token');
        document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        document.cookie = 'admin_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        setUser(null);
        router.push('/login');
    };
    // Protect routes mechanism
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isLoading && !user && pathname !== '/login') {
        //router.push('/login'); // Let Middleware handle this for better UX, but this is a falback
        }
    }, [
        user,
        isLoading,
        pathname,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            login,
            logout
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/admin/contexts/AuthContext.tsx",
        lineNumber: 80,
        columnNumber: 9
    }, this);
}
function useAuth() {
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
}),
"[project]/admin/components/Providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/contexts/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
'use client';
;
;
;
function Providers({ children }) {
    console.log("Providers mounting");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthProvider"], {
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
                richColors: true,
                position: "top-right",
                theme: "dark"
            }, void 0, false, {
                fileName: "[project]/admin/components/Providers.tsx",
                lineNumber: 11,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/admin/components/Providers.tsx",
        lineNumber: 9,
        columnNumber: 9
    }, this);
}
}),
"[project]/admin/components/ThemeProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
function ThemeProvider({ children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        ...props,
        children: children
    }, void 0, false, {
        fileName: "[project]/admin/components/ThemeProvider.tsx",
        lineNumber: 18,
        columnNumber: 12
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__82e778fc._.js.map