'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    label: string;
    name: string;
    required?: boolean;
    value: File | string | null;
    onChange: (fileOrUrl: File | string | null) => void;
    error?: string;
    acceptedFormats?: string[];
    maxSizeMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({
    label,
    name,
    required = false,
    value,
    onChange,
    error: propError,
    acceptedFormats = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'],
    maxSizeMB = 10,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [localError, setLocalError] = useState<string>('');
    const [urlInput, setUrlInput] = useState<string>(typeof value === 'string' ? value : '');

    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    const validateAndProcessFile = (file: File) => {
        setLocalError('');
        const extension = file.name.split('.').pop()?.toLowerCase() || '';

        if (!acceptedFormats.includes(extension)) {
            const errStr = `Only ${acceptedFormats.join(', ').toUpperCase()} formats are allowed.`;
            setLocalError(errStr);
            return;
        }

        if (file.size > maxSizeBytes) {
            const errStr = `File size exceeds the maximum limit of ${maxSizeMB} MB.`;
            setLocalError(errStr);
            return;
        }

        onChange(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndProcessFile(e.target.files[0]);
        }
    };

    const handleUrlBlur = () => {
        if (urlInput.trim()) {
            onChange(urlInput.trim());
        }
    };

    const displayedError = propError || localError;
    const fileName = value instanceof File ? value.name : typeof value === 'string' ? value : '';

    return (
        <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-white/90">
                {label} {required && <span className="text-pink-400 font-bold">*</span>}
            </label>

            <div
                className={`bg-white/20 border rounded-2xl p-4 transition-all ${
                    displayedError
                        ? 'border-pink-400 bg-pink-500/10'
                        : value
                        ? 'border-emerald-400/50 bg-emerald-500/10'
                        : 'border-white/30 hover:border-white/50'
                }`}
            >
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFormats.map((f) => `.${f}`).join(',')}
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/20 hover:bg-white/30 border border-white/40 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-all shrink-0"
                    >
                        <UploadCloud size={16} /> Choose File
                    </button>

                    <div className="flex-1 text-center sm:text-left overflow-hidden w-full">
                        {fileName ? (
                            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-300 font-semibold truncate">
                                <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                                <span className="truncate">{fileName}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-white/60">
                                PDF, DOC, PNG, JPG (Max {maxSizeMB} MB)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {displayedError && (
                <p className="text-pink-300 text-xs font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle size={13} /> {displayedError}
                </p>
            )}
        </div>
    );
};
