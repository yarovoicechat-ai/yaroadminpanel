'use client';

import React from 'react';
import { Clock, User, Shield, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuditEvent {
  id: string;
  actorName: string;
  actorRole: string;
  action: string;
  target: string;
  targetId?: string;
  timestamp: string | Date;
  reason?: string;
  before?: string;
  after?: string;
  status?: 'success' | 'failed' | 'warning';
}

export function AuditTimeline({ events = [] }: { events: AuditEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        No audit log events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
      {events.map((evt, idx) => (
        <div key={evt.id || idx} className="relative group">
          {/* Dot */}
          <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#070a13] bg-cyan-400 shadow-sm shadow-cyan-500/50" />

          <div className="p-3.5 rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-md hover:border-white/20 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">{evt.actorName}</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border border-white/10 bg-white/5 text-slate-400">
                  {evt.actorRole}
                </span>
                <span className="text-xs text-cyan-400 font-semibold">{evt.action}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Clock className="h-3 w-3" />
                <span>{new Date(evt.timestamp).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-1 text-xs text-slate-300">
              Target: <code className="text-violet-300 font-mono">{evt.target} {evt.targetId ? `(#${evt.targetId})` : ''}</code>
            </div>

            {evt.reason && (
              <div className="mt-2 p-2 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-400 italic">
                &ldquo;{evt.reason}&rdquo;
              </div>
            )}

            {(evt.before || evt.after) && (
              <div className="mt-2 flex items-center gap-2 text-[11px] font-mono">
                {evt.before && <span className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{evt.before}</span>}
                {evt.before && evt.after && <ArrowRight className="h-3 w-3 text-slate-500" />}
                {evt.after && <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{evt.after}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
