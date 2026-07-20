'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Layers, Plus, Save, Play, CheckCircle2, ArrowRight, GitCommit } from 'lucide-react';
import { toast } from 'sonner';

interface CanvasNode {
    id: string;
    title: string;
    type: 'trigger' | 'action' | 'condition';
    role: string;
}

export default function WorkflowCanvasPage() {
    const [nodes, setNodes] = useState<CanvasNode[]>([
        { id: '1', title: 'Start: Application Submitted', type: 'trigger', role: 'System' },
        { id: '2', title: 'Stage 1: HR Initial Review', type: 'action', role: 'Admin' },
        { id: '3', title: 'Condition: Document Verification', type: 'condition', role: 'System' },
        { id: '4', title: 'Stage 2: Final Approval', type: 'action', role: 'SuperAdmin' },
        { id: '5', title: 'End: Create Employee & Login', type: 'action', role: 'Automated Service' },
    ]);

    const handleAddStep = () => {
        const newNodeId = `${Date.now()}`;
        setNodes(prev => [
            ...prev.slice(0, prev.length - 1),
            { id: newNodeId, title: 'New Approval Stage', type: 'action', role: 'Operator' },
            prev[prev.length - 1]
        ]);
        toast.success('Step added to workflow canvas');
    };

    const handleDeployWorkflow = () => {
        toast.success('Low-Code Canvas Workflow deployed successfully!');
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Layers className="w-7 h-7 text-indigo-400" />
                        Low-Code Visual Workflow Canvas
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Drag-and-drop approval pipeline designer: Construct end-to-end multi-tier business workflows.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddStep}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Canvas Step
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleDeployWorkflow}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                    >
                        <Save className="w-3.5 h-3.5 mr-1" /> Publish Canvas Pipeline
                    </Button>
                </div>
            </div>

            {/* Interactive Canvas Pipeline Node Display */}
            <Card className="bg-slate-950 border-slate-800 text-white rounded-3xl p-6 overflow-x-auto">
                <div className="flex items-center gap-4 min-w-[700px]">
                    {nodes.map((node, index) => (
                        <div key={node.id} className="flex items-center gap-4">
                            <div className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-4 w-52 space-y-2 transition-all shadow-xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Node #{index + 1}</span>
                                    <GitCommit className="w-4 h-4 text-indigo-400" />
                                </div>
                                <h4 className="font-bold text-xs text-white">{node.title}</h4>
                                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800">
                                    <span className="text-slate-400">Assigned:</span>
                                    <span className="font-semibold text-amber-400">{node.role}</span>
                                </div>
                            </div>

                            {index < nodes.length - 1 && (
                                <ArrowRight className="w-6 h-6 text-indigo-500 shrink-0 animate-pulse" />
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
