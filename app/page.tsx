'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RootContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const refCode = searchParams.get('referrer') || searchParams.get('ref') || '';
    const roleParam = searchParams.get('role')?.toLowerCase() || '';

    useEffect(() => {
        const getTargetRoute = (role: string, ref: string) => {
            const query = ref ? `?referrer=${ref}` : '';
            if (role === 'agency') return `/apply/agency${query}`;
            if (role === 'operator') return `/apply/operator${query}`;
            if (role === 'super-admin' || role === 'superadmin') return `/apply/super-admin${query}`;
            if (role === 'host') return `/apply/host${query}`;
            if (role === 'coinseller' || role === 'seller') return `/apply/seller${query}`;
            if (role === 'customer-service' || role === 'customerservice' || role === 'support') return `/apply/customer-service${query}`;
            return `/apply/admin${query}`;
        };

        if (refCode || roleParam) {
            router.replace(getTargetRoute(roleParam, refCode));
            return;
        }

        // Otherwise check login token or route to login/dashboard
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        }
    }, [refCode, roleParam, router]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-400">Opening Application Form...</p>
        </div>
    );
}

export default function RootPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <RootContent />
        </Suspense>
    );
}
