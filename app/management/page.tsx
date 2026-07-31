'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagementRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                router.replace('/dashboard');
            } else {
                router.replace('/login');
            }
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-400">Redirecting to Dashboard...</p>
        </div>
    );
}
