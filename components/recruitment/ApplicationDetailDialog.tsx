'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
    CheckCircle2, XCircle, PauseCircle, Calendar, MessageSquare,
    FileText, User, Phone, Mail, MapPin, Link as LinkIcon, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface ApplicationDetailDialogProps {
    application: any | null;
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
}

const statusBadgeColors: Record<string, string> = {
    draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    submitted: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    pending: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    under_review: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    assigned: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
    interview_scheduled: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    interview_completed: 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30',
    document_verification: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    background_verification: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
    approved: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    joined: 'bg-lime-500/15 text-lime-400 border-lime-500/30',
    rejected: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    hold: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    cancelled: 'bg-red-500/15 text-red-500 border-red-500/30',
};

const allWorkflowStatuses = [
    { key: 'pending', label: 'Pending' },
    { key: 'under_review', label: 'Under Review' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'interview_scheduled', label: 'Interview Scheduled' },
    { key: 'interview_completed', label: 'Interview Completed' },
    { key: 'document_verification', label: 'Doc Verification' },
    { key: 'background_verification', label: 'Background Check' },
    { key: 'approved', label: 'Approved' },
    { key: 'joined', label: 'Joined' },
    { key: 'hold', label: 'Hold' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'cancelled', label: 'Cancelled' },
];

export function ApplicationDetailDialog({
    application,
    isOpen,
    onClose,
    onRefresh,
}: ApplicationDetailDialogProps) {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    if (!application) return null;

    const handleStatusUpdate = async (newStatus: string) => {
        try {
            setUpdatingStatus(true);
            const res = await apiClient.patch(`/api/recruitment/admin/applications/${application._id || application.applicationId}/status`, {
                status: newStatus,
                note: `Status updated to ${newStatus.toUpperCase()}`,
            });

            if (res.success) {
                toast.success(`Application status updated to ${newStatus.toUpperCase()}`);
                onRefresh();
                onClose();
            } else {
                toast.error(res.message || 'Failed to update status');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error updating application status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleAddNote = async () => {
        if (!noteText.trim()) return;
        try {
            setAddingNote(true);
            const res = await apiClient.post(`/api/recruitment/admin/applications/${application._id || application.applicationId}/notes`, {
                note: noteText.trim(),
            });

            if (res.success) {
                toast.success('Review note added');
                setNoteText('');
                onRefresh();
            } else {
                toast.error(res.message || 'Failed to add note');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error adding note');
        } finally {
            setAddingNote(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800 text-white p-6 rounded-3xl">
                <DialogHeader className="space-y-2 border-b border-slate-800 pb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                            {application.applicationId}
                        </span>
                        <Badge className={`uppercase tracking-wider font-bold text-xs ${statusBadgeColors[application.status] || ''}`}>
                            {application.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-400" />
                        {application.applicant?.name}
                    </DialogTitle>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                        Role: <span className="text-indigo-400">{application.role}</span> &bull; Applied: {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                </DialogHeader>

                <div className="space-y-6 py-4">

                    {/* Contact & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-2 text-xs">
                            <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-slate-300 truncate">{application.applicant?.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-slate-300">{application.applicant?.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="text-slate-300 truncate">{application.applicant?.city || 'N/A'}, {application.applicant?.country || 'India'}</span>
                        </div>
                    </div>

                    {/* Referrer Details */}
                    {application.referrer?.code && (
                        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                <div>
                                    <span className="text-emerald-400 font-bold">Referral Inviter:</span>{' '}
                                    <span className="text-white font-medium">{application.referrer.referrerName || 'Verified Referral'}</span>
                                    <span className="text-slate-400 ml-2 font-mono">({application.referrer.code})</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Role Specific Questionnaire & Details */}
                    {application.roleData && Object.keys(application.roleData).length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-amber-400" />
                                Role Questionnaire & Responses
                            </h4>
                            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.entries(application.roleData).map(([key, val]) => (
                                    <div key={key} className="space-y-0.5">
                                        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider block">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                        <span className="text-xs text-slate-200 font-medium break-words block">
                                            {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Uploaded Documents */}
                    {application.documents && application.documents.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <LinkIcon className="w-4 h-4 text-purple-400" />
                                Uploaded Documents ({application.documents.length})
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {application.documents.map((doc: any, idx: number) => (
                                    <a
                                        key={idx}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-indigo-300 font-medium transition-all"
                                    >
                                        <span className="truncate">{doc.name || doc.documentType || `Doc #${idx + 1}`}</span>
                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">View →</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Review Notes History */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4 text-emerald-400" />
                            Review Notes & Timeline
                        </h4>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {application.reviewNotes && application.reviewNotes.length > 0 ? (
                                application.reviewNotes.map((note: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs space-y-1">
                                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                                            <span className="font-bold text-slate-200">{note.authorName}</span>
                                            <span>{new Date(note.timestamp).toLocaleString()}</span>
                                        </div>
                                        <p className="text-slate-300">{note.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-500 italic">No review notes recorded yet.</p>
                            )}
                        </div>

                        {/* Add Note Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={noteText}
                                onChange={e => setNoteText(e.target.value)}
                                placeholder="Add review note..."
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <Button
                                type="button"
                                size="sm"
                                disabled={addingNote || !noteText.trim()}
                                onClick={handleAddNote}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                            >
                                {addingNote ? 'Saving...' : 'Add Note'}
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Status Action Buttons Footer */}
                <DialogFooter className="border-t border-slate-800 pt-4 flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Transition Stage:</span>
                        <select
                            value={application.status}
                            disabled={updatingStatus}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                        >
                            {allWorkflowStatuses.map(s => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={updatingStatus}
                            onClick={() => handleStatusUpdate('hold')}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs rounded-xl"
                        >
                            <PauseCircle className="w-3.5 h-3.5 mr-1" /> Hold
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={updatingStatus}
                            onClick={() => handleStatusUpdate('interview_scheduled')}
                            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 text-xs rounded-xl"
                        >
                            <Calendar className="w-3.5 h-3.5 mr-1" /> Interview
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={updatingStatus}
                            onClick={() => handleStatusUpdate('rejected')}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                        >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={updatingStatus}
                            onClick={() => handleStatusUpdate('approved')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
