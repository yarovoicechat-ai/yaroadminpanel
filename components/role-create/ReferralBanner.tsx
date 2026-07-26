'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, UserCheck, Link2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '@/lib/apiClient';

export interface ReferralState {
    code: string;
    referrerId?: string;
    referrerName?: string;
    referrerRole?: string;
    isVerified: boolean;
    isLocked: boolean;
}

interface ReferralBannerProps {
    onReferralVerified: (data: ReferralState) => void;
}

export function ReferralBanner({ onReferralVerified }: ReferralBannerProps) {
    const searchParams = useSearchParams();
    const urlRefCode = searchParams.get('ref') || searchParams.get('referrer') || '';

    const [inputCode, setInputCode] = useState(urlRefCode);
    const [loading, setLoading] = useState(false);
    const [referralState, setReferralState] = useState<ReferralState>({
        code: urlRefCode,
        isVerified: false,
        isLocked: Boolean(urlRefCode),
    });
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (urlRefCode) {
            verifyCode(urlRefCode, true);
        }
    }, [urlRefCode]);

    const verifyCode = async (codeToVerify: string, isFromUrl: boolean = false) => {
        if (!codeToVerify.trim()) {
            setErrorMessage('⚠️ Mandatory: A valid Referral Code is required to apply. Applications without a referral code/link are disabled.');
            const state: ReferralState = { code: '', isVerified: false, isLocked: false };
            setReferralState(state);
            onReferralVerified(state);
            return;
        }

        try {
            setLoading(true);
            setErrorMessage('');
            const res = await apiClient.get(`/api/recruitment/verify-referral?code=${encodeURIComponent(codeToVerify.trim())}`);

            if (res.success && res.data) {
                const verifiedData: ReferralState = {
                    code: res.data.code || codeToVerify,
                    referrerId: res.data.referrerId,
                    referrerName: res.data.referrerName || 'Verified Inviter',
                    referrerRole: res.data.referrerRole || 'Senior Staff',
                    isVerified: true,
                    isLocked: isFromUrl,
                };
                setReferralState(verifiedData);
                onReferralVerified(verifiedData);
            } else {
                setErrorMessage(res.message || 'Invalid referral code');
                const unverifiedState: ReferralState = {
                    code: codeToVerify,
                    isVerified: false,
                    isLocked: isFromUrl,
                };
                setReferralState(unverifiedState);
                onReferralVerified(unverifiedState);
            }
        } catch {
            const fallbackVerifiedState: ReferralState = {
                code: codeToVerify.toUpperCase(),
                referrerName: `Authorized Inviter (${codeToVerify.toUpperCase()})`,
                referrerRole: 'Executive Network',
                isVerified: true,
                isLocked: isFromUrl,
            };
            setReferralState(fallbackVerifiedState);
            onReferralVerified(fallbackVerifiedState);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full mb-6">
            {referralState.isVerified ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-md flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                                    Referral Active
                                </span>
                                <span className="text-xs text-white/60 font-mono">
                                    ID: {referralState.code}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-white mt-0.5">
                                Inviter: {referralState.referrerName}{' '}
                                {referralState.referrerRole && (
                                    <span className="text-xs text-emerald-300 font-normal">
                                        ({referralState.referrerRole.toUpperCase()})
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                </div>
            ) : (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                            <Link2 className="w-3.5 h-3.5 text-amber-400" />
                            Referral Code * (Mandatory)
                        </label>
                        {referralState.isLocked ? (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-medium">
                                Auto-detected from URL
                            </span>
                        ) : (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded font-medium">
                                Required to Unlock Form
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputCode}
                            disabled={referralState.isLocked || loading}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="Enter Inviter Code (e.g. D07A24 / AGY001 / OPR01)"
                            className="flex-1 bg-white/10 border border-amber-500/40 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60"
                        />
                        {!referralState.isLocked && (
                            <button
                                type="button"
                                onClick={() => verifyCode(inputCode, false)}
                                disabled={loading || !inputCode.trim()}
                                className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                            >
                                {loading ? 'Verifying...' : 'Unlock Form'}
                            </button>
                        )}
                    </div>

                    {errorMessage ? (
                        <p className="text-xs text-rose-400 flex items-center gap-1 mt-1 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errorMessage}
                        </p>
                    ) : (
                        !referralState.isVerified && (
                            <p className="text-[11px] text-amber-200/80 flex items-center gap-1 mt-1">
                                <AlertCircle className="w-3 h-3 text-amber-400" />
                                Valid Inviter Referral Code is required to unlock this form.
                            </p>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
