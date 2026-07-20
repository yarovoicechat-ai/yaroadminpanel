'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    DollarSign, Users, Video, Activity, Briefcase, Settings, Check
} from 'lucide-react';

export interface WidgetConfig {
    id: string;
    title: string;
    value: string;
    change?: string;
    icon: string;
    enabled: boolean;
}

const defaultWidgets: WidgetConfig[] = [
    { id: 'revenue', title: 'Monthly Corporate Revenue', value: '₹24,50,000', change: '+14.2%', icon: 'DollarSign', enabled: true },
    { id: 'users', title: 'Active Platform Users', value: '1,48,290', change: '+8.5%', icon: 'Users', enabled: true },
    { id: 'hosts', title: 'Active Live Hosts', value: '3,840', change: '+5.1%', icon: 'Video', enabled: true },
    { id: 'recruitment', title: 'Applications Pending Review', value: '124', change: 'Hiring Active', icon: 'Briefcase', enabled: true },
    { id: 'uptime', title: 'System Security Health', value: '99.98%', change: 'Optimal', icon: 'Activity', enabled: true },
];

export function WidgetEngine() {
    const [widgets, setWidgets] = useState<WidgetConfig[]>(defaultWidgets);
    const [customizeOpen, setCustomizeOpen] = useState(false);

    const toggleWidget = (widgetId: string) => {
        setWidgets(prev => prev.map(w => w.id === widgetId ? { ...w, enabled: !w.enabled } : w));
    };

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'DollarSign': return <DollarSign className="w-4 h-4 text-emerald-400" />;
            case 'Users': return <Users className="w-4 h-4 text-indigo-400" />;
            case 'Video': return <Video className="w-4 h-4 text-amber-400" />;
            case 'Briefcase': return <Briefcase className="w-4 h-4 text-purple-400" />;
            case 'Activity': return <Activity className="w-4 h-4 text-pink-400" />;
            default: return <Activity className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Executive Dashboard Widgets ({widgets.filter(w => w.enabled).length} Active)
                </h3>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCustomizeOpen(!customizeOpen)}
                    className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                >
                    <Settings className="w-3.5 h-3.5 mr-1" /> Customize Layout
                </Button>
            </div>

            {customizeOpen && (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                    <span className="text-xs font-semibold text-white block">Toggle Visible Dashboard Metrics:</span>
                    <div className="flex flex-wrap gap-2">
                        {widgets.map(w => (
                            <button
                                key={w.id}
                                onClick={() => toggleWidget(w.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                                    w.enabled
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                }`}
                            >
                                {w.enabled && <Check className="w-3.5 h-3.5 text-white" />}
                                {w.title}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {widgets.filter(w => w.enabled).map(widget => (
                    <Card key={widget.id} className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4 transition-all hover:border-slate-700">
                        <CardHeader className="p-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                {widget.title}
                                {renderIcon(widget.icon)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 space-y-1">
                            <div className="text-2xl font-black text-white">{widget.value}</div>
                            {widget.change && (
                                <span className="text-[11px] text-emerald-400 font-semibold">{widget.change}</span>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
