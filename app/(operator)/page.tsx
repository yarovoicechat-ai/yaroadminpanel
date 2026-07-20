'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UserCheck, CheckSquare, Clock, Activity } from 'lucide-react';

export default function OperatorDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <UserCheck className="w-7 h-7 text-teal-400" />
                        Regional Operator Hub
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Task management, team performance monitoring, and live room moderation.
                    </p>
                </div>
                <span className="text-xs font-mono font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full">
                    Role: OPERATOR
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Assigned Tasks
                            <Clock className="w-4 h-4 text-teal-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-teal-400">14</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Completed Today
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-emerald-400">38</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Resolution Rate
                            <Activity className="w-4 h-4 text-indigo-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-white">98.4%</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
