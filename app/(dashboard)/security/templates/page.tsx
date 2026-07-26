'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Plus, CheckCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleTemplatesPage() {
    const templates = [
        { name: 'Super Admin Executive Template', role: 'superAdmin', menus: 12, pages: 35, usersCount: 4, desc: 'Full platform governance and system oversight permissions.' },
        { name: 'Regional Administrator Template', role: 'admin', menus: 10, pages: 28, usersCount: 12, desc: 'Regional operations, agency approvals, and team management.' },
        { name: 'Official Agency Partner Template', role: 'agency', menus: 5, pages: 14, usersCount: 85, desc: 'Host management, commission tracking, and host onboarding.' },
        { name: 'Regional Operator Template', role: 'operator', menus: 6, pages: 16, usersCount: 24, desc: 'Regional live host moderation, shift scheduling, and reporting.' },
        { name: 'Certified Coin Seller Template', role: 'coinSeller', menus: 4, pages: 8, usersCount: 40, desc: 'Wallet management, credit purchases, and reseller ledger access.' },
        { name: 'Customer Support Specialist Template', role: 'customerSupport', menus: 5, pages: 10, usersCount: 18, desc: 'Ticket handling, account verification, and user assistance.' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Role Permission Templates</h1>
                    <p className="text-xs text-slate-400">Pre-configured permission blueprints for instant role assignment across platform teams.</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-500 text-white font-bold gap-2">
                    <Plus className="w-4 h-4" /> Create Template
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((tpl, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520] hover:border-slate-700 transition-all">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px] font-bold capitalize">
                                    {tpl.role}
                                </Badge>
                                <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold">
                                    <Users className="w-3.5 h-3.5 text-slate-400" /> {tpl.usersCount} Users
                                </span>
                            </div>
                            <CardTitle className="text-white text-base mt-2">{tpl.name}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">{tpl.desc}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400">Granted Menus</span>
                                <span className="text-emerald-400 font-bold font-mono">{tpl.menus} Menus</span>
                            </div>
                            <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                                <span className="text-slate-400">Granted Pages</span>
                                <span className="text-purple-400 font-bold font-mono">{tpl.pages} Pages</span>
                            </div>
                            <Button onClick={() => toast.success(`Applied template ${tpl.name}`)} size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Apply Template
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
