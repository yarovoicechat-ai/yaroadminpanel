'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import * as LucideIcons from 'lucide-react';
import {
  Shield, Users, Layers, Key, Eye, Search, Save, FolderOpen, UserCheck,
  ChevronDown, ChevronRight, CheckSquare, Square, RefreshCw, Lock, AlertTriangle,
  FileText, Coins, Award, Briefcase, HelpCircle, PhoneCall, DollarSign, Settings,
  Activity, Filter, CheckCircle2, History, Bot, Sparkles, Send, ShieldAlert,
  Sliders, Info, Plus, GitCompare, Calendar, Eye as EyeIcon, PieChart, Clock,
  ArrowRight, ShieldCheck, UserX, Copy, CheckSquare as CheckSquareIcon, Download, Upload
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

// System/Default Roles
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

// Permission Categories
const categories = [
  'All', 'General', 'Financial', 'Moderation', 'Reports', 'Settings', 'Security', 'Analytics', 'Administration'
];

// Helper to dynamically load Lucide icons to prevent crash
const getModIcon = (iconName?: string) => {
  if (!iconName) return ShieldCheck;
  const Resolved = (LucideIcons as any)[iconName];
  return Resolved || ShieldCheck;
};

export default function EnterprisePermissionBuilder4() {
  const [targetType, setTargetType] = useState<'role' | 'user'>('role');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [searchUserId, setSearchUserId] = useState('');
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Advanced Controls States
  const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [showDuplicateRoleModal, setShowDuplicateRoleModal] = useState(false);
  
  // Custom Role State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRoleInherit, setNewRoleInherit] = useState('');
  const [rolesList, setRolesList] = useState(initialSystemRoles);

  // Clone/Copy State
  const [cloneSourceType, setCloneSourceType] = useState<'role' | 'user'>('role');
  const [cloneSourceId, setCloneSourceId] = useState('admin');
  const [cloneTargetType, setCloneTargetType] = useState<'role' | 'user'>('user');
  const [cloneTargetId, setCloneTargetId] = useState('');

  // Duplicate Role State
  const [duplicateSourceRole, setDuplicateSourceRole] = useState('admin');
  const [duplicateNewRoleName, setDuplicateNewRoleName] = useState('');
  const [duplicateDescription, setDuplicateDescription] = useState('');

  // Scheduled Temporary Expiry
  const [expiresAt, setExpiresAt] = useState('');
  const [auditLogReason, setAuditLogReason] = useState('');

  // Dynamic modules registry loaded from backend
  const [modules, setModules] = useState<any[]>([]);
  const [openTreeNodes, setOpenTreeNodes] = useState<Record<string, boolean>>({});

  // Actions and columns visibility mappings
  const [actionsGranted, setActionsGranted] = useState<Record<string, boolean>>({});
  const [columnsGranted, setColumnsGranted] = useState<Record<string, string[]>>({});
  const [pagesGranted, setPagesGranted] = useState<Record<string, boolean>>({});

  // Compare Mode state
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareRoleB, setCompareRoleB] = useState('agency');
  const [compareDiff, setCompareDiff] = useState<any[]>([]);

  // Simulation Preview Mode
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  // Version History state
  const [showVersionModal, setShowVersionModal] = useState(false);

  // Audit Logs drawer
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Modals & Drawers Loading state
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

  // Read URL parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const qType = params.get('targetType');
      const qId = params.get('targetId');
      const qName = params.get('name');
      if (qType === 'user' && qId) {
        setTargetType('user');
        setUserId(qId);
        setSearchUserId(qId);
        if (qName) setUserName(qName);
      } else if (qType === 'role' && qId) {
        setTargetType('role');
        setSelectedRole(qId);
      }
    }
  }, []);

  // Fetch registered pages from Dynamic Registry on mount
  const fetchRegisteredPages = async () => {
    try {
      const res = await apiClient.get('/api/ems/pages');
      if (res.success && res.data) {
        setModules(res.data);
        // Pre-expand dynamic tree nodes
        const defaultOpen: Record<string, boolean> = {};
        res.data.forEach((m: any) => {
          defaultOpen[m.pageId] = true;
          defaultOpen[m.pageId + '_actions'] = true;
          defaultOpen[m.pageId + '_columns'] = true;
        });
        setOpenTreeNodes(defaultOpen);
      }
    } catch (err) {
      console.error('Failed to load registered pages', err);
    }
  };

  useEffect(() => {
    fetchRegisteredPages();
  }, []);

  // Load Permissions policy from server
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
        const loadedPages: Record<string, boolean> = {};
        (res.data.pages || []).forEach((page: string) => {
          loadedPages[page] = true;
          loadedPages[page.replace(/^\//, '')] = true;
        });
        setPagesGranted(loadedPages);

        const loadedColumns: Record<string, string[]> = {};
        if (res.data.columns) {
          Object.keys(res.data.columns).forEach((key) => {
            loadedColumns[key] = res.data.columns[key] || [];
          });
        }
        setColumnsGranted(loadedColumns);

        runAIRiskAnalysis(selectedRole, Object.keys(loadedActions).filter(k => loadedActions[k]));
        toast.success(`Loaded IAM permissions policy for ${targetType === 'role' ? selectedRole.toUpperCase() : (userName ? userName : 'User ' + id)}`);
      }
    } catch (error) {
      toast.error('Error loading permission matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetType === 'role' || userId) {
      loadPermissions();
    }
  }, [selectedRole, targetType, userId]);

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

  // Duplicate Role
  const handleDuplicateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateNewRoleName.trim()) return;

    try {
      setLoading(true);
      const res = await apiClient.post('/api/ems/roles/duplicate', {
        sourceRole: duplicateSourceRole,
        newRoleName: duplicateNewRoleName,
        description: duplicateDescription
      });

      if (res.success) {
        const newRoleObj = {
          id: duplicateNewRoleName,
          label: duplicateNewRoleName,
          badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
        };
        setRolesList([...rolesList, newRoleObj]);
        setSelectedRole(duplicateNewRoleName);
        setShowDuplicateRoleModal(false);
        setDuplicateNewRoleName('');
        setDuplicateDescription('');
        toast.success(`Role duplicated successfully!`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to duplicate role.');
    } finally {
      setLoading(false);
    }
  };

  // Clone / Copy Permissions
  const handleClonePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneTargetId.trim()) return;

    try {
      setLoading(true);
      const res = await apiClient.post('/api/ems/permissions/clone', {
        sourceType: cloneSourceType,
        sourceId: cloneSourceType === 'role' ? cloneSourceId : cloneSourceId,
        targetType: cloneTargetType,
        targetId: cloneTargetId
      });

      if (res.success) {
        toast.success('Permissions cloned successfully!');
        setShowCloneModal(false);
        setCloneTargetId('');
        if (targetType === cloneTargetType && (userId === cloneTargetId || selectedRole === cloneTargetId)) {
          loadPermissions();
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to clone permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Export Permissions
  const handleExportPermissions = async () => {
    const id = targetType === 'role' ? selectedRole : userId;
    if (!id) return;

    try {
      setLoading(true);
      const res = await apiClient.get(`/api/ems/permissions/export?targetType=${targetType}&targetId=${id}`);
      if (res.success && res.data) {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.permissions, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `mitichat-iam-${targetType}-${id}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        toast.success('Permissions exported as JSON!');
      }
    } catch (err) {
      toast.error('Failed to export permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Import Permissions
  const handleImportPermissions = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const id = targetType === 'role' ? selectedRole : userId;
    if (!id || !e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        setLoading(true);
        const res = await apiClient.post('/api/ems/permissions/import', {
          targetType,
          targetId: id,
          permissions: parsed
        });

        if (res.success) {
          toast.success('Permissions imported and applied successfully!');
          loadPermissions();
        }
      } catch (err) {
        toast.error('Invalid JSON file or failed to import.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  // Fetch and show Audit Logs
  const handleShowAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/ems/audit-logs');
      if (res.success && res.data) {
        setAuditLogs(res.data);
        setShowAuditLogsModal(true);
      }
    } catch (err) {
      toast.error('Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  // Save Permissions Matrix policy
  const savePermissions = async () => {
    const id = targetType === 'role' ? selectedRole : userId;
    if (!id) return;

    try {
      setLoading(true);
      const grantedActionList = Object.keys(actionsGranted).filter(k => actionsGranted[k]);
      const grantedModules = modules.filter((mod) => pagesGranted[mod.pageId]);
      const grantedPages = grantedModules.map((mod) => mod.metadata?.route || `/${mod.pageId}`);
      const grantedMenus = [...new Set(grantedModules.map((mod) => mod.metadata?.menu || mod.category))];
      const fields: Record<string, boolean> = {};
      modules.forEach((mod) => {
        const dbKey = mod.pageId === 'users' ? 'user' : mod.pageId;
        const allowed = columnsGranted[dbKey] || [];
        (mod.fields || []).forEach((field: any) => {
          fields[field.key] = allowed.includes(field.key);
        });
      });

      const res = await apiClient.post('/api/ems/permissions', {
        targetType,
        targetId: id,
        reason: auditLogReason,
        permissions: {
          menus: grantedMenus,
          pages: grantedPages,
          modules: grantedModules.map((mod) => mod.pageId),
          actions: grantedActionList,
          fields,
          buttons: grantedActionList,
          columns: columnsGranted,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined
        }
      });

      if (res.success) {
        toast.success('Enterprise IAM 4.0 permissions policy saved successfully!');
        setAuditLogReason('');
        runAIRiskAnalysis(selectedRole, grantedActionList);
      }
    } catch (error) {
      toast.error('Error saving permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Sync / Auto Discovery
  const handleSyncPermissions = async () => {
    try {
      setIsSyncing(true);
      const res = await apiClient.post('/api/ems/sync-permissions');
      if (res.success) {
        toast.success('Dynamic API & Page Registry synchronization complete.');
        fetchRegisteredPages();
      }
    } catch (error) {
      toast.error('Sync failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  // AI Permission Copilot submit
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

  // Compare Role logic
  const handleCompare = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/ems/permissions/compare-detailed?roleA=${selectedRole}&roleB=${compareRoleB}`);
      if (res.success && res.data) {
        setCompareDiff(res.data.matrix || []);
        setShowCompareModal(true);
      }
    } catch (err) {
      toast.error('Comparison engine error.');
    } finally {
      setLoading(false);
    }
  };

  // Search filter registered tree modules
  const filteredModules = useMemo(() => {
    return modules.filter(mod => {
      const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory;
      const matchesSearch = !searchQuery.trim() || (
        mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.actions.some((a: string) => a.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return matchesCategory && matchesSearch;
    });
  }, [modules, selectedCategory, searchQuery]);

  const toggleTreeNode = (nodeId: string) => {
    setOpenTreeNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const isFieldChecked = (dbKey: string, key: string) => {
    return columnsGranted[dbKey]?.includes(key) ?? true;
  };

  const toggleFieldCheckbox = (dbKey: string, key: string, defaultFieldsList: string[]) => {
    setColumnsGranted(prev => {
      const current = prev[dbKey] || defaultFieldsList;
      const updated = current.includes(key)
        ? current.filter(k => k !== key)
        : [...current, key];
      return { ...prev, [dbKey]: updated };
    });
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-white">
      {/* Top Header & IAM 4.0 Control Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div>
          <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent uppercase flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
            Enterprise IAM & Access Control Platform
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Microsoft Azure-style Hierarchical Tree View, Dynamic Page Registry, Action & Field-Level Controls, Audit Logs
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Advanced Action Hub */}
          <button
            onClick={() => setShowCloneModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl text-slate-200 transition-all shadow-md"
            title="Clone / Copy permissions between roles and users"
          >
            <Copy className="w-4 h-4 text-amber-400" />
            Copy / Clone
          </button>

          <button
            onClick={() => setShowDuplicateRoleModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl text-slate-200 transition-all shadow-md"
            title="Duplicate existing role configuration"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            Duplicate Role
          </button>

          <button
            onClick={handleExportPermissions}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl text-slate-200 transition-all shadow-md"
            title="Export config as JSON file"
          >
            <Download className="w-4 h-4 text-green-400" />
            Export JSON
          </button>

          <label className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl text-slate-200 transition-all shadow-md cursor-pointer">
            <Upload className="w-4 h-4 text-blue-400" />
            Import JSON
            <input type="file" accept=".json" onChange={handleImportPermissions} className="hidden" />
          </label>

          <button
            onClick={handleShowAuditLogs}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-3 py-2 rounded-xl text-slate-200 transition-all shadow-md"
          >
            <History className="w-4 h-4 text-orange-400" />
            Audit Logs
          </button>

          <button
            onClick={() => setShowCreateRoleModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 font-bold text-xs px-3.5 py-2.5 rounded-xl text-white shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Role
          </button>

          <button
            onClick={handleCompare}
            className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 font-bold text-xs px-3.5 py-2.5 rounded-xl text-slate-200 transition-all"
          >
            <GitCompare className="w-4 h-4 text-purple-400" />
            Compare Roles
          </button>

          <button
            onClick={handleSyncPermissions}
            disabled={isSyncing}
            className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl text-slate-200 transition-all"
          >
            <RefreshCw className={`w-4 h-4 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Registry
          </button>

          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 font-black text-xs px-4 py-2.5 rounded-xl text-white shadow-xl transition-all"
          >
            <Bot className="w-4 h-4 text-pink-300" />
            AI Copilot
          </button>

          <button
            onClick={savePermissions}
            disabled={loading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 font-black text-xs px-5 py-2.5 rounded-xl text-white shadow-xl transition-all"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Policy
          </button>
        </div>
      </div>

      {/* User override banner warning */}
      {targetType === 'user' && (
        <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-indigo-400 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase text-indigo-300">User Override Mode Active:</span>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                You are editing custom permissions for user <strong>{userName || userId}</strong>. This overrides their role-based defaults.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTargetType('role');
              setUserId('');
              setSearchUserId('');
              setUserName('');
              if (typeof window !== 'undefined') {
                window.history.replaceState({}, document.title, window.location.pathname);
              }
              toast.info("Switched back to role configuration mode");
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs shrink-0 border border-slate-700 transition-colors"
          >
            Clear Override
          </button>
        </div>
      )}

      {/* Audit Log change Reason and Temporary Expiration Configuration */}
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Reason for Policy Change (Required for audit log trail)
          </label>
          <input
            type="text"
            placeholder="e.g., Extended dashboard view permission for Deepak super-admin override"
            value={auditLogReason}
            onChange={(e) => setAuditLogReason(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Temporary Expiration Expiry Date (Optional)
          </label>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* AI Copilot Drawer */}
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
              placeholder='Try typing: "Add Delete permission for Deepak super-admin override" or "Hide diamond fields for Admin role"...'
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
              Execute
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
          {/* Target Type Selector */}
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
                placeholder="Enter User MongoDB ID"
                value={searchUserId}
                onChange={(e) => setSearchUserId(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  if (searchUserId.trim()) {
                    setUserId(searchUserId.trim());
                    toast.info("User scope loaded!");
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs px-3 py-2 rounded-xl text-white transition-all shadow-md shrink-0"
              >
                Load
              </button>
              {userId && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('sim_user_id', userId);
                    localStorage.setItem('sim_user_name', userName || userId);
                    toast.success(`Simulation profile loaded for: ${userName || userId}`);
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                  className="bg-amber-600 hover:bg-amber-500 font-bold text-xs px-3 py-2 rounded-xl text-white transition-all shadow-md shrink-0"
                  title="Simulate this user view"
                >
                  Preview As
                </button>
              )}
            </div>
          )}

          {/* Real-time filters and search */}
          <div className="flex gap-2 col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search registered pages, sections, actions or columns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hierarchical Tree View Permission Matrix builder */}
      <div className="space-y-4 bg-slate-950/40 p-4 rounded-3xl border border-slate-900 shadow-inner">
        {filteredModules.map(mod => {
          const ModIcon = getModIcon(mod.icon);
          const isNodeOpen = openTreeNodes[mod.pageId] ?? true;
          const isActionsOpen = openTreeNodes[mod.pageId + '_actions'] ?? true;
          const isColumnsOpen = openTreeNodes[mod.pageId + '_columns'] ?? true;
          const isButtonsOpen = openTreeNodes[mod.pageId + '_buttons'] ?? true;
          const isTabsOpen = openTreeNodes[mod.pageId + '_tabs'] ?? true;
          const isFiltersOpen = openTreeNodes[mod.pageId + '_filters'] ?? true;
          const isWidgetsOpen = openTreeNodes[mod.pageId + '_widgets'] ?? true;

          const defaultFieldsKeys = (mod.fields || []).map((f: any) => f.key);
          const defaultButtonsKeys = (mod.buttons || []).map((b: any) => b.key);
          const defaultTabsKeys = (mod.tabs || []).map((t: any) => t.key);
          const defaultFiltersKeys = (mod.filters || []).map((f: any) => f.key);
          const defaultWidgetsKeys = (mod.widgets || []).map((w: any) => w.key);

          return (
            <div key={mod.pageId} className="border border-slate-850 rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-xl">
              {/* Root node header */}
              <div className="p-3.5 bg-slate-900/90 border-b border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTreeNode(mod.pageId)}>
                  {isNodeOpen ? <ChevronDown className="w-4 h-4 text-indigo-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  <ModIcon className="w-4.5 h-4.5 text-indigo-300" />
                  <span className="text-sm font-black text-slate-100 uppercase tracking-wide">{mod.name}</span>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-850 text-slate-400 border border-slate-800">
                    {mod.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-[10px] font-bold text-cyan-300">
                    <input
                      type="checkbox"
                      checked={pagesGranted[mod.pageId] ?? false}
                      onChange={() => setPagesGranted(prev => ({ ...prev, [mod.pageId]: !prev[mod.pageId] }))}
                      className="accent-cyan-500"
                    />
                    Page access
                  </label>
                  <button
                    onClick={() => {
                      const updated = { ...actionsGranted };
                      const allSelected = mod.actions.every((a: string) => actionsGranted[a]);
                      mod.actions.forEach((a: string) => {
                        updated[a] = !allSelected;
                      });
                      setActionsGranted(updated);
                    }}
                    className="text-[10px] font-bold bg-slate-850 hover:bg-slate-800 text-indigo-400 border border-indigo-500/10 px-2.5 py-1 rounded-md transition-colors"
                  >
                    Select All Actions
                  </button>
                </div>
              </div>

              {isNodeOpen && (
                <div className="p-4 space-y-4 bg-slate-950/20">
                  {/* Branch 1: Actions */}
                  {mod.actions && mod.actions.length > 0 && (
                    <div className="pl-4 border-l border-slate-800/60 space-y-2">
                      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTreeNode(mod.pageId + '_actions')}>
                        {isActionsOpen ? <ChevronDown className="w-3.5 h-3.5 text-purple-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">⚡ Actions Granted</span>
                      </div>
                      
                      {isActionsOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pl-4 pt-1">
                          {mod.actions.map((action: string) => {
                            const isChecked = actionsGranted[action] ?? false;
                            return (
                              <label
                                key={action}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer select-none transition-all ${
                                  isChecked ? 'bg-purple-600/15 border-purple-500/40 text-purple-400' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => setActionsGranted(prev => ({ ...prev, [action]: !isChecked }))}
                                  className="hidden"
                                />
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isChecked ? 'bg-purple-600 border-purple-500' : 'border-slate-700'}`}>
                                  {isChecked && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className="truncate">{action}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Branch 2: Fields & Columns */}
                  {mod.fields && mod.fields.length > 0 && (
                    <div className="pl-4 border-l border-slate-800/60 space-y-2">
                      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTreeNode(mod.pageId + '_columns')}>
                        {isColumnsOpen ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">📊 Fields & Columns Visibility</span>
                      </div>

                      {isColumnsOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pl-4 pt-1">
                          {mod.fields.map((f: any) => {
                            const dbKey = mod.pageId === 'users' ? 'user' : mod.pageId;
                            const isAllowed = isFieldChecked(dbKey, f.key);
                            return (
                              <label
                                key={f.key}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer select-none transition-all ${
                                  isAllowed ? 'bg-cyan-600/15 border-cyan-500/40 text-cyan-400' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => toggleFieldCheckbox(dbKey, f.key, defaultFieldsKeys)}
                                  className="hidden"
                                />
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isAllowed ? 'bg-cyan-600 border-cyan-500' : 'border-slate-700'}`}>
                                  {isAllowed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className="truncate">{f.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Branch 3: Buttons */}
                  {mod.buttons && mod.buttons.length > 0 && (
                    <div className="pl-4 border-l border-slate-800/60 space-y-2">
                      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTreeNode(mod.pageId + '_buttons')}>
                        {isButtonsOpen ? <ChevronDown className="w-3.5 h-3.5 text-pink-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-pink-400">🔘 Interactive Buttons</span>
                      </div>

                      {isButtonsOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pl-4 pt-1">
                          {mod.buttons.map((b: any) => {
                            const dbKey = mod.pageId + '_buttons';
                            const isAllowed = isFieldChecked(dbKey, b.key);
                            return (
                              <label
                                key={b.key}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer select-none transition-all ${
                                  isAllowed ? 'bg-pink-600/15 border-pink-500/40 text-pink-400' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => toggleFieldCheckbox(dbKey, b.key, defaultButtonsKeys)}
                                  className="hidden"
                                />
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isAllowed ? 'bg-pink-600 border-pink-500' : 'border-slate-700'}`}>
                                  {isAllowed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className="truncate">{b.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Branch 4: Tabs */}
                  {mod.tabs && mod.tabs.length > 0 && (
                    <div className="pl-4 border-l border-slate-800/60 space-y-2">
                      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTreeNode(mod.pageId + '_tabs')}>
                        {isTabsOpen ? <ChevronDown className="w-3.5 h-3.5 text-emerald-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">🗂️ Viewable Tabs</span>
                      </div>

                      {isTabsOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pl-4 pt-1">
                          {mod.tabs.map((t: any) => {
                            const dbKey = mod.pageId + '_tabs';
                            const isAllowed = isFieldChecked(dbKey, t.key);
                            return (
                              <label
                                key={t.key}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer select-none transition-all ${
                                  isAllowed ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-400' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => toggleFieldCheckbox(dbKey, t.key, defaultTabsKeys)}
                                  className="hidden"
                                />
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isAllowed ? 'bg-emerald-600 border-emerald-500' : 'border-slate-700'}`}>
                                  {isAllowed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className="truncate">{t.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Branch 5: Filters */}
                  {mod.filters && mod.filters.length > 0 && (
                    <div className="pl-4 border-l border-slate-800/60 space-y-2">
                      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTreeNode(mod.pageId + '_filters')}>
                        {isFiltersOpen ? <ChevronDown className="w-3.5 h-3.5 text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-400">🔍 Table Filters</span>
                      </div>

                      {isFiltersOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pl-4 pt-1">
                          {mod.filters.map((flt: any) => {
                            const dbKey = mod.pageId + '_filters';
                            const isAllowed = isFieldChecked(dbKey, flt.key);
                            return (
                              <label
                                key={flt.key}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer select-none transition-all ${
                                  isAllowed ? 'bg-amber-600/15 border-amber-500/40 text-amber-400' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => toggleFieldCheckbox(dbKey, flt.key, defaultFiltersKeys)}
                                  className="hidden"
                                />
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isAllowed ? 'bg-amber-600 border-amber-500' : 'border-slate-700'}`}>
                                  {isAllowed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className="truncate">{flt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Branch 6: Widgets */}
                  {mod.widgets && mod.widgets.length > 0 && (
                    <div className="pl-4 border-l border-slate-800/60 space-y-2">
                      <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => toggleTreeNode(mod.pageId + '_widgets')}>
                        {isWidgetsOpen ? <ChevronDown className="w-3.5 h-3.5 text-blue-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">🧩 Dashboard Widgets</span>
                      </div>

                      {isWidgetsOpen && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pl-4 pt-1">
                          {mod.widgets.map((w: any) => {
                            const dbKey = mod.pageId + '_widgets';
                            const isAllowed = isFieldChecked(dbKey, w.key);
                            return (
                              <label
                                key={w.key}
                                className={`flex items-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer select-none transition-all ${
                                  isAllowed ? 'bg-blue-600/15 border-blue-500/40 text-blue-400' : 'bg-slate-950/40 border-slate-850 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isAllowed}
                                  onChange={() => toggleFieldCheckbox(dbKey, w.key, defaultWidgetsKeys)}
                                  className="hidden"
                                />
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isAllowed ? 'bg-blue-600 border-blue-500' : 'border-slate-700'}`}>
                                  {isAllowed && <CheckCircle2 className="w-3 h-3 text-white" />}
                                </div>
                                <span className="truncate">{w.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Copy / Clone Permissions Dialog */}
      {showCloneModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleClonePermissions} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Copy className="w-5 h-5 text-amber-400" /> Copy & Clone Permissions
            </h3>
            <p className="text-xs text-slate-400">Copy complete permission mappings between staff roles or user accounts override profiles.</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source Scope Type</label>
                <select
                  value={cloneSourceType}
                  onChange={(e) => setCloneSourceType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="role">Role</option>
                  <option value="user">User Override</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source ID / Name</label>
                <input
                  type="text"
                  placeholder={cloneSourceType === 'role' ? "e.g., admin" : "User MongoDB ID"}
                  value={cloneSourceId}
                  onChange={(e) => setCloneSourceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Scope Type</label>
                <select
                  value={cloneTargetType}
                  onChange={(e) => setCloneTargetType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="role">Role</option>
                  <option value="user">User Override</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target ID / Name</label>
                <input
                  type="text"
                  placeholder={cloneTargetType === 'role' ? "e.g., operator" : "Target User MongoDB ID"}
                  value={cloneTargetId}
                  onChange={(e) => setCloneTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowCloneModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg"
              >
                {loading ? 'Copying...' : 'Clone Policy'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Duplicate Role Dialog */}
      {showDuplicateRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleDuplicateRole} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> Duplicate Existing Role
            </h3>
            <p className="text-xs text-slate-400">Clone all configuration permissions of an existing role into a brand new custom role.</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Source Base Role</label>
                <select
                  value={duplicateSourceRole}
                  onChange={(e) => setDuplicateSourceRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  {rolesList.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">New Custom Role Name</label>
                <input
                  type="text"
                  placeholder="e.g., CustomModerator"
                  value={duplicateNewRoleName}
                  onChange={(e) => setDuplicateNewRoleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Role Description</label>
                <textarea
                  placeholder="Explain purpose of this duplicated role..."
                  value={duplicateDescription}
                  onChange={(e) => setDuplicateDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowDuplicateRoleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg"
              >
                {loading ? 'Duplicating...' : 'Duplicate Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Custom Role Dialog */}
      {showCreateRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreateCustomRole} className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" /> Create Custom Role
              </h3>
              <button type="button" onClick={() => setShowCreateRoleModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">New Role Name</label>
                <input
                  type="text"
                  placeholder="e.g., custom_operator"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inherit From Base Role</label>
                <select
                  value={newRoleInherit}
                  onChange={(e) => setNewRoleInherit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                >
                  <option value="">None (Static blank role)</option>
                  {rolesList.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Role Description</label>
                <textarea
                  placeholder="e.g., Custom access scope for regional operators"
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateRoleModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-850 hover:bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
              >
                Create Custom Role
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Compare Roles Dialog */}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <GitCompare className="w-5 h-5 text-indigo-400" /> Detailed Permissions Comparison
              </h3>
              <button onClick={() => setShowCompareModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex gap-4 items-center bg-slate-950 p-3 rounded-2xl border border-slate-850">
              <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-500 block">ROLE A</span>
                <span className="text-xs font-black uppercase text-indigo-400">{selectedRole}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="flex-1">
                <span className="text-[10px] font-bold text-slate-500 block">ROLE B</span>
                <select
                  value={compareRoleB}
                  onChange={(e) => setCompareRoleB(e.target.value)}
                  className="bg-transparent border-0 font-black text-xs uppercase text-indigo-400 focus:outline-none"
                >
                  {rolesList.filter(r => r.id !== selectedRole).map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleCompare}
                className="bg-indigo-600 hover:bg-indigo-500 font-bold text-xs px-3.5 py-1.5 rounded-xl text-white shadow-md transition-colors"
              >
                Re-Compare
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="py-2">Permission Action</th>
                    <th className="py-2 text-center">{selectedRole}</th>
                    <th className="py-2 text-center">{compareRoleB}</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {compareDiff.map((item) => (
                    <tr key={item.action} className={`border-b border-slate-850 hover:bg-slate-850/20 ${item.isDifferent ? 'bg-amber-500/5' : ''}`}>
                      <td className="py-2.5 font-bold text-slate-200">{item.action}</td>
                      <td className="py-2.5 text-center">
                        {item[selectedRole] ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <UserX className="w-4 h-4 text-slate-600 mx-auto" />}
                      </td>
                      <td className="py-2.5 text-center">
                        {item[compareRoleB] ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <UserX className="w-4 h-4 text-slate-600 mx-auto" />}
                      </td>
                      <td className="py-2.5 text-right font-bold">
                        {item.isDifferent ? <span className="text-amber-400">Mismatch</span> : <span className="text-slate-500">Identical</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs Dialog */}
      {showAuditLogsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <History className="w-5 h-5 text-orange-400" /> Enterprise Permission Audit Trail Logs
              </h3>
              <button onClick={() => setShowAuditLogsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold">
                    <th className="py-2">Actor (Who Changed)</th>
                    <th className="py-2">Target Scope</th>
                    <th className="py-2">IP & Browser</th>
                    <th className="py-2">Reason</th>
                    <th className="py-2 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log: any) => (
                    <tr key={log._id} className="border-b border-slate-850 hover:bg-slate-850/20">
                      <td className="py-3">
                        <span className="font-bold text-indigo-400 block">{log.adminId?.name || 'System Operator'}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{log.adminId?.role || 'operator'}</span>
                      </td>
                      <td className="py-3 font-bold text-slate-200">
                        {log.target}
                      </td>
                      <td className="py-3 text-slate-400">
                        <span className="block font-mono text-[10px]">{log.ipAddress}</span>
                        <span className="block text-[9px] text-slate-500">{log.browser || 'Unknown'} - {log.device || 'Desktop'}</span>
                      </td>
                      <td className="py-3 text-slate-300 max-w-[200px] truncate" title={log.reason || log.details}>
                        {log.reason || log.details}
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono text-[10px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-500">
                        No audit trail logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
