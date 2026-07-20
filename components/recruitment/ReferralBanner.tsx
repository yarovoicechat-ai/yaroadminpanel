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
            setErrorMessage('');
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
            setErrorMessage('Referral code could not be verified.');
            const failedState: ReferralState = {
                code: codeToVerify,
                isVerified: false,
                isLocked: isFromUrl,
            };
            setReferralState(failedState);
            onReferralVerified(failedState);
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
                        <label className="text-xs font-medium text-white/80 flex items-center gap-1.5">
                            <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                            Referral Code (Optional)
                        </label>
                        {referralState.isLocked && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                                Auto-detected from URL
                            </span>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={inputCode}
                            disabled={referralState.isLocked || loading}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="e.g. AGY001 / OPR021 / ADM010"
                            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-60"
                        />
                        {!referralState.isLocked && (
                            <button
                                type="button"
                                onClick={() => verifyCode(inputCode, false)}
                                disabled={loading || !inputCode.trim()}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                            >
                                {loading ? 'Verifying...' : 'Validate'}
                            </button>
                        )}
                    </div>

                    {errorMessage && (
                        <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {errorMessage}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
