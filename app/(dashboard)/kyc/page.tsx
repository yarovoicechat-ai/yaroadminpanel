'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, FileText, RefreshCw, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/apiEndpoints';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/Table';

type KycSubmission = {
    _id: string;
    userId: number;
    panNumber: string;
    panImage: string;
    aadharNumber: string;
    aadharFrontImage: string;
    aadharBackImage: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    user?: {
        name?: string;
        userName?: string;
        meethiId?: string;
        role?: string;
    } | null;
};

export default function KycPage() {
    const [kycList, setKycList] = useState<KycSubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchKyc = useCallback(async () => {
        try {
            setLoading(true);
            const response = await apiClient.get<KycSubmission[]>(API_ENDPOINTS.KYC.PENDING);
            setKycList(Array.isArray(response.data) ? response.data : []);
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch KYC requests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchKyc();
    }, [fetchKyc]);

    const reviewKyc = async (item: KycSubmission, status: 'approved' | 'rejected') => {
        let reason = '';
        if (status === 'rejected') {
            reason = window.prompt('Enter rejection reason')?.trim() || '';
            if (!reason) return;
        }

        try {
            setProcessingId(item._id);
            const response = await apiClient.post(API_ENDPOINTS.KYC.PROCESS, {
                kycId: item._id,
                status,
                reason,
            });
            if (response.success) {
                toast.success(`KYC ${status}`);
                setKycList((items) => items.filter((entry) => entry._id !== item._id));
            }
        } catch (error: any) {
            toast.error(error.message || 'Unable to update KYC');
        } finally {
            setProcessingId(null);
        }
    };

    const documentLink = (url: string, label: string) => (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
        >
            <FileText size={13} />
            {label}
        </a>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
                        Identity Verification
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Real KYC submissions from hosts in your permitted team.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => void fetchKyc()} disabled={loading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            <Card glass>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-cyan-300" />
                        Pending KYC ({kycList.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Applicant</TableHead>
                                <TableHead>PAN</TableHead>
                                <TableHead>Aadhaar</TableHead>
                                <TableHead>Documents</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!loading && kycList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No pending KYC submissions.
                                    </TableCell>
                                </TableRow>
                            ) : kycList.map((kyc) => (
                                <TableRow key={kyc._id}>
                                    <TableCell>
                                        <p className="font-semibold">{kyc.user?.name || kyc.user?.userName || `User ${kyc.userId}`}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {kyc.user?.meethiId || kyc.userId} · {kyc.user?.role || 'user'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{kyc.panNumber}</TableCell>
                                    <TableCell className="font-mono text-xs">{kyc.aadharNumber}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {documentLink(kyc.panImage, 'PAN')}
                                            {documentLink(kyc.aadharFrontImage, 'Aadhaar front')}
                                            {documentLink(kyc.aadharBackImage, 'Aadhaar back')}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary">{kyc.status}</Badge></TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={processingId === kyc._id}
                                                onClick={() => void reviewKyc(kyc, 'approved')}
                                                className="text-emerald-400"
                                            >
                                                <CheckCircle className="mr-1 h-4 w-4" /> Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                disabled={processingId === kyc._id}
                                                onClick={() => void reviewKyc(kyc, 'rejected')}
                                            >
                                                <XCircle className="mr-1 h-4 w-4" /> Reject
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
