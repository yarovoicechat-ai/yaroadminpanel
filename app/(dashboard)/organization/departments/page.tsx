'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Users, Plus, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentManagementPage() {
    const departments = [
        { code: 'DEP-GOV', name: 'Executive & Governance', head: 'Platform Owner', members: 6, status: 'Active' },
        { code: 'DEP-OPS', name: 'Regional Operations & Moderation', head: 'Senior Operator Lead', members: 32, status: 'Active' },
        { code: 'DEP-AGY', name: 'Agency Partnerships & Talent', head: 'Head of Agency Network', members: 120, status: 'Active' },
        { code: 'DEP-FIN', name: 'Finance & Reseller Operations', head: 'Financial Controller', members: 45, status: 'Active' },
        { code: 'DEP-SUP', name: 'Customer Care & User Support', head: 'Customer Care Lead', members: 24, status: 'Active' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Department Management</h1>
                    <p className="text-xs text-slate-400">Manage organizational departments, department heads, and cross-functional user groups.</p>
                </div>
                <Button onClick={() => toast.info('Create Department dialog opened')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2">
                    <Plus className="w-4 h-4" /> Create Department
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {departments.map((d, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-purple-400 font-bold">{d.code}</span>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                    {d.status}
                                </Badge>
                            </div>
                            <CardTitle className="text-white text-base mt-1">{d.name}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Head: {d.head}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                                <span className="text-slate-400">Total Members</span>
                                <span className="text-purple-400 font-bold font-mono">{d.members} Staff</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
