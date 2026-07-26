'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Zap, Plus, CheckCircle, Play } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAutomationHubPage() {
    const automations = [
        { name: 'Auto-Approve Verified Agency Requests', trigger: 'EMS Request Submitted', action: 'Verify Documents ➔ Create Agency Account ➔ Dispatch Login Credentials', status: 'Active' },
        { name: 'Fraud & Multi-Device Auto-Lock', trigger: '3 Failed Auth Attempts from Same IP', action: 'Flag Account ➔ Temporary Block ➔ Trigger Admin Audit Alert', status: 'Active' },
        { name: 'Host Activity Milestone Rewards', trigger: 'Host Reaches 50 Live Hours', action: 'Credit Diamond Bonus ➔ Dispatch In-App Notification', status: 'Active' },
        { name: 'Auto System Backup & Cleanup', trigger: 'Daily Schedule (00:00 UTC)', action: 'Export MongoDB Dump ➔ Verify Checksum ➔ Upload to Secure Storage', status: 'Active' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <Zap className="w-6 h-6 text-amber-400" /> AI Automation & Trigger Hub
                    </h1>
                    <p className="text-xs text-slate-400">Autonomous workflow triggers, conditional event handling, and scheduled tasks.</p>
                </div>
                <Button onClick={() => toast.info('Create Automation Rule dialog opened')} className="bg-amber-600 hover:bg-amber-500 text-white font-bold gap-2">
                    <Plus className="w-4 h-4" /> Create Rule
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {automations.map((a, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                    {a.status}
                                </Badge>
                                <Play className="w-3.5 h-3.5 text-amber-400" />
                            </div>
                            <CardTitle className="text-white text-base mt-2">{a.name}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Trigger: {a.trigger}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300">
                                {a.action}
                            </div>
                            <Button onClick={() => toast.success(`Rule "${a.name}" triggered manually.`)} size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Test Rule Execution
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
