'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { Video, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function HostRequestsPage() {
    // Mock requests
    const [requests, setRequests] = useState<any[]>([
        { id: '1', name: 'Alina Sen', email: 'alina.sen@gmail.com', introAudio: 'audio-intro.mp3', status: 'pending' },
        { id: '2', name: 'Janhvi Kapoor', email: 'janhvi.k@yahoo.com', introAudio: 'intro.wav', status: 'pending' }
    ]);

    const handleAction = (id: string, action: 'approved' | 'rejected') => {
        setRequests(prev => prev.map(r => {
            if (r.id === id) {
                toast.success(`Host application from ${r.name} has been ${action}`);
                return { ...r, status: action };
            }
            return r;
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Host Applications</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Approve or reject prospective broad hosts application portfolios</p>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Video size={20} className="text-primary animate-pulse" />
                        Host Registration applications Queue
                    </CardTitle>
                    <CardDescription>Applications requesting streamer credentials</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">Applicant Name</TableHead>
                                <TableHead className="font-bold text-slate-300">Email Username</TableHead>
                                <TableHead className="font-bold text-slate-300">Voice Audition Portfolio</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Action Queue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {requests.map((r) => (
                                <TableRow key={r.id} className="hover:bg-muted/30">
                                    <TableCell className="font-bold text-slate-200">{r.name}</TableCell>
                                    <TableCell className="text-slate-300 font-semibold">{r.email}</TableCell>
                                    <TableCell className="text-primary font-bold text-xs font-mono">{r.introAudio}</TableCell>
                                    <TableCell>
                                        <Badge variant={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'secondary' : 'destructive'} className="font-semibold capitalize">
                                            {r.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {r.status === 'pending' ? (
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAction(r.id, 'approved')}
                                                    className="flex items-center gap-1 font-bold text-xs hover:bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                >
                                                    <CheckCircle size={12} />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleAction(r.id, 'rejected')}
                                                    className="flex items-center gap-1 font-bold text-xs"
                                                >
                                                    <XCircle size={12} />
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground font-semibold uppercase">{r.status}</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
