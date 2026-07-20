import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl.clone();
    const searchParams = request.nextUrl.search; // preserves ?referrer=... or ?ref=...

    const hostParts = hostname.split('.');

    // Subdomain rewrite handling
    if (hostParts.length > 2) {
        const subdomain = hostParts[0].toLowerCase();

        if (subdomain === 'agency') {
            if (url.pathname === '/' || url.pathname === '/register') {
                url.pathname = '/apply/agency';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'operator') {
            if (url.pathname === '/' || url.pathname === '/register') {
                url.pathname = '/apply/operator';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'super-admin' || subdomain === 'superadmin') {
            if (url.pathname === '/' || url.pathname === '/register') {
                url.pathname = '/apply/super-admin';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'admin' || subdomain === 'team-leader' || subdomain === 'teamleader') {
            if (url.pathname === '/' || url.pathname === '/register') {
                url.pathname = '/apply/admin';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'host') {
            if (url.pathname === '/' || url.pathname === '/register') {
                url.pathname = '/apply/host';
                return NextResponse.rewrite(url);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/register', '/apply/:path*'],
};
