import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl.clone();

    // Check host header or x-forwarded-host for subdomains
    const hostParts = hostname.split(':')[0].split('.');

    // Subdomain rewrite handling (DO NOT rewrite main 'admin' subdomain when accessing dashboard)
    if (hostParts.length >= 2) {
        const subdomain = hostParts[0].toLowerCase();
        const hasReferrerOrApplyParam = url.searchParams.has('referrer') || url.searchParams.has('role') || url.searchParams.has('apply');
        const isApplyRoute = url.pathname === '/apply' || url.pathname === '/register' || url.pathname.startsWith('/apply/');
        const isLoginRoute = url.pathname === '/login' || url.pathname.startsWith('/login/');
        const isHomeRoute = url.pathname === '/';

        // 1. BD Leader Subdomain (bdleader.yaroapp.in / bd-leader.yaroapp.in)
        if (subdomain === 'bdleader' || subdomain === 'bd-leader') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/bd-leader';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/bd-leader';
                return NextResponse.rewrite(url);
            }
        }

        // 2. BD Subdomain (bd.yaroapp.in)
        else if (subdomain === 'bd') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/bd';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/bd';
                return NextResponse.rewrite(url);
            }
        }

        // 3. Operator Subdomain (operator.yaroapp.in)
        else if (subdomain === 'operator') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/operator';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/operator';
                return NextResponse.rewrite(url);
            }
        }

        // 4. Agency Subdomain (agency.yaroapp.in)
        else if (subdomain === 'agency') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/agency';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/agency';
                return NextResponse.rewrite(url);
            }
        }

        // 5. Super Admin Subdomain (superadmin.yaroapp.in / super-admin.yaroapp.in)
        else if (subdomain === 'super-admin' || subdomain === 'superadmin') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/super-admin';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/super-admin';
                return NextResponse.rewrite(url);
            }
        }

        // 6. Owner Subdomain (owner.yaroapp.in)
        else if (subdomain === 'owner') {
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/owner';
                return NextResponse.rewrite(url);
            }
        }

        // 7. Coin Seller Subdomain (seller.yaroapp.in / coinseller.yaroapp.in)
        else if (subdomain === 'seller' || subdomain === 'coinseller') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/seller';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/seller';
                return NextResponse.rewrite(url);
            }
        }

        // 8. Customer Support Subdomain (support.yaroapp.in / customer-service.yaroapp.in / help.yaroapp.in)
        else if (subdomain === 'support' || subdomain === 'customer-service' || subdomain === 'help') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/customer-service';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/customer-service';
                return NextResponse.rewrite(url);
            }
        }

        // 9. Host Subdomain (host.yaroapp.in)
        else if (subdomain === 'host') {
            if (isApplyRoute || isHomeRoute) {
                url.pathname = '/apply/host';
                return NextResponse.rewrite(url);
            }
        }

        // 10. Admin join alias (adminjoin.yaroapp.in / team-leader.yaroapp.in)
        else if (subdomain === 'adminjoin' || subdomain === 'team-leader' || subdomain === 'teamleader') {
            if (isApplyRoute || (isHomeRoute && hasReferrerOrApplyParam)) {
                url.pathname = '/apply/admin';
                return NextResponse.rewrite(url);
            }
            if (isLoginRoute || isHomeRoute) {
                url.pathname = '/login/admin';
                return NextResponse.rewrite(url);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/register', '/apply', '/apply/:path*', '/login', '/login/:path*'],
};
