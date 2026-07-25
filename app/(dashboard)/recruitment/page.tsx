'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';
import {
    Briefcase, UserCheck, ShieldAlert, HelpCircle, ShieldCheck,
    Search, Filter, RefreshCw, Eye, CheckCircle2, Clock, XCircle, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { ApplicationDetailDialog } from '@/components/recruitment/ApplicationDetailDialog';

const roleFilterOptions = [
    { key: 'all', label: 'All Roles', icon: Briefcase },
    { key: 'agency', label: 'Agencies', icon: Briefcase },
    { key: 'operator', label: 'Operators', icon: UserCheck },
    { key: 'admin', label: 'Admins', icon: ShieldAlert },
    { key: 'customer-service', label: 'Support', icon: HelpCircle },
    { key: 'super-admin', label: 'Super Admin', icon: ShieldCheck },
];

const statusFilterOptions = [
    { key: 'all', label: 'All Statuses' },
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'interview_scheduled', label: 'Interview' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'hold', label: 'Hold' },
];

const roleBadgeStyles: Record<string, string> = {
    agency: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    operator: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    admin: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'customer-service': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    'super-admin': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const statusBadgeStyles: Record<string, string> = {
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    under_review: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    interview_scheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rejected: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    hold: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

export default function RecruitmentAdminPage() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        interview: 0,
        approved: 0,
    });

    const fetchApplications = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, any> = {};
            if (selectedRole !== 'all') params.role = selectedRole;
            if (selectedStatus !== 'all') params.status = selectedStatus;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const res = await apiClient.get('/api/recruitment/admin/applications', params);

            if (res.success && res.data) {
                const list = res.data.applications || [];
                setApplications(list);

                // Compute summary metrics
                setStats({
                    total: res.data.total || list.length,
                    pending: list.filter((a: any) => a.status === 'pending').length,
                    interview: list.filter((a: any) => a.status === 'interview_scheduled').length,
                    approved: list.filter((a: any) => a.status === 'approved').length,
                });
            } else {
                toast.error(res.message || 'Failed to fetch recruitment applications');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error loading applications');
        } finally {
            setLoading(false);
        }
    }, [selectedRole, selectedStatus, searchQuery]);

    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    const handleViewDetails = (app: any) => {
        setSelectedApplication(app);
        setIsDetailOpen(true);
    };

    return (
        <div className="space-y-6 p-6">

            {/* Header Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                        <Briefcase className="w-7 h-7 text-indigo-400" />
                        Recruitment Applications Portal
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                        Enterprise recruitment board across multi-subdomain onboarding forms.
                    </p>
                </div>
                <Button
                    onClick={fetchApplications}
                    variant="outline"
                    size="sm"
                    className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                </Button>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Total Applications
                            <Briefcase className="w-4 h-4 text-indigo-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-white">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Pending Review
                            <Clock className="w-4 h-4 text-amber-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-amber-400">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Interviews Scheduled
                            <Calendar className="w-4 h-4 text-purple-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-purple-400">{stats.interview}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl p-4">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            Approved Partners
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="text-2xl font-black text-emerald-400">{stats.approved}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-4">
                {/* Role Tabs */}
                <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
                    {roleFilterOptions.map(r => {
                        const Icon = r.icon;
                        const isSelected = selectedRole === r.key;
                        return (
                            <button
                                key={r.key}
                                onClick={() => setSelectedRole(r.key)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white shadow-lg'
                                        : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {r.label}
                            </button>
                        );
                    })}
                </div>

                {/* Status Filter & Search */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                            value={selectedStatus}
                            onChange={e => setSelectedStatus(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            {statusFilterOptions.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search name, email, ID..."
                            className="bg-slate-950 border-slate-800 pl-9 text-xs text-white rounded-xl placeholder-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Applications Table */}
            <Card className="bg-slate-900 border-slate-800 text-white rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400 text-sm">Loading applications...</div>
                    ) : applications.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm space-y-2">
                            <Briefcase className="w-8 h-8 text-slate-600 mx-auto" />
                            <p>No applications match the selected role or filter criteria.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-slate-950 border-b border-slate-800">
                                <TableRow className="border-slate-800">
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">App ID</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Role</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Applicant</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Location (State/District)</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Aadhaar Front</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Aadhaar Back</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">PAN Card</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Referrer Code</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Status</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold">Date</TableHead>
                                    <TableHead className="text-slate-400 text-xs uppercase font-bold text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map(app => {
                                    const adharFront = app.documents?.find((d: any) => d.documentType === 'AdharFront' || d.name?.toLowerCase().includes('front'))?.url || app.roleData?.adharFront;
                                    const adharBack = app.documents?.find((d: any) => d.documentType === 'AdharBack' || d.name?.toLowerCase().includes('back'))?.url || app.roleData?.adharBack;
                                    const panDoc = app.documents?.find((d: any) => d.documentType === 'PAN' || d.name?.toLowerCase().includes('pan'))?.url || app.roleData?.pan;

                                    const stateName = app.applicant?.state || app.roleData?.state || '—';
                                    const districtName = app.applicant?.district || app.roleData?.district || '—';
                                    const cityName = app.applicant?.city || app.roleData?.city || '—';
                                    const countryName = app.applicant?.country || app.roleData?.country || 'India';

                                    return (
                                        <TableRow key={app._id || app.applicationId} className="border-slate-800 hover:bg-slate-800/40 transition-colors text-xs">
                                            <TableCell className="font-mono text-xs text-amber-400 font-bold whitespace-nowrap">
                                                {app.applicationId}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge className={`uppercase text-[10px] font-bold ${roleBadgeStyles[app.role] || ''}`}>
                                                    {app.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs">
                                                    <div className="font-bold text-white whitespace-nowrap">{app.applicant?.name}</div>
                                                    <div className="text-slate-400 text-[11px] whitespace-nowrap">{app.applicant?.email} &bull; {app.applicant?.phone}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-slate-300 whitespace-nowrap">
                                                <div>{cityName}, {districtName}</div>
                                                <div className="text-[10px] text-slate-500">{stateName}, {countryName}</div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {adharFront ? (
                                                    <a href={adharFront} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                                                        📄 View Front
                                                    </a>
                                                ) : <span className="text-slate-600">—</span>}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {adharBack ? (
                                                    <a href={adharBack} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                                                        📄 View Back
                                                    </a>
                                                ) : <span className="text-slate-600">—</span>}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                {panDoc ? (
                                                    <a href={panDoc} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                                                        💳 View PAN
                                                    </a>
                                                ) : <span className="text-slate-600">—</span>}
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-300 font-mono whitespace-nowrap">
                                                {app.referrer?.code ? (
                                                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                                        {app.referrer.code}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-500 italic">Direct</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <Badge className={`uppercase text-[10px] font-bold ${statusBadgeStyles[app.status] || ''}`}>
                                                    {app.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-slate-400 font-mono whitespace-nowrap">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleViewDetails(app)}
                                                className="border-slate-700 text-indigo-400 hover:bg-indigo-600 hover:text-white text-xs rounded-xl"
                                            >
                                                <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Application Detail Dialog */}
            <ApplicationDetailDialog
                application={selectedApplication}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onRefresh={fetchApplications}
            />
        </div>
    );
}
