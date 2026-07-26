'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Crown, ShieldAlert, ShieldCheck, Briefcase, UserCheck, Video, ChevronDown, ChevronRight, Users, RefreshCw } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

interface OrgNode {
    id: string;
    name: string;
    role: string;
    employeeCode: string;
    roleCode?: string;
    children?: OrgNode[];
}

export default function OrganizationChartPage() {
    const [loading, setLoading] = useState(false);
    const [treeData, setTreeData] = useState<OrgNode[]>([]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'root-owner': true });

    useEffect(() => {
        loadOrgTree();
    }, []);

    const loadOrgTree = async () => {
        setLoading(true);
        try {
            const res = await apiClient.get('/api/admin/users').catch(() => null);
            const users = (res as any)?.data?.users || (res as any)?.users || [];
            
            // Build hierarchy tree
            const owners = users.filter((u: any) => u.role === 'owner');
            const superAdmins = users.filter((u: any) => u.role === 'superAdmin');
            const admins = users.filter((u: any) => u.role === 'admin');
            const agencies = users.filter((u: any) => u.role === 'agency');
            const operators = users.filter((u: any) => u.role === 'operator');
            const hosts = users.filter((u: any) => u.role === 'host');

            const root: OrgNode = {
                id: 'root-owner',
                name: owners[0]?.name || 'Platform Executive Board (Owner)',
                role: 'Owner',
                employeeCode: owners[0]?.employeeCode || 'EMP-OWN-000001',
                children: superAdmins.map((sa: any) => ({
                    id: sa._id,
                    name: sa.name || 'Super Admin',
                    role: 'Super Admin',
                    employeeCode: sa.employeeCode || sa.specialCode || 'SA000001',
                    children: admins.map((adm: any) => ({
                        id: adm._id,
                        name: adm.name || 'Admin',
                        role: 'Admin',
                        employeeCode: adm.employeeCode || adm.specialCode || 'ADM000001',
                        children: agencies.map((agy: any) => ({
                            id: agy._id,
                            name: agy.name || 'Agency',
                            role: 'Agency',
                            employeeCode: agy.employeeCode || agy.specialCode || 'AGY000001',
                            children: operators.map((op: any) => ({
                                id: op._id,
                                name: op.name || 'Operator',
                                role: 'Operator',
                                employeeCode: op.employeeCode || op.specialCode || 'OP000001',
                                children: hosts.map((h: any) => ({
                                    id: h._id,
                                    name: h.name || 'Host',
                                    role: 'Host',
                                    employeeCode: h.employeeCode || h.specialCode || 'HOST000001'
                                }))
                            }))
                        }))
                    }))
                }))
            };

            setTreeData([root]);
        } catch {
            toast.error('Failed to construct organization tree');
        } finally {
            setLoading(false);
        }
    };

    const toggleNode = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const renderNode = (node: OrgNode, level = 0) => {
        const isOpen = expanded[node.id];
        const hasChildren = node.children && node.children.length > 0;

        const roleBadges: Record<string, { icon: any; color: string; bg: string }> = {
            'Owner': { icon: Crown, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
            'Super Admin': { icon: ShieldAlert, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            'Admin': { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            'Agency': { icon: Briefcase, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            'Operator': { icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
            'Host': { icon: Video, color: 'text-lime-400', bg: 'bg-lime-500/10 border-lime-500/20' },
        };

        const config = roleBadges[node.role] || { icon: Users, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20' };
        const Icon = config.icon;

        return (
            <div key={node.id} className="space-y-2 relative" style={{ marginLeft: `${level * 24}px` }}>
                <div className={`flex items-center gap-3 p-3 rounded-xl border bg-[#161520] hover:bg-slate-900/80 transition-all ${config.bg}`}>
                    {hasChildren ? (
                        <button onClick={() => toggleNode(node.id)} className="p-1 hover:bg-slate-800 rounded">
                            {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </button>
                    ) : (
                        <div className="w-6" />
                    )}

                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm truncate">{node.name}</span>
                            <Badge variant="outline" className={`text-[10px] ${config.color} border-slate-800`}>
                                {node.role}
                            </Badge>
                        </div>
                        <div className="text-xs font-mono text-slate-400">{node.employeeCode}</div>
                    </div>
                </div>

                {isOpen && hasChildren && (
                    <div className="pl-4 border-l border-slate-800 space-y-2 mt-2">
                        {node.children!.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-6 space-y-6 bg-[#0f0e15] min-h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Organization Hierarchy Chart</h1>
                    <p className="text-xs text-slate-400">Interactive Enterprise parenting tree across Owner, Super Admin, Admin, Agency, Operator, and Hosts.</p>
                </div>
                <Button onClick={loadOrgTree} disabled={loading} size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold gap-2">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Hierarchy
                </Button>
            </div>

            <Card className="border-slate-800 bg-[#161520]">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Platform Hierarchy Tree</CardTitle>
                    <CardDescription className="text-slate-400 text-xs">Click arrows to expand or collapse organizational branches.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {treeData.map(node => renderNode(node, 0))}
                </CardContent>
            </Card>
        </div>
    );
}
