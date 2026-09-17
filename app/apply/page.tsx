'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ApplyPageContent() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get('role')?.toLowerCase();
    const refCode = searchParams.get('referrer') || searchParams.get('ref') || '';

    // If role query parameter is passed, redirect view cleanly to dedicated route
    if (roleParam === 'agency') {
        if (typeof window !== 'undefined') {
            window.location.href = `/apply/agency${refCode ? `?referrer=${refCode}` : ''}`;
        }
        return null;
    }
    if (roleParam === 'operator') {
        if (typeof window !== 'undefined') {
            window.location.href = `/apply/operator${refCode ? `?referrer=${refCode}` : ''}`;
        }
        return null;
    }
    if (roleParam === 'super-admin' || roleParam === 'superadmin') {
        if (typeof window !== 'undefined') {
            window.location.href = `/apply/super-admin${refCode ? `?referrer=${refCode}` : ''}`;
        }
        return null;
    }
    if (roleParam === 'admin') {
        if (typeof window !== 'undefined') {
            window.location.href = `/apply/admin${refCode ? `?referrer=${refCode}` : ''}`;
        }
        return null;
    }
    if (roleParam === 'host') {
        if (typeof window !== 'undefined') {
            window.location.href = `/apply/host${refCode ? `?referrer=${refCode}` : ''}`;
        }
        return null;
    }

    if (roleParam === 'coinseller' || roleParam === 'seller') {
        if (typeof window !== 'undefined') {
            window.location.href = `/apply/seller${refCode ? `?referrer=${refCode}` : ''}`;
        }
        return null;
    }

    if (roleParam === 'customer-service' || roleParam === 'customerservice' || roleParam === 'support') {
        if (typeof window !== 'undefined') {
            window.location.href = `/apply/customer-service${refCode ? `?referrer=${refCode}` : ''}`;
        }
        return null;
    }

    const ROLES = [
        { name: 'Seller Form', href: `/apply/seller${refCode ? `?referrer=${refCode}` : ''}`, color: 'from-amber-600 to-orange-600', desc: 'Apply to become a Coin Seller / Merchant' },
        { name: 'Customer Service Form', href: `/apply/customer-service${refCode ? `?referrer=${refCode}` : ''}`, color: 'from-cyan-600 to-blue-600', desc: 'Apply for Customer Support Executive' },
        { name: 'Agency Form', href: `/apply/agency${refCode ? `?referrer=${refCode}` : ''}`, color: 'from-purple-600 to-pink-600', desc: 'Apply to register an Agency' },
        { name: 'Operator Form', href: `/apply/operator${refCode ? `?referrer=${refCode}` : ''}`, color: 'from-emerald-600 to-teal-600', desc: 'Apply to register an Operator' },
        { name: 'Super Admin Form', href: `/apply/super-admin${refCode ? `?referrer=${refCode}` : ''}`, color: 'from-violet-600 to-indigo-600', desc: 'Apply for Super Admin role' },
        { name: 'Admin Form', href: `/apply/admin${refCode ? `?referrer=${refCode}` : ''}`, color: 'from-indigo-600 to-blue-600', desc: 'Apply for Admin role' },
        { name: 'Host Form', href: `/apply/host${refCode ? `?referrer=${refCode}` : ''}`, color: 'from-fuchsia-600 to-purple-600', desc: 'Apply to become a Live Host' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] flex flex-col items-center justify-center p-4">
            <div className="max-w-xl w-full text-center space-y-6">
                <h1 className="text-3xl font-black text-white uppercase tracking-wider">
                    VOICE CALL CLUB APPLICATION FORMS
                </h1>
                <p className="text-slate-300 text-sm">
                    Select the specific application form below:
                </p>

                <div className="grid grid-cols-1 gap-4 pt-4">
                    {ROLES.map((r) => (
                        <Link
                            key={r.name}
                            href={r.href}
                            className={`p-5 rounded-2xl bg-gradient-to-r ${r.color} text-white font-bold text-lg hover:scale-[1.02] transition-all shadow-xl flex items-center justify-between group`}
                        >
                            <div className="text-left">
                                <div>{r.name}</div>
                                <div className="text-xs text-white/70 font-normal">{r.desc}</div>
                            </div>
                            <span className="text-sm font-semibold bg-white/20 px-4 py-1.5 rounded-full group-hover:bg-white/30 transition-all">
                                Open Form →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function ApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading...</div>}>
            <ApplyPageContent />
        </Suspense>
    );
}
