'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/Dialog";
import { Shield, UserPlus, Lock, Unlock, Search, RefreshCw, Eye, EyeOff, Copy, CheckCircle, AlertTriangle, Users, Key } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

const ROLE_HIERARCHY = ['operator', 'superAdmin', 'admin', 'agency', 'coinSeller'];
const ROLE_LABELS: Record<string, string> = {
    operator: 'Operator',
    superAdmin: 'Super Admin',
    admin: 'Admin',
    agency: 'Agency',
    coinSeller: 'Diamond Seller',
};
const ROLE_COLORS: Record<string, string> = {
    operator: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    superAdmin: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    admin: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    agency: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    coinSeller: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('');
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [copiedCode, setCopiedCode] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        targetRole: 'admin',
        documents: [''],
    });

    useEffect(() => {
        fetchEmployees();
    }, [filterRole]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const url = filterRole
                ? `${API_ENDPOINTS.ADMIN.LIST_EMPLOYEES}?targetRole=${filterRole}`
                : API_ENDPOINTS.ADMIN.LIST_EMPLOYEES;
            const response = await apiClient.get(url);
            if (response.success && response.data) {
                setEmployees(response.data as any[]);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const docs = formData.documents.filter(d => d.trim() !== '');
        if (!formData.name || !formData.email || !formData.password || !formData.targetRole) {
            toast.error('Please fill all required fields');
            return;
        }
        if (docs.length === 0) {
            toast.error('At least one document URL is required');
            return;
        }
        try {
            setSubmitting(true);
            const payload = { ...formData, documents: docs };
            const response = await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_EMPLOYEE, payload);
            if (response.success) {
                toast.success(`${ROLE_LABELS[formData.targetRole]} created successfully!`);
                setCreateOpen(false);
                resetForm();
                fetchEmployees();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to create employee');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', phoneNumber: '', targetRole: 'admin', documents: [''] });
        setShowPassword(false);
    };

    const handleToggleBlock = async (id: string, isBlocked: boolean) => {
        try {
            await apiClient.patch(API_ENDPOINTS.ADMIN.BLOCK_EMPLOYEE(id), {});
            toast.success(`Employee ${isBlocked ? 'unblocked' : 'blocked'} successfully`);
            fetchEmployees();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update employee');
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        toast.success('Employee code copied!');
        setTimeout(() => setCopiedCode(''), 2000);
    };

    const addDocumentField = () => {
        setFormData(prev => ({ ...prev, documents: [...prev.documents, ''] }));
    };

    const updateDocument = (index: number, value: string) => {
        const docs = [...formData.documents];
        docs[index] = value;
        setFormData(prev => ({ ...prev, documents: docs }));
    };

    const removeDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents.filter((_, i) => i !== index)
        }));
    };

    const filtered = employees.filter(e =>
        !search ||
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.email?.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeCode?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <Users size={24} className="text-primary" />
                        Employee Management
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage your team hierarchy — Operator → Super Admin → Admin → Agency → Diamond Seller
                    </p>
                </div>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white font-bold"
                >
                    <UserPlus size={16} />
                    Add Employee
                </Button>
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterRole('')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${filterRole === '' ? 'bg-primary text-white border-primary' : 'text-slate-400 border-slate-700 hover:border-primary hover:text-primary'}`}
                >
                    All Roles
                </button>
                {ROLE_HIERARCHY.map(role => (
                    <button
                        key={role}
                        onClick={() => setFilterRole(role)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${filterRole === role ? 'bg-primary text-white border-primary' : 'text-slate-400 border-slate-700 hover:border-primary hover:text-primary'}`}
                    >
                        {ROLE_LABELS[role]}
                    </button>
                ))}
            </div>

            {/* Search + Refresh */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, or code..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 bg-slate-900 border-slate-700 text-slate-200 placeholder-slate-500"
                    />
                </div>
                <Button variant="outline" size="sm" onClick={fetchEmployees} className="border-slate-700 text-slate-400">
                    <RefreshCw size={14} />
                </Button>
            </div>

            {/* Employees Table */}
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="text-slate-200 text-base flex items-center gap-2">
                        <Shield size={16} className="text-primary" />
                        {loading ? 'Loading...' : `${filtered.length} Employee(s)`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            Loading employees...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-semibold">
                            No employees found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-slate-300 font-bold">Name</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Role</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Employee Code</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Email</TableHead>
                                    <TableHead className="text-slate-300 font-bold">Status</TableHead>
                                    <TableHead className="text-right text-slate-300 font-bold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map(emp => (
                                    <TableRow key={emp._id} className="hover:bg-muted/30">
                                        <TableCell className="font-semibold text-slate-200">{emp.name}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${ROLE_COLORS[emp.role] || 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                                {ROLE_LABELS[emp.role] || emp.role}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {emp.employeeCode ? (
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-primary">{emp.employeeCode}</code>
                                                    <button onClick={() => copyCode(emp.employeeCode)}>
                                                        {copiedCode === emp.employeeCode
                                                            ? <CheckCircle size={12} className="text-emerald-400" />
                                                            : <Copy size={12} className="text-slate-400 hover:text-primary" />}
                                                    </button>
                                                </div>
                                            ) : <span className="text-slate-600 text-xs">—</span>}
                                        </TableCell>
                                        <TableCell className="text-xs text-slate-400">{emp.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={emp.isBlocked ? 'destructive' : 'success'} className="text-xs font-semibold">
                                                {emp.isBlocked ? 'Blocked' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <div className="flex justify-end items-center gap-1.5">
                                                 <Link href={`/security/permissions?targetType=user&targetId=${emp._id}&name=${encodeURIComponent(emp.name)}`}>
                                                     <Button 
                                                         size="sm" 
                                                         variant="outline"
                                                         className="h-7 px-2 text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10 gap-1"
                                                     >
                                                         <Key className="h-3 w-3" /> Perms
                                                     </Button>
                                                 </Link>
                                                 <Button
                                                     size="sm"
                                                     variant="outline"
                                                     onClick={() => handleToggleBlock(emp._id, emp.isBlocked)}
                                                     className={`text-xs font-bold ${emp.isBlocked ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10' : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'}`}
                                                 >
                                                     {emp.isBlocked ? <><Unlock size={11} className="mr-1" />Unblock</> : <><Lock size={11} className="mr-1" />Block</>}
                                                 </Button>
                                             </div>
                                         </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Employee Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="bg-slate-900 border border-slate-800 text-slate-200 max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-slate-100">
                            <UserPlus size={18} className="text-primary" />
                            Add New Employee
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 text-xs">
                            Create a team member with a unique employee code. They will automatically receive a referral link.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-2">
                        {/* Role selection */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400 font-semibold">Role *</Label>
                            <div className="flex flex-wrap gap-2">
                                {ROLE_HIERARCHY.map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setFormData(prev => ({ ...prev, targetRole: role }))}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${formData.targetRole === role ? 'bg-primary text-white border-primary' : 'text-slate-400 border-slate-700 hover:border-primary'}`}
                                    >
                                        {ROLE_LABELS[role]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400 font-semibold">Full Name *</Label>
                                <Input
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Employee name"
                                    className="bg-slate-950 border-slate-700 text-slate-200 text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-400 font-semibold">Phone (optional)</Label>
                                <Input
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    placeholder="+91..."
                                    className="bg-slate-950 border-slate-700 text-slate-200 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400 font-semibold">Email *</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="employee@example.com"
                                className="bg-slate-950 border-slate-700 text-slate-200 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs text-slate-400 font-semibold">Password *</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    placeholder="Strong password..."
                                    className="bg-slate-950 border-slate-700 text-slate-200 text-sm pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                                    <AlertTriangle size={11} className="text-amber-400" />
                                    Documents (Upload URLs) *
                                </Label>
                                <button
                                    type="button"
                                    onClick={addDocumentField}
                                    className="text-xs text-primary hover:underline"
                                >
                                    + Add more
                                </button>
                            </div>
                            {formData.documents.map((doc, idx) => (
                                <div key={idx} className="flex gap-2">
                                    <Input
                                        value={doc}
                                        onChange={e => updateDocument(idx, e.target.value)}
                                        placeholder={`Document URL #${idx + 1}`}
                                        className="bg-slate-950 border-slate-700 text-slate-200 text-xs"
                                    />
                                    {formData.documents.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeDocument(idx)}
                                            className="text-rose-400 hover:text-rose-300 text-xs"
                                        >✕</button>
                                    )}
                                </div>
                            ))}
                            <p className="text-xs text-slate-500">Upload documents to Cloudinary/S3 first, then paste the URL here.</p>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => { setCreateOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreate} disabled={submitting} className="bg-primary text-white font-bold">
                            {submitting ? 'Creating...' : `Create ${ROLE_LABELS[formData.targetRole] || 'Employee'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
