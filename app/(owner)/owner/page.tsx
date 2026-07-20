'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Crown, DollarSign, Users, ShieldCheck, Activity, Award } from 'lucide-react';

export default function OwnerDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Crown className="w-7 h-7 text-pink-400" />
                        Executive Owner Console
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        High-level corporate revenue metrics, platform growth & security overview.
                    </p>
                </div>
                <span className="text-xs font-mono font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3 py-1 rounded-full">
                    Role: OWNER
                </span>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Company Revenue
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-emerald-400">₹24,50,000</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Active Platform Users
                            <Users className="w-4 h-4 text-indigo-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-white">1,48,290</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Active Live Hosts
                            <Award className="w-4 h-4 text-amber-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-amber-400">3,840</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            System Security Health
                            <Activity className="w-4 h-4 text-pink-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-pink-400">99.98%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs space-y-2">
                <h3 className="font-bold text-white uppercase text-sm">Owner Executive Controls</h3>
                <p className="text-slate-400">
                    Use the sidebar navigation to configure platform permissions, review global recruitment applications, audit financial ledgers, and manage enterprise security rules.
                </p>
            </div>
        </div>
    );
}
