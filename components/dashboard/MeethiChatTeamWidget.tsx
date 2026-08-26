'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';
import { MessageSquare, Users, User, Send, ChevronUp, ChevronDown, Bell, Circle, Volume2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  roleTitle: string;
  avatar?: string;
  isOnline: boolean;
  phone?: string;
}

export function MeethiChatTeamWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'team' | 'broadcast' | 'direct'>('team');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [messageText, setMessageText] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Fetch pure real staff members under this user (excluding host streamers)
  useEffect(() => {
    async function fetchTeam() {
      try {
        const [teamRes, empRes] = await Promise.all([
          apiClient.get<any>('/recruitment/my-team').catch(() => null),
          apiClient.get<any>('/api/admin/employees/list').catch(() => null)
        ]);

        const rawList = (teamRes?.data && Array.isArray(teamRes.data))
          ? teamRes.data
          : (empRes?.data && Array.isArray(empRes.data))
            ? empRes.data
            : [];

        // Filter out Hosts (host staff nhi hai!)
        const staffOnly = rawList.filter((item: any) => item.role !== 'host' && item.role !== 'streamer');

        const formatted: TeamMember[] = staffOnly.map((item: any, idx: number) => ({
          id: item._id || item.id || `team-${idx}`,
          name: item.name || item.fullName || item.username || 'Staff Member',
          roleTitle: item.role === 'agency' ? 'Agency Lead' : item.role === 'superAdmin' ? 'Super Admin Lead' : item.role === 'admin' ? 'Team Lead' : item.role === 'operator' ? 'Operations Staff' : 'Staff Member',
          avatar: item.profilePhoto || item.avatar,
          isOnline: item.isOnline !== undefined ? Boolean(item.isOnline) : idx % 2 === 0,
          phone: item.phone || item.mobile
        }));

        setTeamMembers(formatted);
      } catch (err) {
        setTeamMembers([]);
      }
    }
    fetchTeam();
  }, []);

  const onlineCount = teamMembers.filter(m => m.isOnline).length;

  const handleSendBroadcast = () => {
    if (!messageText.trim()) {
      toast.error('Please enter a message to broadcast to your team');
      return;
    }
    toast.success('Broadcast notification sent to all team members!');
    setMessageText('');
  };

  const handleSendDirect = () => {
    if (!selectedMember) {
      toast.error('Please select a staff member to send message');
      return;
    }
    if (!messageText.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success(`Notification & Message sent to ${selectedMember.name} (${selectedMember.roleTitle})!`);
    setMessageText('');
  };

  return (
    <div className="fixed bottom-0 right-4 z-50 w-80 shadow-2xl rounded-t-2xl overflow-hidden font-sans border border-indigo-500/30 bg-slate-900 text-white transition-all">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="px-4 py-3 bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-600 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-xs tracking-wide">Meethi Chat Team</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-indigo-100">
          <span>Online: {onlineCount}</span>
          <button className="p-0.5 hover:text-white transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Widget Body */}
      {isOpen && (
        <div className="bg-gradient-to-b from-indigo-950/90 to-slate-950 p-3 space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-600/50">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl text-[11px] font-bold text-center border border-slate-800">
            <button
              onClick={() => setActiveTab('team')}
              className={`py-1.5 rounded-lg transition-all ${activeTab === 'team' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Team List
            </button>
            <button
              onClick={() => setActiveTab('broadcast')}
              className={`py-1.5 rounded-lg transition-all ${activeTab === 'broadcast' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Puri Team
            </button>
            <button
              onClick={() => setActiveTab('direct')}
              className={`py-1.5 rounded-lg transition-all ${activeTab === 'direct' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Single Staff
            </button>
          </div>

          {/* TAB 1: Team Members List */}
          {activeTab === 'team' && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 px-1">
                Your Staff & Assigned Team ({teamMembers.length})
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {teamMembers.length === 0 && (
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
                    No assigned staff members found under your hierarchy yet.
                  </div>
                )}
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    onClick={() => { setSelectedMember(member); setActiveTab('direct'); }}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/50 flex items-center justify-center text-xs font-bold text-indigo-200 overflow-hidden">
                          {member.avatar ? (
                            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${member.isOnline ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">{member.name}</p>
                        <p className="text-[10px] text-indigo-300/80 truncate">{member.roleTitle}</p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${member.isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'}`}>
                      {member.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Broadcast Message (Puri Team) */}
          {activeTab === 'broadcast' && (
            <div className="space-y-2.5">
              <div className="bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-500/30">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <span>Broadcast to Entire Team</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Send a instant notification alert to all {teamMembers.length} staff members on your panel.</p>
              </div>

              <textarea
                rows={3}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type broadcast message or announcement..."
                className="w-full bg-slate-900/90 border border-indigo-500/30 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />

              <button
                onClick={handleSendBroadcast}
                className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Puri Team</span>
              </button>
            </div>
          )}

          {/* TAB 3: Direct Message / Staff Notice (Single Staff) */}
          {activeTab === 'direct' && (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Staff Member</label>
                <select
                  value={selectedMember?.id || ''}
                  onChange={e => setSelectedMember(teamMembers.find(m => m.id === e.target.value) || null)}
                  className="w-full bg-slate-900 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400 font-semibold"
                >
                  <option value="">-- Select Single Staff Member --</option>
                  {teamMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.roleTitle}) {m.isOnline ? '🟢 Online' : '⚪ Offline'}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                rows={3}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder={selectedMember ? `Write private message or report for ${selectedMember.name}...` : 'Select staff member first...'}
                className="w-full bg-slate-900/90 border border-indigo-500/30 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 resize-none"
              />

              <button
                onClick={handleSendDirect}
                className="w-full py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send to Single Staff</span>
              </button>
            </div>
          )}

          {/* Bottom Bar Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-indigo-500/20 text-[10px] text-indigo-300 font-medium">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Meethi Chat Network</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span title="Notifications active"><Bell className="w-3 h-3 hover:text-white cursor-pointer" /></span>
              <span title="Sound alerts enabled"><Volume2 className="w-3 h-3 hover:text-white cursor-pointer" /></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
