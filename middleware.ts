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

        if (subdomain === 'agency') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/agency';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'operator') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/operator';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'adminjoin' || subdomain === 'team-leader' || subdomain === 'teamleader') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/admin';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'support' || subdomain === 'customer-service' || subdomain === 'help') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/customer-service';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'super-admin' || subdomain === 'superadmin') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/super-admin';
                return NextResponse.rewrite(url);
            }
        } else if (subdomain === 'host') {
            if (url.pathname === '/' || url.pathname === '/register' || url.pathname === '/apply') {
                url.pathname = '/apply/host';
                return NextResponse.rewrite(url);
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/register', '/apply', '/apply/:path*'],
};
