'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Crown, Search, RefreshCw, Plus, Edit2, ShieldAlert,
  CheckCircle2, XCircle, Trash2, Copy, EyeOff, Bot, Sparkles
} from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface TestFakeUser {
  _id: string;
  name: string;
  phoneNumber?: string;
  gender?: string;
  bio?: string;
  image?: string;
  coins: number;
  diamonds: number;
  accountType: 'test' | 'fake' | 'regular';
  isBlocked: boolean;
  createdAt: string;
  lastActiveAt?: string;
}

export default function TestFakeIdManagementPage() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<TestFakeUser[]>([]);
  const [total, setTotal] = useState(0);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'test' | 'fake'>('all');
  const [page, setPage] = useState(1);

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'test' | 'fake'>('test');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('password123');
  const [formGender, setFormGender] = useState('male');
  const [formBio, setFormBio] = useState('');
  const [formCoins, setFormCoins] = useState('10000');
  const [formDiamonds, setFormDiamonds] = useState('1000');
  const [creating, setCreating] = useState(false);

  // Edit Modal
  const [editingUser, setEditingUser] = useState<TestFakeUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editGender, setEditGender] = useState('male');
  const [editCoins, setEditCoins] = useState('');
  const [editDiamonds, setEditDiamonds] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete/Archive Confirmation Modal
  const [targetDeleteUser, setTargetDeleteUser] = useState<TestFakeUser | null>(null);
  const [deleteMode, setDeleteMode] = useState<'archive' | 'delete'>('archive');
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('page', String(page));
      params.append('limit', '20');

      const res: any = await apiClient.get(`/api/admin/owner/test-fake-users?${params.toString()}`);
      if (res?.success && res.data) {
        setUsers(res.data.users || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to load test/fake IDs');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async () => {
    if (!formName.trim()) {
      toast.error('Name is required.');
      return;
    }
    try {
      setCreating(true);
      const res: any = await apiClient.post('/api/admin/owner/test-fake-users', {
        accountType: createType,
        name: formName.trim(),
        phoneNumber: formPhone.trim() || undefined,
        password: formPassword.trim() || 'password123',
        gender: formGender,
        bio: formBio.trim(),
        coins: Number(formCoins) || 0,
        diamonds: Number(formDiamonds) || 0,
      });

      if (res?.success) {
        toast.success(res.message || `${createType === 'test' ? 'Test' : 'Fake'} ID created successfully!`);
        setShowCreateModal(false);
        setFormName('');
        setFormPhone('');
        fetchUsers();
      } else {
        toast.error(res?.message || 'Failed to create ID');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error creating ID');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    try {
      setUpdating(true);
      const res: any = await apiClient.patch(`/api/admin/owner/test-fake-users/${editingUser._id}`, {
        name: editName.trim(),
        gender: editGender,
        bio: editBio.trim(),
        coins: Number(editCoins) || 0,
        diamonds: Number(editDiamonds) || 0,
        password: editPassword.trim() || undefined,
      });

      if (res?.success) {
        toast.success('Profile updated successfully!');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(res?.message || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleStatus = async (user: TestFakeUser) => {
    try {
      const res: any = await apiClient.patch(`/api/admin/owner/test-fake-users/${user._id}/status`, {});
      if (res?.success) {
        toast.success(res.message || 'Status updated successfully');
        fetchUsers();
      } else {
        toast.error(res?.message || 'Failed to toggle status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error toggling status');
    }
  };

  const handleDelete = async () => {
    if (!targetDeleteUser) return;
    try {
      setDeleting(true);
      const res: any = await apiClient.delete(`/api/admin/owner/test-fake-users/${targetDeleteUser._id}?mode=${deleteMode}`);
      if (res?.success) {
        toast.success(res.message || 'Account processed successfully');
        setTargetDeleteUser(null);
        fetchUsers();
      } else {
        toast.error(res?.message || 'Operation failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error processing deletion');
    } finally {
      setDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Internal ID copied to clipboard');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Test & Fake ID Management
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                  Owner Exclusive
                </Badge>
              </h1>
              <p className="text-sm text-neutral-400">
                Create and manage internal test and mock accounts. No public numeric User ID assigned. Never exposed in mobile app.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              setCreateType('test');
              setShowCreateModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
          >
            <Bot className="w-4 h-4" />
            Create Test ID
          </Button>
          <Button
            onClick={() => {
              setCreateType('fake');
              setShowCreateModal(true);
            }}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Create Fake ID
          </Button>
          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={loading}
            className="border-neutral-700 hover:bg-neutral-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Security Banner */}
      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-300 flex items-start gap-3">
        <EyeOff className="w-5 h-5 mt-0.5 text-amber-400 shrink-0" />
        <div>
          <span className="font-semibold text-amber-200">Strict Safety & Privacy Rules:</span> Test & Fake accounts do not possess a public numeric User ID. Their internal MongoDB identifier is only visible to the Platform Owner here and is never exposed in user discovery or app profile screens. Other users cannot follow these accounts.
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <Input
              placeholder="Search by Name, Phone, or Internal ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-neutral-950 border-neutral-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {(['all', 'test', 'fake'] as const).map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? 'default' : 'outline'}
                onClick={() => setTypeFilter(t)}
                size="sm"
                className={typeFilter === t ? 'bg-amber-600 hover:bg-amber-700' : 'border-neutral-800 hover:bg-neutral-800'}
              >
                {t === 'all' ? 'All Accounts' : t === 'test' ? 'Test IDs Only' : 'Fake IDs Only'}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader className="p-4 border-b border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-white">Created Test & Fake Accounts</CardTitle>
              <CardDescription className="text-xs text-neutral-400">Total accounts matching filter: {total}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-neutral-950/60">
              <TableRow className="border-neutral-800">
                <TableHead className="text-neutral-400 text-xs">Internal Database ID</TableHead>
                <TableHead className="text-neutral-400 text-xs">Account / Type</TableHead>
                <TableHead className="text-neutral-400 text-xs">Phone (Internal)</TableHead>
                <TableHead className="text-neutral-400 text-xs">Balances</TableHead>
                <TableHead className="text-neutral-400 text-xs">Status</TableHead>
                <TableHead className="text-neutral-400 text-xs">Created At</TableHead>
                <TableHead className="text-neutral-400 text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-neutral-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-neutral-400" />
                    Loading accounts...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-neutral-500">
                    No Test or Fake IDs found. Click "Create Test ID" or "Create Fake ID" above.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u._id} className="border-neutral-800 hover:bg-neutral-800/30">
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400 bg-neutral-950 px-2 py-1 rounded w-fit border border-neutral-800">
                        <span>{u._id}</span>
                        <button
                          onClick={() => copyToClipboard(u._id)}
                          className="text-neutral-500 hover:text-white"
                          title="Copy MongoDB _id"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-neutral-500 mt-0.5 block">Owner-only internal ID</span>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium text-white text-sm">{u.name}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant="outline"
                          className={
                            u.accountType === 'test'
                              ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-[10px]'
                              : 'border-purple-500/30 text-purple-400 bg-purple-500/10 text-[10px]'
                          }
                        >
                          {u.accountType === 'test' ? '🧪 Test ID' : '✨ Fake ID'}
                        </Badge>
                        <Badge variant="outline" className="border-neutral-700 text-neutral-400 text-[10px]">
                          No Public User ID
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-neutral-300 font-mono">
                      {u.phoneNumber || '—'}
                    </TableCell>

                    <TableCell>
                      <div className="text-xs text-amber-400 font-medium">💰 {(u.diamonds || 0).toLocaleString()} Coins</div>
                      <div className="text-xs text-emerald-400">🫘 {(u.coins || 0).toLocaleString()} Beans</div>
                    </TableCell>

                    <TableCell>
                      {u.isBlocked ? (
                        <Badge variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 text-xs">
                          Deactivated
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs">
                          Active
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingUser(u);
                            setEditName(u.name);
                            setEditBio(u.bio || '');
                            setEditGender(u.gender || 'male');
                            setEditCoins(String(u.coins || 0));
                            setEditDiamonds(String(u.diamonds || 0));
                            setEditPassword('');
                          }}
                          className="h-8 border-neutral-700 hover:bg-neutral-800 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(u)}
                          className={`h-8 text-xs ${
                            u.isBlocked
                              ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                              : 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                          }`}
                        >
                          {u.isBlocked ? 'Activate' : 'Deactivate'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setTargetDeleteUser(u);
                            setDeleteMode('archive');
                          }}
                          className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-lg shadow-2xl">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                Create {createType === 'test' ? 'Test ID' : 'Fake ID'}
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                This account will be registered strictly without a public numeric User ID. Internal MongoDB _id will be preserved for administration.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">Display Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. VIP Testing Agent"
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Phone (Optional)</label>
                  <Input
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+919876543210 (Auto if blank)"
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Password</label>
                  <Input
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="password123"
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Coins (Diamonds)</label>
                  <Input
                    type="number"
                    value={formDiamonds}
                    onChange={(e) => setFormDiamonds(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Beans (Earnings)</label>
                  <Input
                    type="number"
                    value={formCoins}
                    onChange={(e) => setFormCoins(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">Bio (Optional)</label>
                <Input
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Internal testing account"
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="border-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating}
                  className={createType === 'test' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'}
                >
                  {creating ? 'Creating...' : `Confirm Create ${createType === 'test' ? 'Test ID' : 'Fake ID'}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-lg shadow-2xl">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-amber-400" />
                Edit Profile: {editingUser.name}
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Modify permitted profile details for this {editingUser.accountType} account.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">Display Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-md p-2 text-sm text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Reset Password (Optional)</label>
                  <Input
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Coins Balance</label>
                  <Input
                    type="number"
                    value={editDiamonds}
                    onChange={(e) => setEditDiamonds(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 font-medium block mb-1">Beans Balance</label>
                  <Input
                    type="number"
                    value={editCoins}
                    onChange={(e) => setEditCoins(e.target.value)}
                    className="bg-neutral-950 border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 font-medium block mb-1">Bio</label>
                <Input
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="bg-neutral-950 border-neutral-800 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  disabled={updating}
                  className="border-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {updating ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* DELETE / ARCHIVE CONFIRMATION MODAL */}
      {targetDeleteUser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <Card className="bg-neutral-900 border-neutral-800 w-full max-w-md shadow-2xl">
            <CardHeader className="border-b border-neutral-800">
              <CardTitle className="text-base text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                Confirm Account Removal
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Target: {targetDeleteUser.name} ({targetDeleteUser.accountType} account)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-neutral-400 block font-medium">Select Action Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeleteMode('archive')}
                    className={`p-3 rounded-lg border text-left text-xs ${
                      deleteMode === 'archive'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="font-semibold mb-1">Archive Account</div>
                    <div className="text-[11px] opacity-80">Soft-delete and retain audit history safely.</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteMode('delete')}
                    className={`p-3 rounded-lg border text-left text-xs ${
                      deleteMode === 'delete'
                        ? 'border-red-500 bg-red-500/10 text-red-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    <div className="font-semibold mb-1">Permanent Delete</div>
                    <div className="text-[11px] opacity-80">Purges document from collection entirely.</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
                <Button
                  variant="outline"
                  onClick={() => setTargetDeleteUser(null)}
                  disabled={deleting}
                  className="border-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? 'Processing...' : `Confirm ${deleteMode === 'delete' ? 'Delete' : 'Archive'}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
