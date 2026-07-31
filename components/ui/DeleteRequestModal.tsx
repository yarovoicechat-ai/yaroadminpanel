'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DeleteRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
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
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-[500px] translate-x-[-50%] translate-y-[-50%]",
            "bg-white border border-[#E5E7EB] rounded-[20px] p-6 sm:p-8 shadow-2xl shadow-gray-900/10",
            "font-sans antialiased text-gray-900",
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
            <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-[#DC2626] shrink-0">
              <AlertTriangle size={20} className="stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <DialogPrimitive.Title className="text-[20px] font-bold text-gray-900 leading-snug">
                Delete Request
              </DialogPrimitive.Title>
            </div>
          </div>

          {/* Body Text */}
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-600">
            <p className="text-gray-900 font-normal">
              Permanently delete this request for &apos;<span className="font-semibold text-gray-900">{username}</span>&apos;?
            </p>

            <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-4 space-y-2">
              <p className="font-medium text-gray-700 text-xs uppercase tracking-wider">
                This action will permanently remove:
              </p>
              <ul className="space-y-1.5 text-gray-600 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>Request</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>Linked application/account for this role</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>Assigned permissions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span>Activity history</span>
                </li>
              </ul>
            </div>

            <p className="text-gray-500 text-xs sm:text-sm">
              Accounts belonging to other roles will not be affected.
            </p>

            <p className="font-semibold text-[#DC2626] text-xs sm:text-sm">
              This action cannot be undone.
            </p>
          </div>

          {/* Buttons Footer */}
          <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            {/* Secondary: Cancel */}
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className={cn(
                "w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-[12px]",
                "hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-gray-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                "w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-[#DC2626] rounded-[12px]",
                "hover:bg-[#B91C1C] active:bg-[#991B1B] transition-all duration-150 shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-red-500/30 flex items-center justify-center gap-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
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
