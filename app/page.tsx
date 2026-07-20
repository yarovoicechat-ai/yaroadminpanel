'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function RootContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const refCode = searchParams.get('referrer') || searchParams.get('ref') || '';
    const roleParam = searchParams.get('role')?.toLowerCase() || '';

    useEffect(() => {
        // If a referral / special code is present in URL (e.g. ?referrer=SPECIAL_CODE)
        if (refCode) {
            if (roleParam === 'agency') {
                router.replace(`/apply/agency?referrer=${refCode}`);
            } else if (roleParam === 'operator') {
                router.replace(`/apply/operator?referrer=${refCode}`);
            } else if (roleParam === 'super-admin' || roleParam === 'superadmin') {
                router.replace(`/apply/super-admin?referrer=${refCode}`);
            } else if (roleParam === 'host') {
                router.replace(`/apply/host?referrer=${refCode}`);
            } else {
                // Default: Open Admin form with special code
                router.replace(`/apply/admin?referrer=${refCode}`);
            }
            return;
        }

        // If role parameter is present without explicit referrer
        if (roleParam) {
            if (roleParam === 'agency') router.replace('/apply/agency');
            else if (roleParam === 'operator') router.replace('/apply/operator');
            else if (roleParam === 'super-admin' || roleParam === 'superadmin') router.replace('/apply/super-admin');
            else if (roleParam === 'host') router.replace('/apply/host');
            else router.replace('/apply/admin');
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
