'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { ListTodo, Plus, Trash2, Calendar, CheckSquare, Clock, AlertCircle, ShieldCheck, UserCheck, CheckCircle2, Play } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TaskItem {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignedRole: string;
  assigneeName?: string;
  priority: 'High' | 'Medium' | 'Normal';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  createdAt: string;
}

export default function TasksPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'assignedToMe' | 'assignNew'>('assignedToMe');

    // Tasks assigned by Senior Leads to User
    const [seniorTasks, setSeniorTasks] = useState<TaskItem[]>([
      {
        id: 'st-1',
        title: 'Review Weekly Agency Host Audition Applications',
        description: 'Verify document validity and 30-sec voice recordings for 15 pending host applications in Maharashtra region.',
        assignedBy: 'Rajesh Malhotra',
        assignedRole: 'Platform Owner',
        priority: 'High',
        status: 'In Progress',
        dueDate: '2026-08-28',
        createdAt: '2026-08-26 10:00'
      },
      {
        id: 'st-2',
        title: 'Audit Top 10 Diamond Recharges & Merchant Settlement',
        description: 'Cross-check coin seller ledger statements with bank settlement receipts for August week 3.',
        assignedBy: 'Siddharth Lead',
        assignedRole: 'Super Admin Lead',
        priority: 'High',
        status: 'Pending',
        dueDate: '2026-08-29',
        createdAt: '2026-08-26 14:30'
      },
      {
        id: 'st-3',
        title: 'Update Team Leader WhatsApp Support Contact Number',
        description: 'Ensure all onboarding referral landing pages display the active team leader WhatsApp contact.',
        assignedBy: 'Deepak Kumar',
        assignedRole: 'Business Developer',
        priority: 'Normal',
        status: 'Completed',
        dueDate: '2026-08-27',
        createdAt: '2026-08-25 09:15'
      }
    ]);

    // Create New Task Form State
    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [assigneeName, setAssigneeName] = useState('Ayushi Sharma (Agency Lead)');
    const [priority, setPriority] = useState<'High' | 'Medium' | 'Normal'>('High');
    const [dueDate, setDueDate] = useState('2026-08-30');

    const handleUpdateStatus = (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
      setSeniorTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, status: newStatus };
        }
        return t;
      }));
      toast.success(`Task status updated to "${newStatus}"!`);
    };

    const handleAssignNewTask = (e: React.FormEvent) => {
      e.preventDefault();
      if (!taskTitle.trim() || !taskDescription.trim()) return;

      const newTask: TaskItem = {
        id: `st-${Date.now()}`,
        title: taskTitle,
        description: taskDescription,
        assignedBy: user?.name || 'Shivansh Bajpeyi',
        assignedRole: user?.role || 'Admin Lead',
        assigneeName,
        priority,
        status: 'Pending',
        dueDate,
        createdAt: new Date().toLocaleString('en-IN')
      };

      setSeniorTasks([newTask, ...seniorTasks]);
      toast.success(`Task "${taskTitle}" assigned to ${assigneeName}!`);
      setTaskTitle('');
      setTaskDescription('');
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto font-sans">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Senior & Staff Tasks Center</h2>
                    <p className="text-muted-foreground mt-1 font-medium text-xs">View tasks assigned by your Senior management and delegate operational tasks to your team.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 w-fit text-xs font-bold">
              <button
                onClick={() => setActiveTab('assignedToMe')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'assignedToMe' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks Given by Senior ({seniorTasks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('assignNew')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${activeTab === 'assignNew' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Plus className="w-4 h-4" />
                <span>Assign Task to Staff</span>
              </button>
            </div>

            {/* TAB 1: Tasks Assigned by Senior */}
            {activeTab === 'assignedToMe' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {seniorTasks.map(task => (
                    <Card key={task.id} className="glass-card border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-lg">
                      <CardHeader className="p-5 pb-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            task.priority === 'High'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : task.priority === 'Medium'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                          }`}>
                            {task.priority} Priority
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            task.status === 'Completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : task.status === 'In Progress'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            {task.status}
                          </span>
                        </div>

                        <CardTitle className="text-sm font-bold text-slate-100 leading-snug">{task.title}</CardTitle>
                        <CardDescription className="text-xs text-slate-300 mt-2 leading-relaxed">{task.description}</CardDescription>
                      </CardHeader>

                      <CardContent className="p-5 pt-0 space-y-4">
                        <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Assigned By Senior:</span>
                            <span className="font-bold text-indigo-400">{task.assignedBy} ({task.assignedRole})</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Target Due Date:</span>
                            <span className="font-mono text-slate-200 font-bold">{task.dueDate}</span>
                          </div>
                        </div>

                        {/* Status Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          {task.status !== 'Completed' && (
                            <>
                              {task.status === 'Pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  <span>Start Task</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'Completed')}
                                className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Mark Completed</span>
                              </button>
                            </>
                          )}
                          {task.status === 'Completed' && (
                            <div className="w-full py-1.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span>Task Verified & Completed</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Assign Task to Staff Form */}
            {activeTab === 'assignNew' && (
              <Card className="glass-card max-w-xl border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base font-bold text-slate-200 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-400" />
                    <span>Assign Operational Task to Staff</span>
                  </CardTitle>
                  <CardDescription className="text-xs">Delegate target task items to team members and staff</CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleAssignNewTask} className="space-y-4 text-xs">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Target Staff Member *</label>
                      <select
                        value={assigneeName}
                        onChange={e => setAssigneeName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-semibold"
                      >
                        <option value="Ayushi Sharma (Agency Lead)">Ayushi Sharma (Agency Lead)</option>
                        <option value="Deepak Kumar (Business Developer)">Deepak Kumar (Business Developer)</option>
                        <option value="Rahul Verma (Senior Manager)">Rahul Verma (Senior Manager)</option>
                        <option value="Priya Singh (Operations Lead)">Priya Singh (Operations Lead)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Task Objective Title *</label>
                      <Input
                        placeholder="e.g. Audit Daily Host Streaming Hours"
                        value={taskTitle}
                        onChange={e => setTaskTitle(e.target.value)}
                        required
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-300">Priority</label>
                        <select
                          value={priority}
                          onChange={e => setPriority(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Normal">Normal</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-300">Due Date</label>
                        <Input
                          type="date"
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                          className="bg-slate-950 border-slate-800 text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-300">Detailed Instructions *</label>
                      <Textarea
                        placeholder="Type detailed task steps and expectations..."
                        value={taskDescription}
                        onChange={e => setTaskDescription(e.target.value)}
                        required
                        rows={4}
                        className="bg-slate-950 border-slate-800 text-xs"
                      />
                    </div>

                    <Button type="submit" className="w-full font-bold text-xs py-2.5 bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-1.5" />
                      <span>Assign Task to Staff</span>
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
        </div>
    );
}
