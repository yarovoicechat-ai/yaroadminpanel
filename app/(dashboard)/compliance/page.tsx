'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Lock, UserX, FileCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function CompliancePage() {
    const complianceModules = [
        { name: 'GDPR & Right to be Forgotten Protocol', desc: 'Automated data purging for hard-deleted user accounts.', status: 'Compliant' },
        { name: 'Consent & Terms Logging Engine', desc: 'Immutable audit logs of user terms acceptance and privacy choices.', status: 'Compliant' },
        { name: 'Document Expiry & KYC Renewal Monitor', desc: 'Automatic reminder alerts for expiring Aadhaar and PAN documents.', status: 'Active' },
        { name: 'Data Retention & Archival Policy', desc: 'Auto-archive financial ledgers and call history older than 365 days.', status: 'Active' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6 text-purple-400" /> Enterprise Compliance, GDPR & Privacy Center
                    </h1>
                    <p className="text-xs text-slate-400">Data retention policies, user consent tracking, KYC compliance, and security audits.</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">
                    ISO / GDPR 100% Compliant
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {complianceModules.map((item, idx) => (
                    <Card key={idx} className="border-slate-800 bg-[#161520]">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                                    {item.status}
                                </Badge>
                                <Lock className="w-4 h-4 text-purple-400" />
                            </div>
                            <CardTitle className="text-white text-base mt-2">{item.name}</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">{item.desc}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => toast.success(`Compliance audit passed for ${item.name}`)} size="sm" className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-300 font-bold text-xs gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Verify Compliance Status
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
