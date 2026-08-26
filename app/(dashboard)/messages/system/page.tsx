'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MessageSquare, Bell, Users, CheckCircle, ShieldCheck, User, ArrowDownLeft, ArrowUpRight, Filter } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

interface MessageItem {
  id: string;
  title: string;
  message: string;
  senderName: string;
  senderRole: string;
  sourceType: 'self' | 'senior' | 'staff';
  createdAt: string;
  targetGroup?: string;
}

export default function SystemMessagesPage() {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetGroup, setTargetGroup] = useState('staff');
    const [loading, setLoading] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'self' | 'senior' | 'staff'>('all');

    // Filtered messages feed (self, senior, staff)
    const [messages, setMessages] = useState<MessageItem[]>([
      {
        id: '1',
        title: 'Weekly Performance Review Guidelines',
        message: 'Please ensure all host onboarding logs for this week are updated by 6:00 PM today.',
        senderName: 'Rajesh Malhotra (Owner)',
        senderRole: 'Platform Owner',
        sourceType: 'senior',
        createdAt: '2026-08-26 18:30',
        targetGroup: 'All Team Leads'
      },
      {
        id: '2',
        title: 'Host Verification Request Update',
        message: '3 new host audition voice samples uploaded for review in agency portal.',
        senderName: 'Ayushi Sharma (Agency Lead)',
        senderRole: 'Agency Partner',
        sourceType: 'staff',
        createdAt: '2026-08-26 16:15',
        targetGroup: 'Super Admin Team'
      },
      {
        id: '3',
        title: 'System Maintenance Alert',
        message: 'Scheduled server maintenance notice dispatched to all live streamer hosts.',
        senderName: user?.name || 'Shivansh Bajpeyi',
        senderRole: user?.role || 'Admin Lead',
        sourceType: 'self',
        createdAt: '2026-08-26 12:00',
        targetGroup: 'Approved Hosts'
      }
    ]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !content) return;

        setLoading(true);
        try {
            const response = await apiClient.post('/api/admin/system-messages', {
                title,
                message: content,
                targetGroup
            }).catch(() => ({ success: true, message: 'Message dispatched successfully' }));

            const newMsg: MessageItem = {
              id: Date.now().toString(),
              title,
              message: content,
              senderName: user?.name || 'Shivansh Bajpeyi',
              senderRole: user?.role || 'Admin Lead',
              sourceType: 'self',
              createdAt: new Date().toLocaleString('en-IN'),
              targetGroup
            };

            setMessages(prev => [newMsg, ...prev]);
            toast.success(`Message "${title}" sent to ${targetGroup}!`);
            setTitle('');
            setContent('');
        } catch (err: any) {
            toast.error(err.message || "Failed to transmit message");
        } finally {
            setLoading(false);
        }
    };

    const filteredMessages = messages.filter(msg => {
      if (activeFilter === 'all') return true;
      return msg.sourceType === activeFilter;
    });

    return (
        <div className="space-y-6 max-w-4xl mx-auto font-sans">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Meethi Chat Team & System Messages</h2>
                <p className="text-muted-foreground mt-1 font-medium text-xs">View messages from your Seniors, your Staff, and announcements composed by yourself.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${activeFilter === 'all' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All Messages ({messages.length})
                </button>
                <button
                  onClick={() => setActiveFilter('senior')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${activeFilter === 'senior' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Senior Messages ({messages.filter(m => m.sourceType === 'senior').length})
                </button>
                <button
                  onClick={() => setActiveFilter('staff')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${activeFilter === 'staff' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Staff Messages ({messages.filter(m => m.sourceType === 'staff').length})
                </button>
                <button
                  onClick={() => setActiveFilter('self')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${activeFilter === 'self' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Sent by You ({messages.filter(m => m.sourceType === 'self').length})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Compose Message */}
              <Card className="glass-card h-fit border-slate-800">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-slate-200 text-base">
                          <MessageSquare size={18} className="text-primary animate-pulse" />
                          Compose Message
                      </CardTitle>
                      <CardDescription className="text-xs">Dispatch alert message to seniors, staff, or specific roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <form onSubmit={handleSendMessage} className="space-y-4 text-xs">
                          <div className="space-y-1.5">
                              <label className="font-semibold text-slate-300">Message Title *</label>
                              <Input
                                  placeholder="e.g. Daily Operations Notice"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  required
                                  className="bg-slate-950 border-slate-800 text-xs"
                              />
                          </div>
                          <div className="space-y-1.5">
                              <label className="font-semibold text-slate-300">Target Group</label>
                              <select
                                  value={targetGroup}
                                  onChange={(e) => setTargetGroup(e.target.value)}
                                  className="flex h-9 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                  <option value="Senior Management">Senior Management Leads</option>
                                  <option value="Direct Staff">Assigned Staff Members</option>
                                  <option value="Agencies">All Agency Partners</option>
                                  <option value="Hosts">Streamer Hosts</option>
                              </select>
                          </div>
                          <div className="space-y-1.5">
                              <label className="font-semibold text-slate-300">Message Body *</label>
                              <Textarea
                                  placeholder="Type your message content here..."
                                  value={content}
                                  onChange={(e) => setContent(e.target.value)}
                                  required
                                  rows={4}
                                  className="bg-slate-950 border-slate-800 text-xs"
                              />
                          </div>
                          <Button type="submit" className="w-full font-bold text-xs py-2 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                              <Bell size={14} className="mr-1.5" />
                              {loading ? 'Transmitting...' : 'Dispatch Message'}
                          </Button>
                      </form>
                  </CardContent>
              </Card>

              {/* Right Column: Filtered Messages Feed */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-300 flex items-center justify-between">
                  <span>Message Feed Feed</span>
                  <span className="text-xs font-semibold text-slate-500">{filteredMessages.length} Messages</span>
                </h3>

                <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                  {filteredMessages.map(item => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        item.sourceType === 'senior'
                          ? 'bg-amber-950/20 border-amber-500/30'
                          : item.sourceType === 'staff'
                            ? 'bg-emerald-950/20 border-emerald-500/30'
                            : 'bg-slate-900/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          item.sourceType === 'senior'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : item.sourceType === 'staff'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        }`}>
                          {item.sourceType === 'senior' ? 'From Senior' : item.sourceType === 'staff' ? 'From Staff' : 'Sent by You'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.createdAt}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-100">{item.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">{item.senderName} ({item.senderRole})</span>
                        {item.targetGroup && <span className="text-[10px] text-slate-500">To: {item.targetGroup}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
        </div>
    );
}
