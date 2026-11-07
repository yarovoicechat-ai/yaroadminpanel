'use client';

import { useMemo, useState } from 'react';
import { documentDownloadName, documentFileType } from '@/lib/documentFiles';

const resolveDocumentUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const trimmed = String(rawUrl).trim();
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.yaroapp.in';
    return `${apiBase.replace(/\/+$/, '')}/${trimmed.replace(/^\/+/, '')}`;
};

export default function DocumentPreview({ url, title, className = '', style }: {
    url: string; title: string; className?: string; style?: React.CSSProperties;
}) {
    const [failed, setFailed] = useState(false);
    const resolvedUrl = useMemo(() => resolveDocumentUrl(url || ''), [url]);
    const type = useMemo(() => documentFileType(resolvedUrl || url || ''), [resolvedUrl, url]);

    if (!url || !resolvedUrl) {
        return <span className="text-xs text-slate-400">No document provided</span>;
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
            {type.kind === 'image' && !failed && (
                <img
                    src={resolvedUrl}
                    alt={title}
                    className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-sm border border-white/10"
                    style={style}
                    onError={() => setFailed(true)}
                />
            )}
            {type.kind === 'pdf' && !failed && (
                <object
                    data={resolvedUrl}
                    type="application/pdf"
                    className="w-full min-h-[300px] h-[50vh] rounded-lg border border-white/10"
                    aria-label={title}
                    onError={() => setFailed(true)}
                >
                    <iframe
                        src={resolvedUrl}
                        className="w-full h-full min-h-[300px] rounded-lg border-0"
                        title={title}
                    />
                </object>
            )}
            {type.kind === 'file' && (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-white/10 text-center">
                    <span className="text-xs text-slate-300 font-medium">
                        {type.extension.toUpperCase()} document — download or open below
                    </span>
                </div>
            )}
            {failed && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-1">
                    <span className="text-xs text-amber-300 block">Preview unavailable in embedded view.</span>
                    <a
                        href={resolvedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-cyan-400 underline hover:text-cyan-300"
                    >
                        Click here to open directly in a new tab ↗
                    </a>
                </div>
            )}
            <div className="flex items-center gap-3 pt-1">
                <a
                    href={resolvedUrl}
                    download={documentDownloadName(title, resolvedUrl)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-cyan-400 underline hover:text-cyan-300 flex items-center gap-1"
                >
                    📥 Download {type.extension.toUpperCase()}
                </a>
                <span className="text-slate-600">•</span>
                <a
                    href={resolvedUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-semibold text-slate-300 hover:text-white underline flex items-center gap-1"
                >
                    Open Full Size ↗
                </a>
            </div>
        </div>
    );
}
