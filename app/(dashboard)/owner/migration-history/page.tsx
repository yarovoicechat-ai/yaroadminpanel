'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Crown, Database, ArrowLeft, ShieldCheck, CheckCircle2, History,
  FileCode, AlertTriangle, RefreshCw
} from "lucide-react";

export default function MigrationHistoryPage() {
  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Room ID Migration & Compatibility Status
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-xs">
                  Owner Exclusive
                </Badge>
              </h1>
              <p className="text-sm text-neutral-400">
                Safe migration architecture, database backup snapshots, and backward-compatible mapping documentation.
              </p>
            </div>
          </div>
        </div>

        <Link href="/owner/rooms">
          <Button variant="outline" size="sm" className="border-neutral-700 hover:bg-neutral-800">
            <ArrowLeft className="w-4 h-4 mr-1" /> View Room IDs
          </Button>
        </Link>
      </div>

      {/* Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Data Safety State</div>
              <div className="text-lg font-bold text-white">Non-Destructive</div>
              <div className="text-[11px] text-neutral-500">Historical IDs preserved</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Resolution Engine</div>
              <div className="text-lg font-bold text-blue-300">Dual Compatibility</div>
              <div className="text-[11px] text-neutral-500">Old & new IDs resolve</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-neutral-400">Rollback Protocol</div>
              <div className="text-lg font-bold text-purple-300">Ready & Verified</div>
              <div className="text-[11px] text-neutral-500">Instant revert script</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Specifications Card */}
      <Card className="bg-neutral-900/60 border-neutral-800">
        <CardHeader className="border-b border-neutral-800">
          <CardTitle className="text-base text-white">Migration Protocol & Technical Guarantees</CardTitle>
          <CardDescription className="text-xs text-neutral-400">
            Rules strictly executed by the system during Room ID transitions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4 text-xs text-neutral-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-sm">1. Zero Overwrite Guarantee</div>
            <p className="text-neutral-400">
              Existing Room documents retain their original legacy identifiers in the indexed <code className="text-amber-400">legacyId</code> field. No historical records, deep links, or chat channel references are severed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-sm">2. User ID Preservation</div>
            <p className="text-neutral-400">
              All existing user accounts and numeric User IDs remain untouched. The 9-digit sequence is strictly isolated to Room IDs.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-sm">3. Safe Operational Clean vs Destruction</div>
            <p className="text-neutral-400">
              When cleaning active rooms, the system transitions operational status to archived (<code className="text-blue-400">isActive: false, isArchived: true</code>). Historical PK records, gift transactions, and audit trails remain permanently stored.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="font-semibold text-white text-sm">4. Rollback Instructions</div>
            <p className="text-neutral-400 mb-2">
              If an owner ever requires reverting room identifiers back to legacy strings, execute the server-side transactional script:
            </p>
            <div className="p-3 bg-neutral-900 rounded font-mono text-emerald-400 text-xs select-all">
              npx ts-node scripts/rollback_room_ids_safe.ts
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
