'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Settings, Percent, DollarSign, ToggleLeft, ToggleRight, Radio, Shield, Mail, FileText, Crown, LogOut } from "lucide-react";
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [promoteLoading, setPromoteLoading] = useState(false);
    const [settings, setSettings] = useState<any>({
        commissionRate: 20,
        coinPrice: 0.10,
        minPayout: 50,
        maintenanceMode: false,
        emailAlerts: true,
        userNotifications: true,
        callRatePerMinute: 100,
        hostSharePerMinute: 28,
        chatMessageCost: 10,
        privacyPolicy: '',
        termsAndConditions: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/admin/settings');
            if (response.success && response.data) {
                setSettings(response.data);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await apiClient.patch('/api/admin/settings', settings);
            if (response.success) {
                toast.success('Configuration parameters updated successfully');
                fetchSettings();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (key: string, val: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: val }));
    };

    const promoteToOwner = async () => {
        if (!confirm('⚠️ This will permanently change your role from superAdmin → owner. You will need to log out and log in again. Continue?')) return;
        setPromoteLoading(true);
        try {
            const res = await apiClient.post('/api/admin/promote-owner', {});
            if (res.success) {
                toast.success('✅ Role changed to Owner! Please log out and log in again.');
            } else {
                toast.error(res.message || 'Promotion failed');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Error promoting role');
        } finally {
            setPromoteLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10 text-slate-400 font-sans font-medium">Retrieving configuration parameters...</div>;
    }

    return (
        <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Global Settings</h2>
                    <p className="text-muted-foreground mt-1 font-medium font-sans">Adjust service commission percentages, call pricing, thresholds, and operational flags</p>
                </div>
                <Button type="submit" disabled={saving} className="font-bold">
                    {saving ? 'Saving...' : 'Apply Parameters'}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Commission & financial configuration */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <DollarSign size={20} className="text-primary" />
                            Financial Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">System Platform Commission Rate (%)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={settings.commissionRate}
                                    onChange={(e) => handleChange('commissionRate', parseInt(e.target.value))}
                                    required
                                />
                                <Percent className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Default Coin Price (USD)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={settings.coinPrice}
                                    onChange={(e) => handleChange('coinPrice', parseFloat(e.target.value))}
                                    required
                                />
                                <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Minimum Withdrawal Payout Threshold (USD)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={settings.minPayout}
                                    onChange={(e) => handleChange('minPayout', parseInt(e.target.value))}
                                    required
                                />
                                <DollarSign className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Call & pricing configuration */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Radio size={20} className="text-primary" />
                            Streaming & Call Configs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Video/Voice Call Rate (Coins/Minute)</label>
                            <Input
                                type="number"
                                value={settings.callRatePerMinute}
                                onChange={(e) => handleChange('callRatePerMinute', parseInt(e.target.value))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Host Earning Rate Share (Coins/Minute)</label>
                            <Input
                                type="number"
                                value={settings.hostSharePerMinute}
                                onChange={(e) => handleChange('hostSharePerMinute', parseInt(e.target.value))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300">Default Chat Message Cost (Coins)</label>
                            <Input
                                type="number"
                                value={settings.chatMessageCost}
                                onChange={(e) => handleChange('chatMessageCost', parseInt(e.target.value))}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Status and Flags configurations */}
                <Card className="glass-card md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-slate-200">
                            <Shield size={20} className="text-primary" />
                            Operational System Parameters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-3">
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-border">
                            <div>
                                <p className="text-sm font-bold text-slate-200">Maintenance Mode</p>
                                <p className="text-xs text-muted-foreground">Blocks application API access</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange('maintenanceMode', !settings.maintenanceMode)}
                            >
                                {settings.maintenanceMode ? <ToggleRight size={32} className="text-rose-500" /> : <ToggleLeft size={32} className="text-muted-foreground" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-border">
                            <div>
                                <p className="text-sm font-bold text-slate-200">SMTP Email Alerts</p>
                                <p className="text-xs text-muted-foreground">Verify signups and transactions</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange('emailAlerts', !settings.emailAlerts)}
                            >
                                {settings.emailAlerts ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-muted-foreground" />}
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-border">
                            <div>
                                <p className="text-sm font-bold text-slate-200">Push Notifications</p>
                                <p className="text-xs text-muted-foreground">Target hosts and users via FCM</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange('userNotifications', !settings.userNotifications)}
                            >
                                {settings.userNotifications ? <ToggleRight size={32} className="text-emerald-500" /> : <ToggleLeft size={32} className="text-muted-foreground" />}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ── Danger Zone: Role Promotion ── */}
            <Card className="border-orange-500/40 bg-orange-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-400">
                        <Crown size={20} /> Account Role
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <p className="font-semibold text-slate-200">Set Role to Owner</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Permanently upgrade your account role from <span className="text-amber-300 font-mono">superAdmin</span> → <span className="text-pink-400 font-mono">owner</span>.
                                Owner has full bypass access to all panel features. <strong className="text-orange-300">Re-login required after.</strong>
                            </p>
                        </div>
                        <Button
                            type="button"
                            onClick={promoteToOwner}
                            disabled={promoteLoading}
                            className="bg-orange-600 hover:bg-orange-700 text-white font-bold gap-2 flex-shrink-0"
                        >
                            <Crown className="h-4 w-4" />
                            {promoteLoading ? 'Upgrading...' : 'Set Role → Owner'}
                        </Button>
                    </div>
                    <p className="text-xs text-slate-600 mt-3">
                        ⚠️ This action is irreversible from this panel. Only use if you are the system owner.
                    </p>
                </CardContent>
            </Card>

        </form>
    );
}
