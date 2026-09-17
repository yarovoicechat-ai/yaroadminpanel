'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, ShieldCheck, Check, Globe, RefreshCw, Layers } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export default function ReferralSettingsPage() {
    const [enabled, setEnabled] = useState<boolean>(true);
    const [landingDomain, setLandingDomain] = useState<string>('https://apply.voicecallclub.com');
    const [expiryDays, setExpiryDays] = useState<number>(30);
    const [limitPerUser, setLimitPerUser] = useState<number>(100);
    const [qrEnabled, setQrEnabled] = useState<boolean>(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
    const [dupMobile, setDupMobile] = useState<boolean>(true);
    const [dupDevice, setDupDevice] = useState<boolean>(true);
    const [dupAadhaar, setDupAadhaar] = useState<boolean>(true);
    const [dupPan, setDupPan] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await apiClient.get<any>('/referrals/settings');
                if (res && res.data) {
                    setEnabled(res.data.referralEnabled ?? true);
                    setLandingDomain(res.data.landingDomain || 'https://apply.voicecallclub.com');
                    setExpiryDays(res.data.referralExpiryDays || 30);
                    setLimitPerUser(res.data.referralLimitPerUser || 100);
                    setQrEnabled(res.data.qrEnabled ?? true);
                    setNotificationsEnabled(res.data.notificationEnabled ?? true);
                    setDupMobile(res.data.duplicateMobileProtection ?? true);
                    setDupDevice(res.data.duplicateDeviceProtection ?? true);
                    setDupAadhaar(res.data.duplicateAadhaarProtection ?? true);
                    setDupPan(res.data.duplicatePanProtection ?? true);
                }
            } catch (err) {
                console.error('Failed to load referral settings:', err);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.put('/referrals/settings', {
                referralEnabled: enabled,
                landingDomain,
                referralExpiryDays: expiryDays,
                referralLimitPerUser: limitPerUser,
                qrEnabled,
                notificationEnabled: notificationsEnabled,
                duplicateMobileProtection: dupMobile,
                duplicateDeviceProtection: dupDevice,
                duplicateAadhaarProtection: dupAadhaar,
                duplicatePanProtection: dupPan,
            });
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to update referral settings:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-6 pb-12">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Settings className="w-7 h-7 text-amber-500" />
                        Referral System & Abuse Protection Settings (Owner Only)
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Configure global parameters for referral link generation, expiry, and anti-abuse protection
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : savedSuccess ? <Check className="w-4 h-4 text-green-950" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : savedSuccess ? 'Settings Saved!' : 'Save Configuration'}
                </button>
            </div>

            <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-6 space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div>
                        <div className="font-semibold text-white">Enable Global Referral Network</div>
                        <div className="text-xs text-slate-400">Allow supported roles (Owner, Operator, Super Admin, Admin, Agency) to generate referral links</div>
                    </div>
                    <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Landing Domain</label>
                        <input
                            type="text"
                            value={landingDomain}
                            onChange={(e) => setLandingDomain(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Referral Expiry (Days)</label>
                        <input
                            type="number"
                            value={expiryDays}
                            onChange={(e) => setExpiryDays(parseInt(e.target.value, 10) || 30)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Referral Limit per User</label>
                        <input
                            type="number"
                            value={limitPerUser}
                            onChange={(e) => setLimitPerUser(parseInt(e.target.value, 10) || 100)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                    </div>
                </div>

                {/* Anti-Abuse Protection Engine Section */}
                <div className="space-y-4 border-t border-slate-800 pt-5">
                    <h3 className="text-md font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                        Referral Abuse Protection Engine
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                            <span className="text-xs text-slate-300">Duplicate Mobile Protection</span>
                            <input
                                type="checkbox"
                                checked={dupMobile}
                                onChange={(e) => setDupMobile(e.target.checked)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                            <span className="text-xs text-slate-300">Duplicate Device Fingerprint Protection</span>
                            <input
                                type="checkbox"
                                checked={dupDevice}
                                onChange={(e) => setDupDevice(e.target.checked)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                            <span className="text-xs text-slate-300">Duplicate Aadhaar Protection</span>
                            <input
                                type="checkbox"
                                checked={dupAadhaar}
                                onChange={(e) => setDupAadhaar(e.target.checked)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-950/60 rounded-lg border border-slate-800/60">
                            <span className="text-xs text-slate-300">Duplicate PAN Protection</span>
                            <input
                                type="checkbox"
                                checked={dupPan}
                                onChange={(e) => setDupPan(e.target.checked)}
                                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
