'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Lock } from 'lucide-react';
import { FileUpload } from '@/components/role-create/FileUpload';
import { Audio30SecRecorder } from '@/components/role-create/Audio30SecRecorder';
import { ReferralBanner, ReferralState } from '@/components/role-create/ReferralBanner';
import { apiClient } from '@/lib/apiClient';

function HostFormContent() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('referrer') || searchParams.get('ref') || '';

    const initialFormState = {
        name: '',
        age: '',
        gender: 'female',
        email: '',
        phone: '',
        city: '',
        state: '',
        district: '',
        country: 'India',
        resume: '',
        adharFront: '',
        adharBack: '',
        pan: '',
        linkedin: '',
        portfolio: '',
        experienceLetter: '',
        addressProof: '',
        idProof: '',
        personalNote: '',
        referralCode: refCode,
    };

    const [form, setForm] = useState(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [referralState, setReferralState] = useState<ReferralState | null>(null);

    const handleReferralVerified = (state: ReferralState) => {
        setReferralState(state);
        setForm(current => ({
            ...current,
            referralCode: state.isVerified ? state.code.trim() : '',
        }));
    };

    const handleReset = () => {
        setForm(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const verifiedReferralCode = referralState?.isVerified
            ? referralState.code.trim()
            : '';
        if (!verifiedReferralCode) {
            toast.error('A valid Referral Code is required to submit host application.');
            return;
        }

        if (
            !form.name.trim() ||
            !form.age ||
            !form.email.trim() ||
            !form.phone.trim() ||
            !form.city.trim() ||
            !form.state.trim() ||
            !form.district.trim() ||
            !form.country.trim() ||
            !(form.adharFront || form.idProof) ||
            !(form.adharBack || form.addressProof) ||
            !form.pan ||
            !form.portfolio ||
            !form.personalNote.trim()
        ) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const documents = [
                { name: 'Resume', documentType: 'Resume', url: form.resume },
                { name: 'Aadhaar Front', documentType: 'GovtID', url: form.adharFront || form.idProof },
                { name: 'Aadhaar Back', documentType: 'GovtID', url: form.adharBack || form.addressProof },
                { name: 'PAN Card', documentType: 'Certificate', url: form.pan },
                { name: 'Portfolio', documentType: 'Portfolio', url: form.portfolio },
                { name: 'Experience Letter', documentType: 'Experience', url: form.experienceLetter },
            ].filter(document => Boolean(document.url));

            const data = await apiClient.post('/api/recruitment/host', {
                name: form.name.trim(),
                age: form.age ? Number(form.age) : undefined,
                gender: form.gender,
                email: form.email.trim(),
                phone: form.phone.trim(),
                role: 'host',
                referralCode: verifiedReferralCode,
                documents,
                city: form.city.trim(),
                state: form.state.trim(),
                district: form.district.trim(),
                country: form.country.trim(),
                personalNote: form.personalNote.trim(),
            });
            if (data.success) {
                setSuccess(true);
                toast.success('Host application submitted successfully!');
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Unable to submit host application. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };


    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#701a75] via-[#86198f] to-[#a21caf] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-white shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black">Saved as Pending Request! 🎉</h2>
                    <p className="text-white/80 text-sm">Your Host application has been saved to the Host Request Queue.</p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-black text-sm rounded-xl transition-all border border-emerald-400/30 shadow-lg"
                    >
                        Submit Another Application
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#701a75] via-[#86198f] to-[#a21caf] flex flex-col items-center py-10 px-4">
            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 text-white shadow-2xl">
                
                {/* Form Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold tracking-wide text-white uppercase">
                        HOST FORM - MITHICHAT
                    </h1>
                    <p className="text-xs font-semibold text-white/70 mt-1">
                        MithiChat Host Recruitment & Clearances
                    </p>
                </div>

                {/* Referral Banner */}
                <ReferralBanner onReferralVerified={handleReferralVerified} />

                {!referralState?.isVerified ? (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 my-6 backdrop-blur-md">
                        <div className="w-14 h-14 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-500/40">
                            <Lock className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider">Host Application Locked</h3>
                            <p className="text-xs text-white/70 max-w-md mx-auto leading-relaxed">
                                Direct application without an inviter referral code is restricted. Please enter a valid Inviter Referral Code above to unlock the host form.
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Applicant name */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                                Applicant&apos;s name *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                                Age *
                            </label>
                            <input
                                type="number"
                                required
                                min="18"
                                max="100"
                                placeholder="e.g. 21"
                                value={form.age}
                                onChange={e => setForm({ ...form, age: e.target.value })}
                                className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                                Gender
                            </label>
                            <select
                                value={form.gender}
                                onChange={e => setForm({ ...form, gender: e.target.value })}
                                className="w-full bg-slate-900 border border-white/30 text-white rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Email *
                        </label>
                        <input
                            type="email"
                            required
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Phone *
                        </label>
                        <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={e => setForm({ ...form, phone: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            City *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* State */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            State *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Maharashtra"
                            value={form.state}
                            onChange={e => setForm({ ...form, state: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* District */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            District *
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Mumbai City"
                            value={form.district}
                            onChange={e => setForm({ ...form, district: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Country *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.country}
                            onChange={e => setForm({ ...form, country: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Documents Upload Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUpload
                            label="Aadhaar Card Front Side"
                            name="adharFront"
                            required
                            value={form.adharFront || form.idProof}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    setForm(prev => ({ ...prev, adharFront: fileOrUrl, idProof: fileOrUrl }));
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setForm(prev => ({ ...prev, adharFront: reader.result as string, idProof: reader.result as string }));
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                        <FileUpload
                            label="Aadhaar Card Back Side"
                            name="adharBack"
                            required
                            value={form.adharBack || form.addressProof}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    setForm(prev => ({ ...prev, adharBack: fileOrUrl, addressProof: fileOrUrl }));
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setForm(prev => ({ ...prev, adharBack: reader.result as string, addressProof: reader.result as string }));
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUpload
                            label="PAN Card Document"
                            name="pan"
                            required
                            value={form.pan || form.experienceLetter}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    setForm(prev => ({ ...prev, pan: fileOrUrl }));
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setForm(prev => ({ ...prev, pan: reader.result as string }));
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                        <Audio30SecRecorder
                            label="Host 30-Second Voice Sample / Audition"
                            required
                            value={form.portfolio}
                            onChange={(base64Data) => setForm(prev => ({ ...prev, portfolio: base64Data }))}
                        />
                    </div>

                    {/* Personal Note */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Personal Note *
                        </label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Brief note about your hosting experience..."
                            value={form.personalNote}
                            onChange={e => setForm({ ...form, personalNote: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-8 py-2.5 rounded-full text-sm transition-all shadow-md"
                        >
                            Reset All
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-10 py-2.5 rounded-full text-sm transition-all shadow-lg shadow-orange-500/40 disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Form'}
                        </button>
                    </div>

                </form>
                )}
            </div>
        </div>
    );
}

export default function HostFormPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Host Form...</div>}>
            <HostFormContent />
        </Suspense>
    );
}
