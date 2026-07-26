'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { isRouteAllowed } from '@/config/rbacMatrix';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const role = user?.role || 'user';
    const allowed = isRouteAllowed(role, pathname);

    if (!allowed) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-2xl text-rose-500">
                    <ShieldAlert className="w-12 h-12 animate-pulse" />
                </div>

                <div className="max-w-md space-y-2">
                    <span className="px-3 py-1 text-xs font-semibold tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-full uppercase">
                        HTTP 403 Forbidden
                    </span>
                    <h1 className="text-3xl font-extrabold text-white">Access Restricted</h1>
                    <p className="text-slate-400 text-sm leading-relaxed">
                        Your account role (<strong className="text-amber-400 uppercase">{role}</strong>) does not have permission to access <code className="text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{pathname}</code>.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-all flex items-center gap-2 border border-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
