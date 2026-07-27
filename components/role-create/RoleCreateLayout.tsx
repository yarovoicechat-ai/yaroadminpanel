'use client';

import { ReactNode, useState, useEffect } from 'react';
import { CheckCircle, Save, RotateCcw, ArrowRight, ArrowLeft, Sparkles, Lock } from 'lucide-react';
import { ReferralBanner, ReferralState } from './ReferralBanner';

export interface FormStep {
    id: string;
    title: string;
    description?: string;
}

interface RoleCreateLayoutProps {
    roleKey: string;
    roleTitle: string;
    roleSubtitle: string;
    badgeText: string;
    themeGradient: string; // Tailwind background gradient e.g. 'from-slate-950 via-purple-950 to-indigo-950'
    accentColor: string; // Tailwind accent color e.g. 'purple'
    steps: FormStep[];
    currentStep: number;
    onStepChange: (stepIndex: number) => void;
    onReferralVerified: (data: ReferralState) => void;
    onSubmit: () => void;
    submitting: boolean;
    success: boolean;
    applicationId?: string;
    formData: any;
    onRestoreDraft?: (savedData: any) => void;
    children: ReactNode;
}

export function RoleCreateLayout({
    roleKey,
    roleTitle,
    roleSubtitle,
    badgeText,
    themeGradient,
    accentColor,
    steps,
    currentStep,
    onStepChange,
    onReferralVerified,
    onSubmit,
    submitting,
    success,
    applicationId,
    formData,
    onRestoreDraft,
    children,
}: RoleCreateLayoutProps) {
    const [referralState, setReferralState] = useState<ReferralState | null>(null);
    const [draftSaved, setDraftSaved] = useState(false);

    const handleReferralVerified = (data: ReferralState) => {
        setReferralState(data);
        onReferralVerified(data);
    };

    // Auto-save draft to localStorage
    useEffect(() => {
        if (!success && formData && Object.keys(formData).length > 0) {
            const key = `recruitment_draft_${roleKey}`;
            try {
                localStorage.setItem(key, JSON.stringify(formData));
                setDraftSaved(true);
                const timer = setTimeout(() => setDraftSaved(false), 2000);
                return () => clearTimeout(timer);
            } catch {
                // Ignore storage errors
            }
        }
    }, [formData, roleKey, success]);

    const handleClearDraft = () => {
        const key = `recruitment_draft_${roleKey}`;
        localStorage.removeItem(key);
        window.location.reload();
    };

    if (success) {
        return (
            <div className={`min-h-screen bg-gradient-to-br ${themeGradient} flex items-center justify-center p-4 text-white font-sans`}>
                <div className="max-w-md w-full bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl text-center shadow-2xl space-y-6 animate-fadeIn">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                        <span className="text-xs uppercase tracking-widest font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                            Saved as Pending Request
                        </span>
                        <h2 className="text-2xl font-black text-white pt-2">Application Received!</h2>
                        <p className="text-sm text-white/80">
                            Your application for <strong className="text-white font-bold">{roleTitle}</strong> has been registered into the Request Approval Queue.
                        </p>
                    </div>

                    {applicationId && (
                        <div className="p-3 bg-black/30 border border-white/10 rounded-2xl">
                            <span className="text-xs text-white/60 block">Tracking Request ID:</span>
                            <span className="text-base font-mono font-bold text-amber-400">{applicationId}</span>
                        </div>
                    )}

                    <div className="text-xs text-white/60 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/10 text-left space-y-1">
                        <p className="font-semibold text-white">You can safely stay on this page.</p>
                        <ul className="list-disc pl-4 space-y-1">
                            <li>Application is saved as <strong>PENDING</strong> for authorized reviewers.</li>
                            <li>You will be contacted after review and account approval.</li>
                        </ul>
                    </div>

                    <div className="space-y-2.5 pt-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white/80 font-semibold text-xs rounded-xl transition-all border border-white/20"
                        >
                            Submit Another Application
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${themeGradient} text-white font-sans py-8 px-4 sm:px-6 lg:px-8`}>
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        {badgeText}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                        {roleTitle}
                    </h1>
                    <p className="text-sm text-white/70 max-w-xl mx-auto">
                        {roleSubtitle}
                    </p>
                </div>

                {/* Main Card Container */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">

                    {/* Referral Banner */}
                    <ReferralBanner onReferralVerified={handleReferralVerified} />

                    {!referralState?.isVerified ? (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 my-6 backdrop-blur-md">
                            <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
                                <Lock className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-white uppercase tracking-wider">Application Access Locked</h3>
                                <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                                    Direct access to this application form without an inviter referral code is restricted. Please validate your inviter referral code above to unlock the form.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Progress Stepper Header */}
                            <div className="space-y-3 pb-4 border-b border-white/10">
                                <div className="flex items-center justify-between text-xs text-white/70">
                                    <span className="font-semibold uppercase tracking-wider">
                                        Step {currentStep + 1} of {steps.length}: {steps[currentStep]?.title}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {draftSaved && (
                                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded">
                                                <Save className="w-3 h-3" /> Auto-Saved
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={handleClearDraft}
                                            title="Reset form draft"
                                            className="text-white/50 hover:text-white text-xs flex items-center gap-1"
                                        >
                                            <RotateCcw className="w-3 h-3" /> Reset
                                        </button>
                                    </div>
                                </div>

                                {/* Step Progress Bar */}
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden flex gap-1">
                                    {steps.map((step, idx) => (
                                        <div
                                            key={step.id}
                                            className={`h-full flex-1 transition-all duration-300 ${
                                                idx <= currentStep ? 'bg-gradient-to-r from-amber-400 to-emerald-400' : 'bg-white/10'
                                            }`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Step Body Content */}
                            <div className="pt-2">
                                {children}
                            </div>

                            {/* Step Navigation Controls */}
                            <div className="pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                                {currentStep > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => onStepChange(currentStep - 1)}
                                        className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all flex items-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Previous
                                    </button>
                                ) : <div />}

                                {currentStep < steps.length - 1 ? (
                                    <button
                                        type="button"
                                        onClick={() => onStepChange(currentStep + 1)}
                                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
                                    >
                                        Next Step <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={onSubmit}
                                        disabled={submitting}
                                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm shadow-xl transition-all border border-emerald-400/30 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Application <CheckCircle className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
