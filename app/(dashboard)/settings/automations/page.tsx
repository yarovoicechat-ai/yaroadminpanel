'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap, Plus, Trash2, Save, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RuleUI {
    id: string;
    ruleName: string;
    trigger: string;
    conditionDepartment: string;
    actions: string[];
    isActive: boolean;
}

export default function AutomationsPage() {
    const [rules, setRules] = useState<RuleUI[]>([
        {
            id: 'rule_1',
            ruleName: 'Auto-Onboard Approved Applicants',
            trigger: 'Application Approved',
            conditionDepartment: 'All Departments',
            actions: ['Create Employee Record', 'Generate Employee ID', 'Send Offer Letter PDF', 'Dispatch Welcome Email'],
            isActive: true
        },
        {
            id: 'rule_2',
            ruleName: 'Notify HR on High Level Up',
            trigger: 'Host Reaches Level 5+',
            conditionDepartment: 'Live Stream Hosts',
            actions: ['Award Host Badge', 'Send Reward Diamonds', 'Notify Regional Manager'],
            isActive: true
        }
    ]);

    const [ruleName, setRuleName] = useState('');
    const [trigger, setTrigger] = useState('Application Approved');
    const [department, setDepartment] = useState('All Departments');

    const handleCreateRule = () => {
        if (!ruleName.trim()) {
            toast.error('Rule Name is required');
            return;
        }

        const newRule: RuleUI = {
            id: `rule_${Date.now()}`,
            ruleName,
            trigger,
            conditionDepartment: department,
            actions: ['Create Employee Record', 'Send Notification'],
            isActive: true
        };

        setRules(prev => [newRule, ...prev]);
        setRuleName('');
        toast.success(`Automation Rule '${ruleName}' created!`);
    };

    const handleToggleRule = (id: string) => {
        setRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
    };

    const handleDeleteRule = (id: string) => {
        setRules(prev => prev.filter(r => r.id !== id));
        toast.success('Automation rule deleted');
    };

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-7 h-7 text-amber-400" />
                    No-Code Business Process Automation Builder
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                    Construct automated trigger-condition-action pipelines to eliminate manual operational workflows.
                </p>
            </div>

            {/* Create Rule Builder Header */}
            <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                <CardHeader className="p-0 pb-3 border-b border-slate-800">
                    <CardTitle className="text-sm font-bold text-white uppercase flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-400" />
                        Construct New Automation Pipeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Rule Name *</label>
                        <Input
                            type="text"
                            value={ruleName}
                            onChange={e => setRuleName(e.target.value)}
                            placeholder="e.g. Agency Approval Flow"
                            className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">System Trigger *</label>
                        <select
                            value={trigger}
                            onChange={e => setTrigger(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 w-full"
                        >
                            <option value="Application Approved">Application Approved</option>
                            <option value="Application Rejected">Application Rejected</option>
                            <option value="Host Reaches Level 5+">Host Reaches Level 5+</option>
                            <option value="Withdrawal Submitted">Withdrawal Submitted</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-slate-400 block mb-1">Target Department</label>
                        <select
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 w-full"
                        >
                            <option value="All Departments">All Departments</option>
                            <option value="Agency Department">Agency Department</option>
                            <option value="Operator Department">Operator Department</option>
                            <option value="Live Stream Hosts">Live Stream Hosts</option>
                        </select>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleCreateRule}
                        className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                    >
                        <Save className="w-3.5 h-3.5 mr-1" /> Deploy Automation Rule
                    </Button>
                </CardContent>
            </Card>

            {/* Active Rules List */}
            <div className="space-y-4">
                {rules.map(rule => (
                    <Card key={rule.id} className="bg-slate-900 border-slate-800 text-white rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                <h3 className="font-bold text-sm text-white">{rule.ruleName}</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleRule(rule.id)}
                                    className={rule.isActive ? 'border-emerald-500/30 text-emerald-400 text-xs rounded-xl' : 'border-slate-700 text-slate-400 text-xs rounded-xl'}
                                >
                                    {rule.isActive ? 'Active' : 'Disabled'}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteRule(rule.id)}
                                    className="text-rose-400 hover:bg-rose-500/10 text-xs"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Trigger Event</span>
                                <span className="font-bold text-amber-400">{rule.trigger}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowRight className="w-4 h-4 text-slate-600 hidden md:block" />
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Condition Filter</span>
                                    <span className="font-bold text-indigo-400">{rule.conditionDepartment}</span>
                                </div>
                            </div>
                            <div>
                                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">Actions Executed ({rule.actions.length})</span>
                                <div className="flex flex-wrap gap-1">
                                    {rule.actions.map((act, idx) => (
                                        <span key={idx} className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {act}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
