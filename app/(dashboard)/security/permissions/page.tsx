'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield, Users, Layers, Layout, Key, Eye, EyeOff, Save, FolderOpen, UserCheck } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'sonner';

const roles = ['owner', 'operator', 'superAdmin', 'admin', 'agency', 'coinSeller', 'customerSupport', 'host'];

const menuOptions = ['Dashboard', 'Users', 'Host', 'Agency', 'Coin Seller', 'Finance', 'Reports', 'Notifications', 'Recruitment', 'Settings', 'Developer'];

const widgetOptions = ["Today's Minutes", "Coins Spent Today", "Host Earnings Today", "Today's Revenue", "Total Users", "Total Hosts", "Active Hosts", "Recruitment Applications", "Reports Pending"];

const buttonOptions = [
  'View', 'Create', 'Update', 'Delete', 'Approve', 'Reject', 'Export',
  'Add', 'Edit', 'Suspend', 'Activate', 
  'Password Reset', 'Login As User', 'Import', 'Recharge', 
  'Deduct Coin', 'Add Diamond', 'Remove Diamond', 'Transfer'
];

const fieldOptions = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phoneNumber', label: 'Phone Number' },
  { key: 'coins', label: 'Coins Balance' },
  { key: 'diamonds', label: 'Diamonds Balance' },
  { key: 'wallet', label: 'Wallet/Earnings' },
  { key: 'bank', label: 'Bank Details' },
  { key: 'upi', label: 'UPI ID' },
  { key: 'panNumber', label: 'PAN Details' },
  { key: 'aadharNumber', label: 'Aadhaar Details' },
  { key: 'device', label: 'Device & IP Information' },
  { key: 'lastOnline', label: 'Last Login/Online Status' }
];

export default function PermissionBuilder() {
  const [targetType, setTargetType] = useState<'role' | 'user'>('role');
  const [selectedRole, setSelectedRole] = useState('admin');
  const [searchUserId, setSearchUserId] = useState('');
  const [userId, setUserId] = useState('');
  
  const [menus, setMenus] = useState<string[]>([]);
  const [widgets, setWidgets] = useState<string[]>([]);
  const [buttons, setButtons] = useState<string[]>([]);
  const [fields, setFields] = useState<Record<string, boolean>>({});
  
  const [templates, setTemplates] = useState<any[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize fields mapping with default true (visible)
  useEffect(() => {
    const initialFields: Record<string, boolean> = {};
    fieldOptions.forEach(opt => {
      initialFields[opt.key] = true;
    });
    setFields(initialFields);
  }, []);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const id = targetType === 'role' ? selectedRole : userId;
      if (!id) {
        toast.error('Please specify a target role or search a user.');
        setLoading(false);
        return;
      }

      const res = await apiClient.get(`/api/ems/permissions?targetType=${targetType}&targetId=${id}`);
      if (res.success && res.data) {
        setMenus(res.data.menus || []);
        setWidgets(res.data.dashboardWidgets || []);
        setButtons(res.data.buttons || []);
        
        // Convert map response to record
        const resFields = res.data.fields || {};
        const mergedFields = { ...fields };
        fieldOptions.forEach(opt => {
          mergedFields[opt.key] = resFields[opt.key] !== undefined ? resFields[opt.key] : true;
        });
        setFields(mergedFields);
        toast.success('Permissions loaded successfully');
      }
    } catch (error) {
      toast.error('Error loading permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchUserId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/api/user/${searchUserId}`);
      if (res.success && res.data) {
        setUserId(res.data._id);
        toast.success(`Found User: ${res.data.name}`);
      } else {
        toast.error('User not found.');
      }
    } catch (err) {
      toast.error('Error searching user.');
    } finally {
      setLoading(false);
    }
  };

  const savePermissions = async () => {
    const id = targetType === 'role' ? selectedRole : userId;
    if (!id) {
      toast.error('No valid target selected to save.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/api/ems/permissions', {
        targetType,
        targetId: id,
        permissions: {
          menus,
          dashboardWidgets: widgets,
          buttons,
          fields
        }
      });

      if (res.success) {
        toast.success('Permissions saved successfully');
      } else {
        toast.error('Failed to save permissions');
      }
    } catch (error) {
      toast.error('Error saving permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newTemplateName) {
      toast.error('Please enter a template name.');
      return;
    }
    try {
      setLoading(true);
      const res = await apiClient.post('/api/ems/templates', {
        templateName: newTemplateName,
        permissions: {
          menus,
          dashboardWidgets: widgets,
          buttons,
          fields
        }
      });
      if (res.success) {
        toast.success('Template saved successfully');
        loadTemplates();
        setNewTemplateName('');
      }
    } catch (err) {
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await apiClient.get('/api/ems/templates');
      if (res.success && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const applyTemplate = (tpl: any) => {
    setMenus(tpl.menus || []);
    setWidgets(tpl.dashboardWidgets || []);
    setButtons(tpl.buttons || []);
    const tplFields = tpl.fields || {};
    const mergedFields = { ...fields };
    fieldOptions.forEach(opt => {
      mergedFields[opt.key] = tplFields[opt.key] !== undefined ? tplFields[opt.key] : true;
    });
    setFields(mergedFields);
    toast.success(`Applied template: ${tpl.templateName}`);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Reload permissions whenever selected role or target user changes
  useEffect(() => {
    if (targetType === 'role') {
      loadPermissions();
    }
  }, [selectedRole, targetType]);

  useEffect(() => {
    if (targetType === 'user' && userId) {
      loadPermissions();
    }
  }, [userId]);

  const toggleArrayItem = (item: string, arr: string[], setArr: (a: string[]) => void) => {
    if (arr.includes(item)) {
      setArr(arr.filter(x => x !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const toggleField = (key: string) => {
    setFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Dynamic Permission Builder
          </h2>
          <p className="text-muted-foreground mt-1">Configure role default policies and user permission overrides</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Control Panel */}
        <Card className="glass-card md:col-span-1 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Target Selection
            </CardTitle>
            <CardDescription>Select target role or user to configure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Target Type Selector */}
            <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setTargetType('role')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  targetType === 'role' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Role Default
              </button>
              <button
                onClick={() => setTargetType('user')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  targetType === 'user' ? 'bg-primary text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Individual User
              </button>
            </div>

            {/* Target Settings */}
            {targetType === 'role' ? (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-primary"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Search User UID/ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter UID or MongoDB ID"
                      value={searchUserId}
                      onChange={(e) => setSearchUserId(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={handleSearchUser}
                      className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-lg text-slate-200 transition-colors"
                    >
                      Find
                    </button>
                  </div>
                </div>
                {userId && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary shrink-0" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-200">Active User Override Target:</p>
                      <p className="text-slate-400 truncate">{userId}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={savePermissions}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-lg"
              >
                <Save className="h-4 w-4" /> Save Permissions
              </button>
            </div>

            {/* Template Manager */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
                  <FolderOpen className="h-3.5 w-3.5 text-primary" /> Save as Template
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Template Name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={handleSaveTemplate}
                    className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              {templates.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Load Template</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {templates.map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => applyTemplate(tpl)}
                        className="w-full text-left bg-slate-800/40 hover:bg-slate-800 p-2 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between transition-colors"
                      >
                        <span className="font-semibold">{tpl.templateName}</span>
                        <span className="text-[10px] text-slate-500">Apply</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Configuration Panel */}
        <Card className="glass-card md:col-span-2 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Permissions Matrix
            </CardTitle>
            <CardDescription>Grant or deny specific nodes dynamically</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Sidebar Menus Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <Layout className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-sm font-bold text-slate-200">Sidebar Menus</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {menuOptions.map(menu => {
                  const isChecked = menus.includes(menu);
                  return (
                    <label
                      key={menu}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-inner' 
                          : 'bg-slate-800/20 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem(menu, menus, setMenus)}
                        className="hidden"
                      />
                      <div className={`h-3 w-3 rounded-sm border flex items-center justify-center ${isChecked ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                        {isChecked && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                      </div>
                      {menu}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Widgets Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <Layout className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-sm font-bold text-slate-200">Dashboard Widgets</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {widgetOptions.map(widget => {
                  const isChecked = widgets.includes(widget);
                  return (
                    <label
                      key={widget}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-inner' 
                          : 'bg-slate-800/20 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem(widget, widgets, setWidgets)}
                        className="hidden"
                      />
                      <div className={`h-3 w-3 rounded-sm border flex items-center justify-center ${isChecked ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                        {isChecked && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                      </div>
                      {widget}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Button Permissions Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <Key className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-sm font-bold text-slate-200">Button Actions</h4>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {buttonOptions.map(btn => {
                  const isChecked = buttons.includes(btn);
                  return (
                    <label
                      key={btn}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                        isChecked 
                          ? 'bg-primary/10 border-primary/40 text-primary font-bold shadow-inner' 
                          : 'bg-slate-800/20 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleArrayItem(btn, buttons, setButtons)}
                        className="hidden"
                      />
                      <div className={`h-3 w-3 rounded-sm border flex items-center justify-center ${isChecked ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                        {isChecked && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                      </div>
                      {btn}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Field Visibility Section (Field-Level Security) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5">
                <Eye className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-sm font-bold text-slate-200">Field-Level Data Visibility</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fieldOptions.map(opt => {
                  const isVisible = fields[opt.key] !== false; // Default to true
                  return (
                    <div
                      key={opt.key}
                      onClick={() => toggleField(opt.key)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer select-none transition-all ${
                        isVisible 
                          ? 'bg-slate-800/20 border-slate-800 text-slate-300' 
                          : 'bg-destructive/5 border-destructive/20 text-destructive'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isVisible ? (
                          <Eye className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-rose-500 shrink-0" />
                        )}
                        <span className="text-xs font-semibold">{opt.label}</span>
                      </div>
                      <div className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {isVisible ? 'Visible' : 'Masked'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
