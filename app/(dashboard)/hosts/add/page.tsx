'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from 'sonner';
import { Video, ArrowLeft, Coins, Award } from 'lucide-react';
import Link from 'next/link';

export default function AddHostPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [mithiId, setMithiId] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddHostSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock integration
            setTimeout(() => {
                toast.success(`Successfully registered live Host "${name}"`);
                setName('');
                setEmail('');
                setMithiId('');
                setLoading(false);
            }, 1000);
        } catch (error) {
            toast.error("Failed to register host profile");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/hosts">
                        <Button variant="outline" size="sm" className="font-bold">
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Add Live Host</h2>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Video className="text-primary animate-pulse" />
                        Register Live Host Profile
                    </CardTitle>
                    <CardDescription>Manually provision host stream configurations in the database.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddHostSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Host Full Name</label>
                            <Input
                                placeholder="e.g. Katrina Kaif"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email Address</label>
                            <Input
                                type="email"
                                placeholder="host@mithichat.live"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Mithi Chat Live ID (Numerical)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="e.g. 500021"
                                    value={mithiId}
                                    onChange={(e) => setMithiId(e.target.value)}
                                    required
                                />
                                <Award className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full font-bold mt-2" disabled={loading}>
                            {loading ? 'Registering Host...' : 'Register Host'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
