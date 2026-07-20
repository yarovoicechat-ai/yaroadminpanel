'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { GitCommit, Save, Plus, Trash2, Shield, Settings, ToggleLeft, ToggleRight, CheckCircle, Info } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

const roles = ['owner', 'operator', 'superAdmin', 'admin'];

const requestTypes = [
  'Agency Request', 'Admin Request', 'Super Admin Request', 
  'Operator Request', 'Seller Request', 'Support Request', 
  'Host Request', 'KYC Request', 'Withdrawal Request'
];

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState('Agency Request');
  const [steps, setSteps] = useState<string[]>([]);
  const [autoApprove, setAutoApprove] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/ems/workflows');
      if (res.success && res.data) {
        setWorkflows(res.data);
        // Find configuration for active type
        const activeWf = res.data.find((w: any) => w.requestType === selectedType);
        if (activeWf) {
          setSteps(activeWf.steps || []);
          setAutoApprove(activeWf.autoApprove || false);
          setIsActive(activeWf.isActive !== false);
        } else {
          setSteps([]);
          setAutoApprove(false);
          setIsActive(true);
        }
      }
    } catch (err) {
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [selectedType]);

  const addStep = (role: string) => {
    setSteps([...steps, role]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const clearSteps = () => {
    setSteps([]);
  };

  const saveWorkflow = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/api/ems/workflows', {
        requestType: selectedType,
        steps,
        autoApprove,
        isActive
      });
      if (res.success) {
        toast.success(`Approval workflow for '${selectedType}' saved successfully`);
        fetchWorkflows();
      } else {
        toast.error('Failed to save workflow');
      }
    } catch (err) {
      toast.error('Error saving workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dynamic Workflow Builder
          </h2>
          <p className="text-muted-foreground mt-1">Design multi-stage approval sequences for registration and payout requests</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: Select Request Type */}
        <Card className="glass-card md:col-span-1 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> Request Configuration
            </CardTitle>
            <CardDescription>Select the target request type to build</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase">Request Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
              >
                {requestTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Auto Approve</h4>
                  <p className="text-xs text-slate-500">Bypass approval pipeline</p>
                </div>
                <button
                  onClick={() => setAutoApprove(!autoApprove)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {autoApprove ? <ToggleRight className="h-9 w-9 text-primary" /> : <ToggleLeft className="h-9 w-9 text-slate-600" />}
                </button>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Workflow Active</h4>
                  <p className="text-xs text-slate-500">Enable or disable pipeline checks</p>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {isActive ? <ToggleRight className="h-9 w-9 text-primary" /> : <ToggleLeft className="h-9 w-9 text-slate-600" />}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={saveWorkflow}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg text-sm transition-colors shadow-lg"
              >
                <Save className="h-4 w-4" /> Save Workflow
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Right Side: Flow Designer */}
        <Card className="glass-card md:col-span-2 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GitCommit className="h-5 w-5 text-primary" /> Pipeline Flow Designer
            </CardTitle>
            <CardDescription>Assemble sequential approval stages in order (left to right)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {autoApprove ? (
              <div className="p-8 text-center text-sm text-emerald-400 bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-xl flex flex-col items-center gap-3">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
                <div>
                  <p className="font-bold">Auto Approval Enabled</p>
                  <p className="text-xs text-slate-500 mt-1">This request class will bypass sequential steps and activate instantly.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Pipeline */}
                <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl shadow-inner min-h-36 flex items-center overflow-x-auto gap-4">
                  {steps.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center w-full">No approval steps configured. Add roles below to build a pipeline.</p>
                  ) : (
                    <div className="flex items-center gap-4 w-full">
                      {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-4 shrink-0">
                          <div className="relative group p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col items-center gap-1.5 shadow-md">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Stage {index + 1}</span>
                            <span className="text-xs font-bold text-primary capitalize">{step}</span>
                            <button
                              onClick={() => removeStep(index)}
                              className="absolute -top-1.5 -right-1.5 bg-rose-500/10 border border-rose-500/25 p-1 rounded-full text-rose-500 hover:bg-rose-500 hover:text-white transition-all scale-75 opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          {index < steps.length - 1 && (
                            <span className="text-slate-600 font-bold text-lg">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Roles to Add */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-400 uppercase">Available Stages (Click to append)</h4>
                    {steps.length > 0 && (
                      <button onClick={clearSteps} className="text-xs text-rose-450 hover:underline">
                        Reset Flow
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {roles.map(role => (
                      <button
                        key={role}
                        onClick={() => addStep(role)}
                        className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800 hover:border-primary/50 rounded-xl text-xs text-slate-300 font-bold transition-all hover:scale-[1.02]"
                      >
                        <span className="capitalize">{role}</span>
                        <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex gap-3 text-xs text-slate-400">
              <Info className="h-4.5 w-4.5 text-primary shrink-0" />
              <div>
                <p className="font-bold text-slate-200">How approval works:</p>
                <p className="mt-1 leading-relaxed">When a request is submitted, it enters stage 1. Only administrators possessing the designated role for that stage can approve it. Upon final stage approval, the user account, parental linkages, and Special Codes are auto-generated.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
