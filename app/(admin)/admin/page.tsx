'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ShieldAlert, Users, Video, DollarSign } from 'lucide-react';

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-7 h-7 text-blue-400" />
                        Operations Admin Dashboard
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Daily operations console for user management, host verifications, and platform support.
                    </p>
                </div>
                <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full">
                    Role: ADMIN
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            User Operations
                            <Users className="w-4 h-4 text-blue-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-white">1,48,290</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Host Verifications
                            <Video className="w-4 h-4 text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-emerald-400">124 Pending</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
