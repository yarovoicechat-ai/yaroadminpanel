'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Terminal, Key, ShieldCheck, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { toast } from 'sonner';

export default function ApiCenterPage() {
    const [copiedKey, setCopiedKey] = useState(false);
    const apiKey = 'mc_live_pk_9f8a3d1290e4b78c123456789abcdef0';

    const copyApiKey = () => {
        navigator.clipboard.writeText(apiKey);
        setCopiedKey(true);
        toast.success('API Key copied to clipboard');
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const endpoints = [
        { method: 'POST', path: '/api/ems/requests', desc: 'Submit a new role application or request' },
        { method: 'GET', path: '/api/ems/requests', desc: 'Fetch pending, approved, or rejected EMS requests' },
        { method: 'PATCH', path: '/api/ems/requests/:id/approve', desc: 'Approve EMS request & create user credentials' },
        { method: 'GET', path: '/api/admin/users', desc: 'List active, inactive, blocked, or deleted users' },
        { method: 'POST', path: '/api/admin/users/:id/soft-delete', desc: 'Soft delete user account' },
        { method: 'POST', path: '/api/admin/users/:id/restore', desc: 'Restore soft deleted user account' },
        { method: 'POST', path: '/api/admin/users/:id/transfer', desc: 'Transfer user hierarchy to new parent' },
        { method: 'GET', path: '/api/v1/search', desc: 'Global Search Engine by Employee Code, Role Code, Meethi ID' }
    ];

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Enterprise API Center & OpenAPI Portal</h1>
                    <p className="text-xs text-slate-400">Developer credentials, OpenAPI schemas, webhook logs, and rate limit specifications.</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">
                    v3.0.0 Enterprise REST API
                </Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-slate-800 bg-[#161520] md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Key className="w-4 h-4 text-amber-400" /> Platform API Key
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">Production Bearer Token for Enterprise Integration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                            <code className="text-xs text-emerald-400 font-mono truncate">{apiKey}</code>
                            <Button size="icon" variant="ghost" onClick={copyApiKey} className="h-8 w-8 hover:bg-slate-800">
                                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                            </Button>
                        </div>
                        <p className="text-[11px] text-slate-500 italic">Include this token in HTTP header: Authorization: Bearer &lt;key&gt;</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-800 bg-[#161520] md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white text-base flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-indigo-400" /> Endpoint Index
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">Core REST API Endpoints</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {endpoints.map((ep, i) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                        ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                        ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                    }`}>{ep.method}</span>
                                    <code className="text-slate-200 font-mono font-semibold">{ep.path}</code>
                                </div>
                                <span className="text-slate-400 text-[11px] truncate max-w-xs">{ep.desc}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
