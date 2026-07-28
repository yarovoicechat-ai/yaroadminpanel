(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__d9a27306._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/admin/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/admin/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
function middleware(request) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl.clone();
    // Check host header or x-forwarded-host for subdomains
    const hostParts = hostname.split(':')[0].split('.');
    // Subdomain rewrite handling (DO NOT rewrite main 'admin' subdomain when accessing dashboard)
    if (hostParts.length >= 2) {
        const subdomain = hostParts[0].toLowerCase();
        if (subdomain === 'agency') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/agency';
                return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
            }
        } else if (subdomain === 'operator') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/operator';
                return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
            }
        } else if (subdomain === 'adminjoin' || subdomain === 'team-leader' || subdomain === 'teamleader') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/admin';
                return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
            }
        } else if (subdomain === 'support' || subdomain === 'customer-service' || subdomain === 'help') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/customer-service';
                return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
            }
        } else if (subdomain === 'super-admin' || subdomain === 'superadmin') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/super-admin';
                return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
            }
        } else if (subdomain === 'host') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/host';
                return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].rewrite(url);
            }
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$admin$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        '/',
        '/register',
        '/apply',
        '/apply/:path*'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__d9a27306._.js.map