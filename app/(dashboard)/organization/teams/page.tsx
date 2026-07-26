'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { UserCheck, Plus, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function TeamManagementPage() {
    const teams = [
        { code: 'TM-LKO-01', name: 'Lucknow Host Moderation Team', lead: 'Operator OP000001', members: 18, performance: '98.5%' },
        { code: 'TM-MUM-02', name: 'Mumbai Agency Onboarding Team', lead: 'Agency AGY000002', members: 24, performance: '96.2%' },
        { code: 'TM-BLR-03', name: 'Bengaluru Technical Support Team', lead: 'Support CS000003', members: 12, performance: '99.1%' },
        { code: 'TM-DEL-04', name: 'Delhi Reseller Management Team', lead: 'Seller SEL000004', members: 15, performance: '97.8%' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Team Management</h1>
                    <p className="text-xs text-slate-400">Team Leaders, member assignments, and operational team performance metrics.</p>
                </div>
                <Button onClick={() => toast.info('Create Team dialog opened')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2">
                    <Plus className="w-4 h-4" /> Create Team
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {teams.map((t, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-emerald-400 font-bold">{t.code}</span>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                                    <Award className="w-3 h-3" /> {t.performance} Performance
                                </Badge>
                            </div>
                            <CardTitle className="text-white text-base mt-1">{t.name}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">Team Lead: {t.lead}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                                <span className="text-slate-400">Assigned Members</span>
                                <span className="text-emerald-400 font-bold font-mono">{t.members} Staff</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
