'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusCircle, ShieldAlert, UserCheck, Users, Link as LinkIcon, CheckCircle, Video, Copy } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';

const ROLE_DETAILS: Record<string, { label: string, icon: any, desc: string, color: string }> = {
    operator: { label: 'Operator', icon: ShieldAlert, desc: 'Highest level staff, manages super admins', color: 'bg-violet-500' },
    superAdmin: { label: 'Super Admin', icon: ShieldAlert, desc: 'Manages admins and agencies', color: 'bg-blue-500' },
    admin: { label: 'Admin', icon: UserCheck, desc: 'Manages agencies and diamond sellers', color: 'bg-emerald-500' },
    agency: { label: 'Agency', icon: Users, desc: 'Manages and recruits hosts', color: 'bg-amber-500' },
    coinSeller: { label: 'Diamond Seller', icon: UserCheck, desc: 'Sells diamonds to users', color: 'bg-pink-500' },
    host: { label: 'Host', icon: Video, desc: 'Live streamer', color: 'bg-rose-500' }
};

const HIERARCHY: Record<string, string[]> = {
    owner:      ['operator', 'superAdmin', 'admin', 'agency', 'coinSeller', 'host'],
    operator:   ['superAdmin', 'admin', 'agency', 'coinSeller', 'host'],
    superAdmin: ['admin', 'agency', 'coinSeller', 'host'],
    admin:      ['agency', 'coinSeller', 'host'],
    agency:     ['host'],
};

export default function AddNewEntityPage() {
    const { user } = useAuth();
    const myRole = user?.role || 'user';
    const myCode = user?.employeeCode || '';
    const allowedRoles = HIERARCHY[myRole] || [];

    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [docUrl, setDocUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const getRolePath = (role: string | null) => {
        if (role === 'agency') return '/apply/agency';
        if (role === 'operator') return '/apply/operator';
        if (role === 'superAdmin') return '/apply/super-admin';
        if (role === 'admin') return '/apply/admin';
        if (role === 'host') return '/apply/host';
        return '/apply';
    };

    const publicApplyUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}${getRolePath(selectedRole)}?referrer=${myCode}`
        : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicApplyUrl);
        setCopied(true);
        toast.success("Referral link copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCreateManually = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRole || !name || !email || !password || !docUrl) {
            return toast.error("Please fill all required fields, including at least one document URL.");
        }
        
        setLoading(true);
        try {
            const payload = {
                name,
                email,
                password,
                phoneNumber: phone || undefined,
                targetRole: selectedRole,
                documents: [docUrl]
            };
            
            const res = await apiClient.post(API_ENDPOINTS.ADMIN.CREATE_EMPLOYEE, payload);
            if (res.success) {
                toast.success(`${ROLE_DETAILS[selectedRole].label} created successfully!`);
                setName('');
                setEmail('');
                setPassword('');
                setPhone('');
                setDocUrl('');
                setSelectedRole(null);
            } else {
                toast.error(res.message || "Failed to create entity");
            }
        } catch (err: any) {
            toast.error(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (allowedRoles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldAlert size={64} className="text-slate-700 mb-4" />
                <h2 className="text-2xl font-bold text-slate-300">No Permissions</h2>
                <p className="text-slate-500">You do not have permission to add new staff members.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Hierarchy Addition</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Share your referral link or directly create new subordinates under your hierarchy</p>
            </div>

            {/* Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allowedRoles.map(role => {
                    const RoleIcon = ROLE_DETAILS[role].icon;
                    return (
                        <Card 
                            key={role}
                            className={`glass-card cursor-pointer transition-all hover:scale-[1.02] ${selectedRole === role ? 'border-primary ring-1 ring-primary/50' : 'border-slate-800'}`}
                            onClick={() => setSelectedRole(role)}
                        >
                            <CardContent className="p-6 flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ROLE_DETAILS[role].color}/20 text-slate-200`}>
                                    <RoleIcon size={24} className={ROLE_DETAILS[role].color.replace('bg-', 'text-')} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-200">{ROLE_DETAILS[role].label}</h3>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{ROLE_DETAILS[role].desc}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {selectedRole && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    {/* Share Link Column */}
                    <Card className="glass-card border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <LinkIcon size={20} />
                                Share Application Link
                            </CardTitle>
                            <CardDescription>Send this link to the person. When they apply, they will automatically be placed under you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Referral Link</p>
                                <div className="flex gap-2">
                                    <Input value={publicApplyUrl} readOnly className="font-mono text-xs bg-slate-950 border-slate-700" />
                                    <Button onClick={copyToClipboard} variant="default" className="px-3">
                                        {copied ? <CheckCircle size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </Button>
                                </div>
                            </div>
                            <div className="text-sm text-slate-400 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                <p><strong>How it works:</strong></p>
                                <ul className="list-disc pl-4 mt-2 space-y-1">
                                    <li>Applicant fills out the public form</li>
                                    <li>Their request appears in your pending list</li>
                                    <li>You or the owner can approve them</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Manual Create Column */}
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-200">
                                <PlusCircle size={20} className="text-primary" />
                                Create {ROLE_DETAILS[selectedRole].label} Manually
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleCreateManually} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Full Name *</label>
                                    <Input
                                        placeholder={`Enter ${ROLE_DETAILS[selectedRole].label} name`}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Email Address *</label>
                                    <Input
                                        type="email"
                                        placeholder="e.g. testing@mithichat.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Password *</label>
                                    <Input
                                        type="password"
                                        placeholder="Secure password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Phone Number</label>
                                    <Input
                                        placeholder="e.g. +91 99999 99999"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300">Document URL *</label>
                                    <Input
                                        placeholder="Link to ID proof / Agreement"
                                        value={docUrl}
                                        onChange={(e) => setDocUrl(e.target.value)}
                                        required
                                    />
                                    <p className="text-[10px] text-slate-500">Required for verification purposes.</p>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full mt-4">
                                    {loading ? 'Creating...' : `Create ${ROLE_DETAILS[selectedRole].label}`}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
