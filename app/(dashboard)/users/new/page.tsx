'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/Table";
import { User, Clock, CheckCircle2, ShieldAlert, Ban, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function NewUsersPage() {
    const [search, setSearch] = useState('');
    
    // Mock new signups
    const [newUsers, setNewUsers] = useState<any[]>([
        { id: '1', userId: 10245, name: 'Siddharth Roy', email: 'siddharth@live.com', device: 'iOS 17.4', joined: '10 mins ago', status: 'verified' },
        { id: '2', userId: 10244, name: 'Pooja Hegde', email: 'pooja.h@gmail.com', device: 'Android 14', joined: '1 hr ago', status: 'pending' },
        { id: '3', userId: 10243, name: 'Kiara Advani', email: 'kiara@advani.co', device: 'iOS 16.2', joined: '3 hrs ago', status: 'verified' }
    ]);

    const handleVerify = (id: string) => {
        setNewUsers(prev => prev.map(u => {
            if (u.id === id) {
                toast.success(`User ${u.name} manually onboarded`);
                return { ...u, status: 'verified' };
            }
            return u;
        }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">New Registrations</h2>
                <p className="text-muted-foreground mt-1 font-medium font-sans">Audit and verify newly registered user profiles from the last 48 hours</p>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search new users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Clock size={20} className="text-primary animate-pulse" />
                        Recent Signups Queue
                    </CardTitle>
                    <CardDescription>Accounts provisioned from device IDs recently</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-bold text-slate-300">System ID</TableHead>
                                <TableHead className="font-bold text-slate-300">Display Name</TableHead>
                                <TableHead className="font-bold text-slate-300">Email</TableHead>
                                <TableHead className="font-bold text-slate-300">Device Platform</TableHead>
                                <TableHead className="font-bold text-slate-300">Registered Time</TableHead>
                                <TableHead className="font-bold text-slate-300">Status</TableHead>
                                <TableHead className="text-right font-bold text-slate-300">Onboarding Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {newUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).map((u) => (
                                <TableRow key={u.id} className="hover:bg-muted/30">
                                    <TableCell className="font-mono text-xs text-primary font-bold">{u.userId}</TableCell>
                                    <TableCell className="font-semibold text-slate-200">{u.name}</TableCell>
                                    <TableCell className="text-slate-300">{u.email}</TableCell>
                                    <TableCell className="font-semibold text-slate-400 text-xs">{u.device}</TableCell>
                                    <TableCell className="text-slate-400 text-xs font-semibold">{u.joined}</TableCell>
                                    <TableCell>
                                        <Badge variant={u.status === 'verified' ? 'success' : 'secondary'} className="font-semibold">
                                            {u.status === 'verified' ? 'Verified' : 'Pending Verification'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {u.status === 'pending' ? (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleVerify(u.id)}
                                                className="font-bold text-xs"
                                            >
                                                Approve Profile
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-emerald-400 font-bold flex items-center justify-end gap-1">
                                                <CheckCircle2 size={12} />
                                                Active
                                            </span>
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
