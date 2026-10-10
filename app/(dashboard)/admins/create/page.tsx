'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from 'sonner';
import { ShieldCheck, User, Phone, Mail, MapPin, Briefcase, Network, Plus, RefreshCw, Copy, Check } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateAdminPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [invitationToken, setInvitationToken] = useState(() => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const [copied, setCopied] = useState(false);

    // Form state
    const [form, setForm] = useState({
        // Personal
        profilePhoto: '',
        name: '',
        age: '',
        nickName: '',
        gender: 'female',
        dob: '',
        maritalStatus: 'single',

        // Contact
        email: '',
        phoneNumber: '',
        alternateMobile: '',

        // Address
        country: 'India',
        state: '',
        district: '',
        city: '',
        pincode: '',
        fullAddress: '',

        // Professional
        qualification: '',
        experience: '',
        previousCompany: '',
        skills: '',

        // Organization
        parentOwner: '',
        parentOperator: '',
        parentSuperAdmin: '',
        referralCode: '',
        invitedBy: '',
        joiningDate: new Date().toISOString().split('T')[0],
    });

    const handleChange = (key: string, value: string) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleGenerateToken = () => {
        setInvitationToken(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
        toast.success("New Invitation Token generated");
    };

    const invitationLink = typeof window !== 'undefined'
        ? `${window.location.origin}/register?token=${invitationToken}`
        : `https://admin.yaroapp.in/register?token=${invitationToken}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(invitationLink);
        setCopied(true);
        toast.success("Invitation Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phoneNumber) {
            toast.error("Full Name, Email and Mobile Number are required");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                requestType: "Admin Request",
                data: {
                    ...form,
                    invitationToken,
                    invitedBy: form.invitedBy || currentUser?.name || 'System',
                    createdBy: currentUser?.id || 'self',
                    expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days expiry
                    invitationStatus: 'active'
                }
            };

            const response = await apiClient.post('/api/ems/requests', payload);

            if (response.success) {
                toast.success("✅ Admin request submitted as PENDING! Redirecting to Request Page...");
                router.push('/admins/request');
                // Reset form
                setForm({
                    profilePhoto: '',
                    name: '',
                    age: '',
                    nickName: '',
                    gender: 'female',
                    dob: '',
                    maritalStatus: 'single',
                    email: '',
                    phoneNumber: '',
                    alternateMobile: '',
                    country: 'India',
                    state: '',
                    district: '',
                    city: '',
                    pincode: '',
                    fullAddress: '',
                    qualification: '',
                    experience: '',
                    previousCompany: '',
                    skills: '',
                    parentOwner: '',
                    parentOperator: '',
                    parentSuperAdmin: '',
                    referralCode: '',
                    invitedBy: '',
                    joiningDate: new Date().toISOString().split('T')[0],
                });
                setInvitationToken(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
            } else {
                toast.error(response.message || "Failed to submit request");
            }
        } catch (error: any) {
            toast.error(error?.message || "Failed to submit request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                        Create Admin Request
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Fill in professional & organizational details to submit an Admin registration request for approval.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ─── Invitation generation card ─── */}
                <Card className="glass-card border-violet-500/20">
                    <CardHeader>
                        <CardTitle className="text-base text-violet-300 flex items-center gap-2">
                            <Network className="h-4 w-4" /> Invitation Link Generator
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                            Automatically generates a secure invitation token for this candidate.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-end">
                            <div className="flex-1">
                                <Label className="text-xs text-slate-400 mb-1.5 block">Generated Link</Label>
                                <Input
                                    value={invitationLink}
                                    readOnly
                                    className="bg-slate-900 border-slate-700/50 text-slate-300 text-sm h-10 select-all"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className="h-10 border-slate-700 hover:bg-slate-800 text-slate-200 gap-1.5"
                                >
                                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    {copied ? "Copied" : "Copy Link"}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleGenerateToken}
                                    variant="outline"
                                    className="h-10 border-slate-700 hover:bg-slate-800 text-slate-200"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Personal Information ─── */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                            <User className="h-4 w-4 text-pink-400" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Profile Photo URL</Label>
                            <Input
                                placeholder="https://example.com/photo.jpg"
                                value={form.profilePhoto}
                                onChange={e => handleChange('profilePhoto', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Full Name *</Label>
                            <Input
                                placeholder="e.g. John Doe"
                                value={form.name}
                                onChange={e => handleChange('name', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Age</Label>
                            <Input
                                type="number"
                                placeholder="e.g. 28"
                                value={form.age}
                                onChange={e => handleChange('age', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Nick Name</Label>
                            <Input
                                placeholder="e.g. Johny"
                                value={form.nickName}
                                onChange={e => handleChange('nickName', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Gender</Label>
                            <select
                                className="w-full h-10 px-3 bg-slate-900 border border-slate-700/50 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                                value={form.gender}
                                onChange={e => handleChange('gender', e.target.value)}
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Date of Birth</Label>
                            <Input
                                type="date"
                                value={form.dob}
                                onChange={e => handleChange('dob', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Marital Status</Label>
                            <select
                                className="w-full h-10 px-3 bg-slate-900 border border-slate-700/50 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                                value={form.maritalStatus}
                                onChange={e => handleChange('maritalStatus', e.target.value)}
                            >
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Contact Information ─── */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-emerald-400" /> Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Email Address *</Label>
                            <Input
                                type="email"
                                placeholder="e.g. john@email.com"
                                value={form.email}
                                onChange={e => handleChange('email', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Mobile Number *</Label>
                            <Input
                                placeholder="e.g. +919876543210"
                                value={form.phoneNumber}
                                onChange={e => handleChange('phoneNumber', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Alternate Mobile</Label>
                            <Input
                                placeholder="Alternate contact number"
                                value={form.alternateMobile}
                                onChange={e => handleChange('alternateMobile', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Address ─── */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-400" /> Address Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Country</Label>
                            <Input
                                placeholder="Country"
                                value={form.country}
                                onChange={e => handleChange('country', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">State</Label>
                            <Input
                                placeholder="State"
                                value={form.state}
                                onChange={e => handleChange('state', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">District</Label>
                            <Input
                                placeholder="District"
                                value={form.district}
                                onChange={e => handleChange('district', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">City / Town</Label>
                            <Input
                                placeholder="City"
                                value={form.city}
                                onChange={e => handleChange('city', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Pincode</Label>
                            <Input
                                placeholder="Pincode"
                                value={form.pincode}
                                onChange={e => handleChange('pincode', e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-3">
                            <Label className="text-xs text-slate-400 block mb-1">Full Address</Label>
                            <Input
                                placeholder="Street, block and house info..."
                                value={form.fullAddress}
                                onChange={e => handleChange('fullAddress', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Professional Information ─── */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-amber-400" /> Professional Experience
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Qualification</Label>
                            <Input
                                placeholder="Highest degree/qualification"
                                value={form.qualification}
                                onChange={e => handleChange('qualification', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Experience (in Years)</Label>
                            <Input
                                type="number"
                                placeholder="Years of experience"
                                value={form.experience}
                                onChange={e => handleChange('experience', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Previous Company</Label>
                            <Input
                                placeholder="Name of previous employer"
                                value={form.previousCompany}
                                onChange={e => handleChange('previousCompany', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Skills</Label>
                            <Input
                                placeholder="Key professional skills"
                                value={form.skills}
                                onChange={e => handleChange('skills', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* ─── Organization Hierarchy ─── */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="text-base text-slate-200 flex items-center gap-2">
                            <Network className="h-4 w-4 text-violet-400" /> Organizational Hierarchy
                        </CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                            Select upper hierarchy relationships. Parent Admin can only belong under Owner, Operator, or Super Admin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Parent Owner (Optional)</Label>
                            <Input
                                placeholder="Owner MongoDB ID"
                                value={form.parentOwner}
                                onChange={e => handleChange('parentOwner', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Parent Operator ID</Label>
                            <Input
                                placeholder="Operator MongoDB ID"
                                value={form.parentOperator}
                                onChange={e => handleChange('parentOperator', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Parent Super Admin ID</Label>
                            <Input
                                placeholder="Super Admin MongoDB ID"
                                value={form.parentSuperAdmin}
                                onChange={e => handleChange('parentSuperAdmin', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Referral Code</Label>
                            <Input
                                placeholder="Referral Code"
                                value={form.referralCode}
                                onChange={e => handleChange('referralCode', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Invited By</Label>
                            <Input
                                placeholder="Inviter's Name"
                                value={form.invitedBy}
                                onChange={e => handleChange('invitedBy', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-slate-400 block mb-1">Joining Date</Label>
                            <Input
                                type="date"
                                value={form.joiningDate}
                                onChange={e => handleChange('joiningDate', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit button */}
                <div className="flex justify-end gap-3">
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white font-bold h-11 px-8 gap-2"
                    >
                        {submitting && <RefreshCw className="h-4 w-4 animate-spin" />}
                        Submit Admin Request
                    </Button>
                </div>
            </form>
        </div>
    );
}
