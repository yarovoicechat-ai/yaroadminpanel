'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from 'sonner';
import { ShieldAlert, ArrowLeft, Key } from 'lucide-react';
import Link from 'next/link';

export default function AddAdminPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [adminRole, setAdminRole] = useState('admin');
    const [password, setPassword] = useState('Admin@123');
    const [loading, setLoading] = useState(false);

    const handleAddAdminSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock integration
            setTimeout(() => {
                toast.success(`Successfully registered Admin user "${name}" with role "${adminRole}"`);
                setName('');
                setEmail('');
                setLoading(false);
            }, 1000);
        } catch (error) {
            toast.error("Failed to register admin profile");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/admins">
                        <Button variant="outline" size="sm" className="font-bold">
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Add Admin</h2>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <ShieldAlert className="text-primary animate-pulse" />
                        Create Admin Account
                    </CardTitle>
                    <CardDescription>Manually provision administrative credentials in the database.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddAdminSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Admin Display Name</label>
                            <Input
                                placeholder="e.g. Vikram Batra"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email Address (Username)</label>
                            <Input
                                type="email"
                                placeholder="vikram@yaroapp.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Admin System Role</label>
                            <select
                                value={adminRole}
                                onChange={(e) => setAdminRole(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-slate-900 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2"
                            >
                                <option value="admin">Standard Admin (Agency Manager)</option>
                                <option value="superAdmin">Super Admin (System Moderator)</option>
                                <option value="owner">Owner (Full Privileges)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Assigned Password</label>
                            <div className="relative">
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Key className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full font-bold mt-2" disabled={loading}>
                            {loading ? 'Registering Admin...' : 'Register Admin Account'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
