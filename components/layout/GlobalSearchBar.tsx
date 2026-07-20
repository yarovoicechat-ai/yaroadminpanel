'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, FileText, User, Briefcase, Video } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export function GlobalSearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSearch = async (searchTerm: string) => {
        setQuery(searchTerm);
        if (searchTerm.trim().length < 2) {
            setResults([]);
            return;
        }

        try {
            setLoading(true);
            const res = await apiClient.get(`/api/v1/search?q=${encodeURIComponent(searchTerm.trim())}`);
            if (res.success && res.data?.results) {
                setResults(res.data.results);
            }
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectResult = (link: string) => {
        setIsOpen(false);
        setQuery('');
        setResults([]);
        router.push(link);
    };

    return (
        <div className="relative w-full max-w-md">
            <div
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-1.5 text-xs text-slate-400 cursor-pointer shadow-inner transition-all"
            >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="flex-1 truncate">Search users, hosts, apps...</span>
                <kbd className="hidden sm:inline-block bg-slate-800 text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                    Ctrl K
                </kbd>
            </div>

            {isOpen && (
                <div className="absolute top-12 left-0 right-0 z-50 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 space-y-2 max-h-96 overflow-y-auto">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Search className="w-4 h-4 text-slate-400 ml-1" />
                        <input
                            type="text"
                            autoFocus
                            value={query}
                            onChange={e => handleSearch(e.target.value)}
                            placeholder="Type to search system..."
                            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                        />
                        {loading && <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin mr-1" />}
                    </div>

                    <div className="space-y-1">
                        {results.length > 0 ? (
                            results.map((res, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleSelectResult(res.link)}
                                    className="p-2.5 hover:bg-slate-800 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {res.type === 'User' && <User className="w-4 h-4 text-indigo-400" />}
                                        {res.type === 'Employee' && <User className="w-4 h-4 text-emerald-400" />}
                                        {res.type === 'Recruitment' && <Briefcase className="w-4 h-4 text-purple-400" />}
                                        {res.type === 'Host' && <Video className="w-4 h-4 text-amber-400" />}
                                        <div>
                                            <div className="font-bold text-white">{res.title}</div>
                                            <div className="text-[11px] text-slate-400">{res.subtitle}</div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                                        {res.type}
                                    </span>
                                </div>
                            ))
                        ) : (
                            query.length >= 2 && !loading && (
                                <p className="text-xs text-slate-500 italic p-3 text-center">No matching records found.</p>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
