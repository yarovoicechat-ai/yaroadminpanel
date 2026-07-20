'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShieldCheck, ShieldAlert, FileCheck, Users, Activity } from 'lucide-react';

export default function SuperAdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldCheck className="w-7 h-7 text-purple-400" />
                        Super Admin Governance Console
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Global platform compliance, admin audit logs, and security oversight.
                    </p>
                </div>
                <span className="text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full">
                    Role: SUPER_ADMIN
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Pending Audit Reviews
                            <FileCheck className="w-4 h-4 text-purple-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-purple-400">18</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Active Admin Accounts
                            <Users className="w-4 h-4 text-indigo-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-white">42</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Compliance Violations
                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-rose-400">3</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Audit System Uptime
                            <Activity className="w-4 h-4 text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-emerald-400">100%</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
