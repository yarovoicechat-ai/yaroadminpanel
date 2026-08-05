'use client';

import Sidebar from '@/components/layout/Sidebar';
import { Badge } from '@/components/ui/Badge';
import { Gem, ShieldCheck } from 'lucide-react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto w-full p-4 pt-16 md:p-8 md:pt-6 relative">
                {/* Seller Portal Header Indicator */}
                <div className="mb-6 pb-4 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                            <Gem className="h-6 w-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-bold text-lg text-slate-100">Seller Merchant Console</h1>
                                <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-semibold text-[11px]">
                                    Authorized Seller
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-400">Manage stock inventory, user recharges, and earnings</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span className="text-slate-300 font-medium">Rate Status:</span>
                            <span className="text-emerald-400 font-bold">₹95 per 1,670 💎</span>
                        </div>
                    </div>
                </div>
                {children}
            </main>
        </div>
    );
}
