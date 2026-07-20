'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Box, Check, ShieldCheck, DollarSign, UserCheck, Bot, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PluginUI {
    id: string;
    name: string;
    version: string;
    description: string;
    category: string;
    isEnabled: boolean;
    icon: string;
}

const initialPlugins: PluginUI[] = [
    { id: 'plugin-hr', name: 'HR & Employee Lifecycle Suite', version: 'v1.2.0', description: 'Employee onboarding, designations, salary bands, and emergency contacts.', category: 'HR', isEnabled: true, icon: 'UserCheck' },
    { id: 'plugin-finance', name: 'Finance & Earnings Engine', version: 'v1.0.4', description: 'Recharge rates, withdrawals, diamond-coin conversions, and earnings logs.', category: 'Finance', isEnabled: true, icon: 'DollarSign' },
    { id: 'plugin-compliance', name: 'Legal & Compliance Audit', version: 'v1.1.0', description: 'Digital signatures, NDA verification, GDPR/KYC logs, and data retention.', category: 'Compliance', isEnabled: true, icon: 'ShieldCheck' },
    { id: 'plugin-ai', name: 'AI Insights Assistant', version: 'v2.0.0', description: 'Automated natural language synthesis of hiring trends and revenue anomalies.', category: 'AI', isEnabled: true, icon: 'Bot' },
];

export default function PluginsPage() {
    const [plugins, setPlugins] = useState<PluginUI[]>(initialPlugins);

    const togglePlugin = (id: string) => {
        setPlugins(prev => prev.map(p => {
            if (p.id === id) {
                const nextState = !p.isEnabled;
                toast.success(`Plugin '${p.name}' ${nextState ? 'Enabled' : 'Disabled'}`);
                return { ...p, isEnabled: nextState };
            }
            return p;
        }));
    };

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'UserCheck': return <UserCheck className="w-5 h-5 text-emerald-400" />;
            case 'DollarSign': return <DollarSign className="w-5 h-5 text-amber-400" />;
            case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-indigo-400" />;
            case 'Bot': return <Bot className="w-5 h-5 text-purple-400" />;
            default: return <Box className="w-5 h-5 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Box className="w-7 h-7 text-indigo-400" />
                        Enterprise Plugin Architecture
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Zero-code extension registry: Install, configure, and manage modular enterprise plugins dynamically.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success('Plugin registry refreshed')}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh Registry
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plugins.map(plugin => (
                    <Card key={plugin.id} className="bg-slate-900 border-slate-800 text-white rounded-2xl p-5 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                                    {renderIcon(plugin.icon)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-white">{plugin.name}</h3>
                                        <Badge className="bg-slate-800 text-slate-400 text-[10px] border-slate-700">
                                            {plugin.version}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">{plugin.description}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                            <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                                {plugin.category} Module
                            </Badge>
                            <Button
                                size="sm"
                                variant={plugin.isEnabled ? 'default' : 'outline'}
                                onClick={() => togglePlugin(plugin.id)}
                                className={
                                    plugin.isEnabled
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl'
                                        : 'border-slate-700 text-slate-400 hover:bg-slate-800 text-xs rounded-xl'
                                }
                            >
                                {plugin.isEnabled ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 mr-1" /> Active
                                    </>
                                ) : (
                                    'Disabled'
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
