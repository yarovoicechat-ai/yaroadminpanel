'use client';

import { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

interface DeleteRequestButtonProps {
  requestId: string;
  applicantName?: string;
  onDeleted: (requestId: string) => void;
}

export function DeleteRequestButton({
  requestId,
  applicantName,
  onDeleted,
}: DeleteRequestButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const identity = applicantName ? ` for ${applicantName}` : '';
    const confirmed = window.confirm(
      `Permanently delete this request${identity}?\n\nThis removes only this request and its same-role linked application/account data, permissions and history. App and panel accounts in other roles are not affected. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const response = await apiClient.delete(`/api/ems/requests/${requestId}`);
      onDeleted(requestId);
      toast.success(response.message || 'Request and all linked data permanently deleted.');
    } catch (error: any) {
      toast.error(error?.message || 'Unable to delete request. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white font-semibold text-[11px] transition-all shadow-xs"
      title="Permanently delete request and all linked data"
    >
      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
    </button>
  );
}
