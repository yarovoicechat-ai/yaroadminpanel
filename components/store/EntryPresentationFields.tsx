'use client';
import React from 'react';
export default function EntryPresentationFields({ showAvatar, comingText, onChange }: {
  showAvatar: boolean; comingText: string;
  onChange: (value: { showAvatar?: boolean; comingText?: string }) => void;
}) {
  return <fieldset className="rounded-xl border border-cyan-500/30 p-4 space-y-3">
    <legend className="px-2 text-sm font-semibold text-cyan-300">Room entrance display</legend>
    <label className="flex items-center gap-2 text-sm text-slate-200">
      <input type="checkbox" checked={showAvatar} onChange={event => onChange({ showAvatar: event.target.checked })} />
      Show large user avatar above the entry animation
    </label>
    <p className="text-xs text-slate-400">Optional. Turn off for animations that already contain their own artwork.</p>
    <label className="block text-xs text-slate-300">Coming banner text
      <input maxLength={80} value={comingText} onChange={event => onChange({ comingText: event.target.value })}
        placeholder="is coming" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white" />
    </label>
  </fieldset>;
}
