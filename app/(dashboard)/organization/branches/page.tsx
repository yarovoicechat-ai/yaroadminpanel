'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Briefcase, Plus, MapPin, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function BranchManagementPage() {
    const branches = [
        { code: 'BR-DEL-01', name: 'Delhi NCR HQ', location: 'New Delhi, India', head: 'Rajesh Kumar (SA000001)', staffCount: 140, status: 'Active' },
        { code: 'BR-MUM-02', name: 'Mumbai Operations Hub', location: 'Mumbai, India', head: 'Priya Sharma (ADM000002)', staffCount: 95, status: 'Active' },
        { code: 'BR-BLR-03', name: 'Bengaluru Tech & Support', location: 'Bengaluru, India', head: 'Vikram Singh (ADM000003)', staffCount: 80, status: 'Active' },
        { code: 'BR-LKO-04', name: 'Lucknow Regional Hub', location: 'Lucknow, India', head: 'Amit Verma (OP000004)', staffCount: 60, status: 'Active' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Branch Management Center</h1>
                    <p className="text-xs text-slate-400">Manage company regional branches, branch heads, staff allocations, and transfers.</p>
                </div>
                <Button onClick={() => toast.info('Create Branch dialog opened')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2">
                    <Plus className="w-4 h-4" /> Create Branch
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {branches.map((b, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs text-indigo-400 font-bold">{b.code}</span>
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                    {b.status}
                                </Badge>
                            </div>
                            <CardTitle className="text-white text-lg mt-1">{b.name}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-500" /> {b.location}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 text-xs">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400">Branch Head</span>
                                <span className="text-white font-semibold">{b.head}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400">Allocated Staff</span>
                                <span className="text-indigo-400 font-bold flex items-center gap-1">
                                    <Users className="w-3.5 h-3.5" /> {b.staffCount} Members
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
