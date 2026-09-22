'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeleteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username?: string;
  isDeleting?: boolean;
}

export function DeleteRequestModal({
  isOpen,
  onClose,
  onConfirm,
  username = 'alex.morgan',
  isDeleting = false,
}: DeleteRequestModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Centered with a blurred dark backdrop */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-[500px] translate-x-[-50%] translate-y-[-50%]",
            "bg-[#0d1222]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90",
            "font-sans antialiased text-white backdrop-blur-2xl",
            "duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
        >
          {/* Header */}
          <div className="flex flex-col items-start gap-4">
            {/* Danger icon inside soft red circular background */}
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/40">
              <AlertTriangle size={22} className="stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <DialogPrimitive.Title className="text-xl font-bold text-white leading-snug tracking-tight">
                Delete Request
              </DialogPrimitive.Title>
            </div>
          </div>

          {/* Body Text */}
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-300">
            <p className="text-slate-200 font-normal">
              Permanently delete this request for &apos;<span className="font-semibold text-white">{username}</span>&apos;?
            </p>

            <div className="bg-slate-950/60 border border-white/5 rounded-2xl p-4 space-y-2">
              <p className="font-semibold text-slate-400 text-xs uppercase tracking-wider">
                This action will permanently remove:
              </p>
              <ul className="space-y-1.5 text-slate-300 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>Request record</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>Linked application/account for this role</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>Assigned permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>Activity history</span>
                </li>
              </ul>
            </div>

            <p className="text-slate-400 text-xs">
              Accounts belonging to other roles will not be affected.
            </p>

            <p className="font-semibold text-rose-400 text-xs">
              This action cannot be undone.
            </p>
          </div>

          {/* Buttons Footer */}
          <div className="mt-8 pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            {/* Secondary: Cancel */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className={cn(
                "w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-slate-300 bg-white/[0.04] border border-white/10 rounded-xl",
                "hover:bg-white/[0.08] hover:text-white transition-all duration-150 shadow-sm",
                "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Cancel
            </button>

            {/* Primary (Danger): Delete Permanently */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className={cn(
                "w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-rose-600 rounded-xl",
                "hover:bg-rose-500 transition-all duration-150 shadow-lg shadow-rose-950/50",
                "focus:outline-none flex items-center justify-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <span>Delete Permanently</span>
              )}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
