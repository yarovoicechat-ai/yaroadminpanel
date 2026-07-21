'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Shield, Users, Layers, Key, Eye, Search, Save, FolderOpen, UserCheck,
  ChevronDown, ChevronRight, CheckSquare, Square, RefreshCw, Lock, AlertTriangle,
  FileText, Coins, Award, Briefcase, HelpCircle, PhoneCall, DollarSign, Settings,
  Activity, Filter, CheckCircle2, History, Bot, Sparkles, Send, ShieldAlert,
  Sliders, Info, Plus, GitCompare, Calendar, Eye as EyeIcon, PieChart, Clock,
  ArrowRight, ShieldCheck, UserX
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

// Roles Configuration (System + Custom Roles)
const initialSystemRoles = [
  { id: 'owner', label: 'Owner', badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'superAdmin', label: 'Super Admin', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'admin', label: 'Admin', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'operator', label: 'Operator', badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  { id: 'agency', label: 'Agency', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'coinSeller', label: 'Seller', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  { id: 'host', label: 'Host', badge: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  { id: 'customerSupport', label: 'Customer Support', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' }
];

// Permission Presets (1-Click Templates)
const permissionPresets = [
  { name: 'Full Access', desc: 'Complete access to all pages, fields, and actions', role: 'owner' },
  { name: 'Read Only', desc: 'View dashboards and data tables, zero modification rights', role: 'admin' },
  { name: 'Finance Manager', desc: 'Withdrawal approval, coin/diamond balances, financial ledgers', role: 'admin' },
  { name: 'Moderator', desc: 'Ban users, end calls, review reports', role: 'operator' },
  { name: 'Customer Support', desc: 'Read reports, handle ticket queues', role: 'customerSupport' },
  { name: 'Agency Manager', desc: 'Manage agency hosts, view commission shares', role: 'agency' }
];

// Permission Categories
const categories = [
  'All', 'General', 'Financial', 'Moderation', 'Reports', 'Settings', 'Security', 'Analytics', 'Administration'
];

interface PermissionField {
  key: string;
  label: string;
  actions: string[];
}

interface PermissionModule {
  id: string;
  name: string;
  category: string;
  icon: any;
  actions: string[];
  fields: PermissionField[];
}

const initialModuleHierarchy: PermissionModule[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    category: 'Analytics',
    icon: Activity,
    actions: ['View Dashboard', 'View Statistics', 'View Revenue', 'View Charts', 'Export Dashboard'],
    fields: [
      { key: 'minutesToday', label: "Today's Minutes", actions: ['View'] },
      { key: 'coinsSpentToday', label: 'Coins Spent Today', actions: ['View'] },
      { key: 'hostEarningsToday', label: 'Host Earnings Today', actions: ['View'] },
      { key: 'revenueToday', label: "Today's Revenue", actions: ['View'] }
    ]
  },
  {
    id: 'users',
    name: 'User Management',
    category: 'General',
    icon: Users,
    actions: ['View Users', 'Create User', 'Edit User', 'Delete User', 'Suspend User', 'Reset Password', 'Change Coins', 'Change Diamonds', 'Change Level', 'View Wallet', 'View KYC', 'View Call History'],
    fields: [
      { key: 'name', label: 'Name', actions: ['View', 'Edit'] },
      { key: 'email', label: 'Email', actions: ['View', 'Edit'] },
      { key: 'mobileNumber', label: 'Mobile Number', actions: ['View', 'Edit'] },
      { key: 'coins', label: 'Coins Balance', actions: ['View', 'Edit'] },
      { key: 'diamonds', label: 'Diamonds Balance', actions: ['View', 'Edit'] }
    ]
  },
  {
    id: 'agency',
    name: 'Agency Management',
    category: 'Administration',
    icon: Briefcase,
    actions: ['View Agencies', 'Create Agency', 'Edit Agency', 'Delete Agency', 'Approve Agency', 'Reject Agency', 'View Earnings', 'Assign Hosts'],
    fields: [
      { key: 'agencyCode', label: 'Agency Code', actions: ['View'] },
      { key: 'commissionRate', label: 'Commission Rate (%)', actions: ['View', 'Edit'] }
    ]
  },
  {
    id: 'seller',
    name: 'Seller Management',
    category: 'Financial',
    icon: Coins,
    actions: ['View Sellers', 'Create Seller', 'Edit Seller', 'Delete Seller', 'Approve Seller'],
    fields: [
      { key: 'sellerCode', label: 'Seller Code', actions: ['View'] },
      { key: 'coinStock', label: 'Coin Stock Balance', actions: ['View', 'Edit'] }
    ]
  },
  {
    id: 'host',
    name: 'Host Management',
    category: 'General',
    icon: Award,
    actions: ['View Hosts', 'Approve Host', 'Reject Host', 'Ban Host', 'Remove Host', 'View Earnings'],
    fields: [
      { key: 'hostCode', label: 'Host Code', actions: ['View'] },
      { key: 'callRate', label: 'Call Rate (coins/min)', actions: ['View', 'Edit'] }
    ]
  },
  {
    id: 'call',
    name: 'Call Management',
    category: 'Moderation',
    icon: PhoneCall,
    actions: ['View Calls', 'End Call', 'Refund Coins', 'View Recordings'],
    fields: [
      { key: 'duration', label: 'Call Duration (seconds)', actions: ['View'] }
    ]
  },
  {
    id: 'coin',
    name: 'Coin Management',
    category: 'Financial',
    icon: Coins,
    actions: ['View Wallet', 'Add Coins', 'Remove Coins', 'Manual Recharge', 'Refund'],
    fields: [
      { key: 'coinBalance', label: 'User Coin Balance', actions: ['View', 'Edit'] }
    ]
  },
  {
    id: 'withdraw',
    name: 'Withdraw Management',
    category: 'Financial',
    icon: DollarSign,
    actions: ['View Requests', 'Approve Withdrawal', 'Reject', 'Hold'],
    fields: [
      { key: 'payoutAmount', label: 'Payout Amount', actions: ['View'] }
    ]
  },
  {
    id: 'reports',
    name: 'Reports & Compliance',
    category: 'Reports',
    icon: FileText,
    actions: ['View Reports', 'Resolve Report', 'Close Report', 'Ban User'],
    fields: [
      { key: 'reason', label: 'Report Description', actions: ['View'] }
    ]
  },
  {
    id: 'permissionBuilder',
    name: 'Permission Builder',
    category: 'Security',
    icon: Key,
    actions: ['View Permissions', 'Edit Permissions'],
    fields: [
      { key: 'permissionMatrix', label: 'Permission Matrix Grants', actions: ['View', 'Edit'] }
    ]
  }
];

export default function EnterprisePermissionBuilder4() {
  const [targetType, setTargetType] = useState<'role' | 'user'>('role');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [searchUserId, setSearchUserId] = useState('');
  const [userId, setUserId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Roles list (system + custom roles)
  const [rolesList, setRolesList] = useState(initialSystemRoles);
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleInherit, setNewRoleInherit] = useState('');

  // Scheduled Temporary Expiry
  const [expiresAt, setExpiresAt] = useState('');

  // Modules hierarchy
  const [modules, setModules] = useState<PermissionModule[]>(initialModuleHierarchy);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    dashboard: true,
    users: true
  });

  // Actions and Field grants
  const [actionsGranted, setActionsGranted] = useState<Record<string, boolean>>({});

  // Compare Mode state
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareRoleB, setCompareRoleB] = useState('agency');
  const [compareDiff, setCompareDiff] = useState<any[]>([]);

  // Simulation Preview Mode
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  // Version History state
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Modals & Drawers
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [riskAssessment, setRiskAssessment] = useState<{ riskLevel: string; risks: any[] }>({
    riskLevel: 'LOW',
    risks: []
  });

  // Load Permissions
  const loadPermissions = async () => {
    setLoading(true);
    try {
      const id = targetType === 'role' ? selectedRole : userId;
      if (!id) {
        setLoading(false);
        return;
      }

      const res = await apiClient.get(`/api/ems/permissions?targetType=${targetType}&targetId=${id}`);
      if (res.success && res.data) {
        const loadedActions: Record<string, boolean> = {};
        (res.data.actions || []).forEach((act: string) => {
          loadedActions[act] = true;
        });

        setActionsGranted(loadedActions);
        runAIRiskAnalysis(selectedRole, Object.keys(loadedActions).filter(k => loadedActions[k]));
        toast.success(`Loaded IAM permissions for ${targetType === 'role' ? selectedRole.toUpperCase() : 'User ' + id}`);
      }
    } catch (error) {
      toast.error('Error loading permission matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetType === 'role') loadPermissions();
  }, [selectedRole, targetType]);

  const runAIRiskAnalysis = async (role: string, grantedList: string[]) => {
    try {
      const res = await apiClient.post('/api/ems/ai-risk-analysis', { role, actions: grantedList });
      if (res.success && res.data) {
        setRiskAssessment({
          riskLevel: res.data.riskLevel,
          risks: res.data.risks || []
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Custom Role
  const handleCreateCustomRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      setLoading(true);
      const res = await apiClient.post('/api/ems/roles/custom', {
        roleName: newRoleName,
        description: newRoleDesc,
        parentRoleInherit: newRoleInherit
      });

      if (res.success && res.data) {
        const roleId = res.data.targetId;
        const newRoleObj = {
          id: roleId,
          label: newRoleName,
          badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        };
        setRolesList([...rolesList, newRoleObj]);
        setSelectedRole(roleId);
        setShowCreateRoleModal(false);
        setNewRoleName('');
        setNewRoleDesc('');
        toast.success(`Custom role '${newRoleName}' created and selected!`);
      }
    } catch (err) {
      toast.error('Failed to create custom role.');
    } finally {
      setLoading(false);
    }
  };

  // Compare Permissions
  const handleCompare = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/ems/permissions/compare-detailed?roleA=${selectedRole}&roleB=${compareRoleB}`);
      if (res.success && res.data) {
        setCompareDiff(res.data.matrix || []);
        setShowCompareModal(true);
      }
    } catch (err) {
      toast.error('Failed to compare permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Sync Permissions (Auto Discovery)
  const handleSyncPermissions = async () => {
    try {
      setIsSyncing(true);
      const res = await apiClient.post('/api/ems/sync-permissions');
      if (res.success && res.data) {
        toast.success(`Auto-discovered ${res.data.totalModulesDiscovered} routes & modules!`);
      }
    } catch (err) {
      toast.error('Auto discovery sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  // AI Assistant Natural Language Command
  const handleAIPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    try {
      setAiLoading(true);
      const res = await apiClient.post('/api/ems/ai-assistant', {
        prompt: aiPrompt,
        targetRole: selectedRole
      });

      if (res.success && res.data) {
        setAiMessage(res.message);
        setActionsGranted(prev => ({
          ...prev,
          ...(res.data.mutations || {})
        }));
        toast.success('AI Assistant updated permission matrix!');
        setAiPrompt('');
      }
    } catch (err) {
      toast.error('AI prompt processing failed.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save Permissions
  const savePermissions = async () => {
    const id = targetType === 'role' ? selectedRole : userId;
    if (!id) return;

    try {
      setLoading(true);
      const grantedActionList = Object.keys(actionsGranted).filter(k => actionsGranted[k]);

      const res = await apiClient.post('/api/ems/permissions', {
        targetType,
        targetId: id,
        permissions: {
          menus: ['Dashboard', 'Users', 'Host', 'Agency', 'Coin Seller', 'Reports', 'Notifications', 'Finance', 'Settings', 'Developer'],
          actions: grantedActionList,
          buttons: grantedActionList,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        }
      });

      if (res.success) {
        toast.success('Enterprise IAM 4.0 permissions saved successfully!');
        runAIRiskAnalysis(selectedRole, grantedActionList);
      }
    } catch (error) {
      toast.error('Error saving permissions.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (modId: string) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const setAllAccordions = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    modules.forEach(m => { updated[m.id] = expand; });
    setExpandedModules(updated);
  };

  const toggleAction = (actionName: string) => {
    setActionsGranted(prev => ({ ...prev, [actionName]: !prev[actionName] }));
  };

  const toggleEntireModule = (mod: PermissionModule) => {
    const isAllSelected = mod.actions.every(a => actionsGranted[a]);
    const updated = { ...actionsGranted };
    mod.actions.forEach(a => { updated[a] = !isAllSelected; });
    setActionsGranted(updated);
  };

  const filteredModules = useMemo(() => {
    return modules.filter(mod => {
      const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || (
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.actions.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return matchesCategory && matchesSearch;
    });
  }, [modules, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Top Header & IAM 4.0 Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            Enterprise IAM & Permission Engine 4.0
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic Custom Roles, User Overrides, AI Risk Analyzer, Version Restore & Compare Engine
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Create Custom Role Button */}
          <button
            onClick={() => setShowCreateRoleModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs px-3.5 py-2.5 rounded-xl text-white shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>

          {/* Compare Roles Button */}
          <button
            onClick={handleCompare}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl text-slate-200 transition-all shadow-md"
          >
            <GitCompare className="w-4 h-4 text-purple-400" />
            Compare
          </button>

          {/* Simulation Preview Mode Button */}
          <button
            onClick={() => setShowSimulationModal(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl text-slate-200 transition-all shadow-md"
          >
            <EyeIcon className="w-4 h-4 text-teal-400" />
            Preview As Role
          </button>

          {/* Auto Discovery Sync Button */}
          <button
            onClick={handleSyncPermissions}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl text-slate-200 transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync
          </button>

          {/* AI Assistant Toggle */}
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 font-black text-xs px-4 py-2.5 rounded-xl text-white shadow-xl transition-all"
          >
            <Bot className="w-4 h-4 text-pink-300" />
            AI Assistant
          </button>

          {/* Save Matrix */}
          <button
            onClick={savePermissions}
            disabled={loading}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 font-black text-xs px-5 py-2.5 rounded-xl text-white shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Matrix
          </button>
        </div>
      </div>

      {/* AI Risk Assessment Warning Banner */}
      {riskAssessment.risks.length > 0 && (
        <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-rose-300">AI Risk Assessment:</span>
                <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md uppercase">
                  {riskAssessment.riskLevel} RISK DETECTED
                </span>
              </div>
              <p className="text-xs text-rose-200/80 mt-0.5">
                {riskAssessment.risks[0]?.recommendation}
              </p>
            </div>
          </div>
          <button
            onClick={() => toggleAction(riskAssessment.risks[0]?.action)}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shrink-0 shadow-lg"
          >
            Remove High Risk Clearance
          </button>
        </div>
      )}

      {/* Interactive AI Assistant Drawer */}
      {showAIAssistant && (
        <Card className="bg-slate-900/90 border-purple-500/40 backdrop-blur-2xl rounded-3xl p-6 space-y-4 shadow-2xl border-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider">AI Permission Copilot</h3>
            </div>
            <button onClick={() => setShowAIAssistant(false)} className="text-xs text-slate-400 hover:text-white font-bold">✕ Close</button>
          </div>

          <form onSubmit={handleAIPromptSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder='Try typing: "Create Finance Manager role" or "Agency should not edit coins but can view wallet"...'
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={aiLoading}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Execute Command
            </button>
          </form>

          {aiMessage && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-purple-200 flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400 shrink-0" />
              {aiMessage}
            </div>
          )}
        </Card>
      )}

      {/* Sticky Role & User Target Toolbar */}
      <div className="sticky top-2 z-20 bg-slate-900/90 backdrop-blur-2xl p-4 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Target Type Selector (Role vs User Override) */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTargetType('role')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                targetType === 'role' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Role Default
            </button>
            <button
              onClick={() => setTargetType('user')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                targetType === 'user' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              User Override
            </button>
          </div>

          {/* Role or User Search Selection */}
          {targetType === 'role' ? (
            <div className="flex items-center gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {rolesList.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="User UID or MongoDB ID"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => setUserId(searchUserId)}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-3 py-2 rounded-xl text-white"
              >
                Find
              </button>
            </div>
          )}

          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Temporary Expiry Picker */}
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {/* 1-Click Permission Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-none">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 mr-1">Presets:</span>
          {permissionPresets.map(preset => (
            <button
              key={preset.name}
              onClick={() => {
                setSelectedRole(preset.role);
                toast.success(`Applied preset template: ${preset.name}`);
              }}
              className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 shrink-0 transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Permission Modules Hierarchy */}
      <div className="space-y-4">
        {filteredModules.map(mod => {
          const ModIcon = mod.icon;
          const isExpanded = expandedModules[mod.id] ?? false;
          const isAllSelected = mod.actions.every(a => actionsGranted[a]);
          const selectedCount = mod.actions.filter(a => actionsGranted[a]).length;

          return (
            <Card key={mod.id} className="bg-slate-900/80 border-slate-800 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl transition-all">
              <div className="p-4 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => toggleAccordion(mod.id)}>
                  <button className="text-slate-400 hover:text-white">
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-400" /> : <ChevronRight className="w-5 h-5 text-slate-500" />}
                  </button>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <ModIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">{mod.name}</h3>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                        {mod.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {selectedCount} of {mod.actions.length} actions granted
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleEntireModule(mod)}
                  className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    isAllSelected ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {isAllSelected ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4 text-slate-500" />}
                  Select All
                </button>
              </div>

              {isExpanded && (
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {mod.actions.map(action => {
                      const isChecked = actionsGranted[action] ?? false;
                      return (
                        <label
                          key={action}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold cursor-pointer select-none transition-all ${
                            isChecked
                              ? 'bg-indigo-600/10 border-indigo-500/40 text-indigo-400 shadow-inner'
                              : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <input type="checkbox" checked={isChecked} onChange={() => toggleAction(action)} className="hidden" />
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${isChecked ? 'bg-indigo-600 border-indigo-500' : 'border-slate-700'}`}>
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="truncate">{action}</span>
                        </label>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Create Custom Role Modal */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Create Custom Role
              </h3>
              <button onClick={() => setShowCreateRoleModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateCustomRole} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Role Name</label>
                <input
                  type="text"
                  placeholder="e.g. Finance Manager"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  placeholder="Role clearance scope description..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white h-20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white shadow-lg"
              >
                Create Role
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Compare Roles Modal */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-purple-400" /> Compare Permissions: {selectedRole.toUpperCase()} vs {compareRoleB.toUpperCase()}
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-white font-bold text-sm">✕</button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {compareDiff.map((item, i) => (
                <div key={i} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${item.isDifferent ? 'bg-amber-950/20 border-amber-500/30' : 'bg-slate-950 border-slate-800'}`}>
                  <span className="font-bold text-slate-200">{item.action}</span>
                  <div className="flex gap-4">
                    <span className={item[selectedRole] ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {selectedRole}: {item[selectedRole] ? 'YES' : 'NO'}
                    </span>
                    <span className={item[compareRoleB] ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {compareRoleB}: {item[compareRoleB] ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
