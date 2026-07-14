'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from 'sonner';
import { ShieldAlert, ArrowLeft, Coins, Award } from 'lucide-react';
import Link from 'next/link';

export default function AddSellerPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [credit, setCredit] = useState('1000000');
    const [loading, setLoading] = useState(false);

    const handleAddSellerSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Mock integration
            setTimeout(() => {
                toast.success(`Successfully registered Coin Seller Agency "${name}"`);
                setName('');
                setEmail('');
                setCredit('1000000');
                setLoading(false);
            }, 1000);
        } catch (error) {
            toast.error("Failed to register seller profile");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link href="/sellers">
                        <Button variant="outline" size="sm" className="font-bold">
                            <ArrowLeft size={16} className="mr-1" /> Back
                        </Button>
                    </Link>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Add Coin Seller</h2>
                </div>
            </div>

            <Card className="glass-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-200">
                        <Award className="text-primary animate-pulse" />
                        Register Coin Seller Distributor
                    </CardTitle>
                    <CardDescription>Manually provision a wholesale distributor profile in the database.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddSellerSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Seller Agency Name</label>
                            <Input
                                placeholder="e.g. Asia Payouts Hub"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Email Address</label>
                            <Input
                                type="email"
                                placeholder="seller@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Credit Coins Balance Allocation</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={credit}
                                    onChange={(e) => setCredit(e.target.value)}
                                    required
                                />
                                <Coins className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <Button type="submit" className="w-full font-bold mt-2" disabled={loading}>
                            {loading ? 'Registering Seller...' : 'Register Coin Seller'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
