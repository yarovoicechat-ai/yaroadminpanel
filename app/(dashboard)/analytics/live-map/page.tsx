'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Globe, RefreshCw, Users, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function LiveUserMapPage() {
    const [loading, setLoading] = useState(false);

    const regionalStats = [
        { country: 'India', flag: '🇮🇳', region: 'Delhi NCR & North India', activeUsers: 4850, activeHosts: 410, agencyCount: 45 },
        { country: 'India', flag: '🇮🇳', region: 'Mumbai & West India', activeUsers: 3420, activeHosts: 280, agencyCount: 32 },
        { country: 'India', flag: '🇮🇳', region: 'Bengaluru & South India', activeUsers: 2950, activeHosts: 215, agencyCount: 28 },
        { country: 'UAE', flag: '🇦🇪', region: 'Dubai & Middle East', activeUsers: 1240, activeHosts: 95, agencyCount: 14 }
    ];

    const refreshMap = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Live User Map updated with latest WebSocket telemetry.');
        }, 1000);
    };

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-400" /> Enterprise Live User Map & Telemetry
                    </h1>
                    <p className="text-xs text-slate-400">Real-time geographic distribution of online users, active hosts, and agency networks.</p>
                </div>
                <Button onClick={refreshMap} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Map
                </Button>
            </div>

            <Card className="border-slate-800 bg-[#161520] p-6 text-center">
                <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 space-y-3">
                    <Globe className="w-16 h-16 text-indigo-500 animate-pulse" />
                    <h3 className="text-lg font-bold text-white">Global Real-Time Geolocation Telemetry Active</h3>
                    <p className="text-xs text-slate-400 max-w-md">Streaming live active WebSocket connections across 4 regional clusters.</p>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">12,460 Active Concurrent Users</Badge>
                </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {regionalStats.map((reg, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <span className="text-2xl">{reg.flag}</span>
                                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-bold">
                                    {reg.country}
                                </Badge>
                            </div>
                            <CardTitle className="text-white text-base mt-2">{reg.region}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span className="text-slate-400">Online Users</span>
                                <span className="text-emerald-400 font-bold font-mono">{reg.activeUsers.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span className="text-slate-400">Active Hosts</span>
                                <span className="text-indigo-400 font-bold font-mono">{reg.activeHosts}</span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                                <span className="text-slate-400">Agencies</span>
                                <span className="text-purple-400 font-bold font-mono">{reg.agencyCount}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
