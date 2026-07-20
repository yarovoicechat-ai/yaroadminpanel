'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Bot, Send, X, Sparkles, ChevronRight, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

export function AICopilotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; suggestions?: string[] }>>([
        {
            role: 'assistant',
            text: 'Hello! I am your Enterprise AI Copilot. Ask me about recruitment bottlenecks, department KPIs, or workflow suggestions.',
            suggestions: ['Summarize recruitment pipeline', 'Check HR department SLAs', 'List top performing branches']
        }
    ]);

    const handleSend = async (textToSend?: string) => {
        const prompt = textToSend || query;
        if (!prompt.trim()) return;

        const userMsg = { role: 'user' as const, text: prompt };
        setMessages(prev => [...prev, userMsg]);
        setQuery('');
        setLoading(true);

        try {
            // Simulated AI Copilot response
            setTimeout(() => {
                setMessages(prev => [
                    ...prev,
                    {
                        role: 'assistant',
                        text: `[AI Copilot Analysis] Based on real-time platform metrics: 124 recruitment applications are under review. Approval velocity is optimal (+14.2%). Recommending auto-assigning 12 Lucknow Operator files.`,
                        suggestions: ['Deploy Auto-Assign Rule', 'Export BI Revenue Forecast']
                    }
                ]);
                setLoading(false);
            }, 600);
        } catch {
            setLoading(false);
            toast.error('AI Copilot query failed');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full p-4 shadow-2xl flex items-center gap-2 font-bold text-xs border border-indigo-400/30 transition-all hover:scale-105"
                >
                    <Bot className="w-5 h-5 text-amber-300" />
                    <span>AI Copilot</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                </Button>
            ) : (
                <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px] transition-all">
                    {/* Header */}
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                                <Bot className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1">
                                    Enterprise AI Copilot
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                </h4>
                                <span className="text-[10px] text-emerald-400 font-semibold">● Active Platform Intelligence</span>
                            </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div
                                    className={`p-3 rounded-2xl text-xs max-w-[85%] ${
                                        msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                                    }`}
                                >
                                    {msg.text}
                                </div>
                                {msg.suggestions && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {msg.suggestions.map((sug, sIdx) => (
                                            <button
                                                key={sIdx}
                                                onClick={() => handleSend(sug)}
                                                className="text-[10px] bg-slate-800 hover:bg-indigo-950 text-indigo-300 hover:text-white px-2 py-1 rounded-lg border border-slate-700 transition-all flex items-center gap-1"
                                            >
                                                <ChevronRight className="w-3 h-3 text-amber-400" /> {sug}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                                <Bot className="w-4 h-4 text-indigo-400 animate-spin" /> Analyzing platform metrics...
                            </div>
                        )}
                    </div>

                    {/* Input Footer */}
                    <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                        <Input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Ask Copilot anything..."
                            className="flex-1 bg-slate-900 border-slate-800 text-xs text-white rounded-xl"
                        />
                        <Button
                            size="sm"
                            disabled={loading || !query.trim()}
                            onClick={() => handleSend()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl p-2.5"
                        >
                            <Send className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
