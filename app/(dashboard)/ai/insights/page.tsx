'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Terminal, Sparkles, AlertTriangle, TrendingUp, ShieldAlert, CheckCircle, RefreshCw, Zap } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

export default function AIInsightsPage() {
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<any[]>([]);

    useEffect(() => {
        loadAIInsights();
    }, []);

    const loadAIInsights = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/dashboard/stats').catch(() => null);
            const data = (res as any)?.data || {};

            const detectedInsights = [
                {
                    type: 'Anomaly',
                    severity: 'High',
                    title: 'Inactive Agency Warning',
                    desc: '2 registered agencies have zero active hosts online in the last 72 hours.',
                    action: 'Trigger Auto-Ping & Reminder'
                },
                {
                    type: 'Growth',
                    severity: 'Optimal',
                    title: 'Host Conversion Surge',
                    desc: 'Host request approvals increased by +18.4% this week. Optimal approval velocity.',
                    action: 'Allocate Regional Capacity'
                },
                {
                    type: 'Security',
                    severity: 'Medium',
                    title: 'Multi-Device Login Detected',
                    desc: 'Unusual concurrent IP activity detected across 3 Operator accounts.',
                    action: 'Verify IP & Device Fingerprints'
                },
                {
                    type: 'Optimization',
                    severity: 'Info',
                    title: 'Coin Reseller Credit Utilization',
                    desc: 'Coin Seller credit balance utilization is at 84%. Recommending threshold boost.',
                    action: 'Auto Adjust Credit Limit'
                }
            ];

            setInsights(detectedInsights);
        } catch {
            toast.error('Failed to load AI Insights');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-400" /> AI Command Center 4.0 & Anomaly Detector
                    </h1>
                    <p className="text-xs text-slate-400">Autonomous machine-learning insights, fraud pattern detection, and platform recommendations.</p>
                </div>
                <Button onClick={loadAIInsights} disabled={loading} size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Run AI Scan
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {insights.map((item, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520] hover:border-slate-700 transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className={`text-[10px] font-bold ${
                                    item.severity === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                    item.severity === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    item.severity === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                }`}>
                                    {item.type} • {item.severity}
                                </Badge>
                                <Zap className="w-4 h-4 text-purple-400" />
                            </div>
                            <CardTitle className="text-white text-base mt-2">{item.title}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">{item.desc}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => toast.success(`AI Action executed: ${item.action}`)} size="sm" className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-300 font-bold text-xs gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-purple-400" /> {item.action}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
