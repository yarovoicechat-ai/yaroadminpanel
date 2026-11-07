'use client';

import { useMemo, useState } from 'react';
import { documentDownloadName, documentFileType, sanitizeDocumentUrl } from '@/lib/documentFiles';
import { ExternalLink, Download, FileText, Image as ImageIcon, RefreshCw } from 'lucide-react';

export default function DocumentPreview({
    url,
    title,
    className = '',
    style,
    showActions = true,
}: {
    url: string;
    title: string;
    className?: string;
    style?: React.CSSProperties;
    showActions?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    const resolvedUrl = useMemo(() => sanitizeDocumentUrl(url || ''), [url]);
    const type = useMemo(() => documentFileType(resolvedUrl || url || '', title), [resolvedUrl, url, title]);

    if (!url || !resolvedUrl) {
        return (
            <div className={`p-4 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 text-center flex flex-col items-center justify-center gap-1 ${className}`}>
                <FileText className="w-5 h-5 text-slate-600" />
                <span className="text-xs text-slate-500 font-medium">No document uploaded</span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
            {type.kind === 'image' && !failed && (
                <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg">
                    <img
                        src={resolvedUrl}
                        alt={title}
                        crossOrigin="anonymous"
                        className="max-h-[65vh] max-w-full rounded-lg object-contain shadow-sm border border-white/10 bg-black/40"
                        style={style}
                        onError={() => setFailed(true)}
                    />
                </div>
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

            {type.kind === 'file' && !failed && (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-white/10 text-center space-y-1">
                    <FileText className="w-6 h-6 text-cyan-400 mx-auto" />
                    <span className="text-xs text-slate-300 font-medium block">
                        {type.extension.toUpperCase()} Document Attached
                    </span>
                </div>
            )}

            {failed && (
                <div className="w-full p-4 bg-slate-900/90 border border-amber-500/30 rounded-xl text-center space-y-2">
                    <ImageIcon className="w-6 h-6 text-amber-400 mx-auto" />
                    <span className="text-xs text-amber-200 block font-medium">
                        Unable to render direct preview ({title})
                    </span>
                    <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setFailed(false);
                            }}
                            className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 flex items-center gap-1"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                        <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 rounded-md border border-cyan-700/60 flex items-center gap-1 font-semibold"
                        >
                            <ExternalLink className="w-3 h-3" /> Open in New Tab
                        </a>
                    </div>
                </div>
            )}

            {showActions && (
                <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                        href={resolvedUrl}
                        download={documentDownloadName(title, resolvedUrl)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-cyan-400 underline hover:text-cyan-300 flex items-center gap-1"
                    >
                        <Download className="w-3.5 h-3.5" /> Download
                    </a>
                    <span className="text-slate-600">•</span>
                    <a
                        href={resolvedUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-slate-300 hover:text-white underline flex items-center gap-1"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Full Size
                    </a>
                </div>
            )}
        </div>
    );
}
