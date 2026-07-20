'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Store, Download, Check, ShieldCheck, DollarSign, UserCheck, Bot, Package, Heart } from 'lucide-react';
import { toast } from 'sonner';

interface MarketplaceItem {
    id: string;
    name: string;
    category: string;
    description: string;
    version: string;
    installed: boolean;
    rating: string;
}

const initialMarketplace: MarketplaceItem[] = [
    { id: 'm-hr', name: 'Enterprise HR & Payroll Pack', category: 'HR', description: 'Complete employee lifecycle, attendance, leaves, and salary slip generation.', version: 'v2.1.0', installed: true, rating: '4.9 ★' },
    { id: 'm-finance', name: 'Finance & Earnings Ledger', category: 'Finance', description: 'Recharge rates, automated coin withdrawal settlement, and revenue reports.', version: 'v1.4.0', installed: true, rating: '4.8 ★' },
    { id: 'm-crm', name: 'Customer Relationship CRM', category: 'CRM', description: 'Agency lead tracking, communication history, and host conversion funnels.', version: 'v1.0.0', installed: false, rating: '4.7 ★' },
    { id: 'm-compliance', name: 'GDPR & Digital Signatures Audit', category: 'Compliance', description: 'DocuSign digital signatures, NDA tracking, and compliance exports.', version: 'v1.2.0', installed: true, rating: '5.0 ★' },
    { id: 'm-ai', name: 'AI Copilot Assistant Extension', category: 'AI', description: 'Natural language summaries, bottleneck detection, and predictive BI insights.', version: 'v3.0.0', installed: true, rating: '4.9 ★' },
];

export default function MarketplacePage() {
    const [items, setItems] = useState<MarketplaceItem[]>(initialMarketplace);

    const toggleInstall = (id: string) => {
        setItems(prev => prev.map(item => {
            if (item.id === id) {
                const nextState = !item.installed;
                toast.success(`Extension '${item.name}' ${nextState ? 'Installed' : 'Uninstalled'} successfully!`);
                return { ...item, installed: nextState };
            }
            return item;
        }));
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Store className="w-7 h-7 text-indigo-400" />
                    One-Click Plugin Marketplace
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Discover, install, and extend your Enterprise Operations Platform with modular extensions.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(item => (
                    <Card key={item.id} className="bg-slate-900 border-slate-800 text-white rounded-2xl p-5 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                                    {item.category}
                                </Badge>
                                <span className="text-xs text-amber-400 font-bold">{item.rating}</span>
                            </div>
                            <h3 className="font-bold text-sm text-white">{item.name}</h3>
                            <p className="text-xs text-slate-400">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                            <span className="text-[10px] text-slate-500 font-mono">{item.version}</span>
                            <Button
                                size="sm"
                                variant={item.installed ? 'outline' : 'default'}
                                onClick={() => toggleInstall(item.id)}
                                className={
                                    item.installed
                                        ? 'border-emerald-500/30 text-emerald-400 text-xs rounded-xl hover:bg-slate-800'
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl'
                                }
                            >
                                {item.installed ? (
                                    <>
                                        <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Installed
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-3.5 h-3.5 mr-1" /> Install Extension
                                    </>
                                )}
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
