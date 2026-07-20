'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Briefcase, Video, DollarSign, Users } from 'lucide-react';

export default function AgencyDashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-7 h-7 text-amber-400" />
                        Agency Partner Console
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Host onboarding, agency earnings share, and streaming performance metrics.
                    </p>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                    Role: AGENCY
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Managed Live Hosts
                            <Video className="w-4 h-4 text-amber-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-white">48</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Monthly Commission Share
                            <DollarSign className="w-4 h-4 text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-emerald-400">₹3,45,000</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
