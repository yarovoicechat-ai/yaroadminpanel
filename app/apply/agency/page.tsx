'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mithichat.live';

function AgencyFormContent() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('referrer') || searchParams.get('ref') || '';

    const initialFormState = {
        businessName: '',
        businessAddress: '',
        city: '',
        country: 'India',
        panNumber: '',
        noHost: '',
        meethiLiveId: '',
        mobileNo: '',
        emailId: '',
        panCopy: '',
        addressProof: '',
        idProof: '',
        managerName: '',
        managerPhoto: '',
        agreedToTerms: false,
        referralCode: refCode,
    };

    const [form, setForm] = useState(initialFormState);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleReset = () => {
        setForm(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.businessName || !form.businessAddress || !form.meethiLiveId || !form.mobileNo || !form.emailId) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!form.agreedToTerms) {
            toast.error('Please accept the policy terms to proceed');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch(`${API_BASE}/api/public/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.businessName,
                    email: form.emailId,
                    phoneNumber: form.mobileNo,
                    role: 'agency',
                    referralCode: form.referralCode,
                    documents: [form.panCopy, form.addressProof, form.idProof, form.managerPhoto].filter(Boolean),
                    businessAddress: form.businessAddress,
                    city: form.city,
                    country: form.country,
                    panNumber: form.panNumber,
                    noHost: form.noHost,
                    meethiLiveId: form.meethiLiveId,
                    managerName: form.managerName,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                toast.success('Agency application submitted successfully!');
            } else {
                toast.error(data.message || 'Submission failed');
            }
        } catch {
            toast.error('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#3b0764] via-[#581c87] to-[#7e22ce] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-white shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black">Application Submitted! 🎉</h2>
                    <p className="text-white/80 text-sm">Your agency onboarding form has been received. Our team will review your application shortly.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#3b0764] via-[#581c87] to-[#7e22ce] flex flex-col items-center py-10 px-4">
            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 text-white shadow-2xl">
                
                {/* Form Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold tracking-wide text-white uppercase">
                        AGENCY FORM - MEETHICHAT
                    </h1>
                    <p className="text-xs font-semibold text-white/70 mt-1">
                        MeethiChat, Agency Requirements
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Registered business name */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Applicant&apos;s registered business name *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.businessName}
                            onChange={e => setForm({ ...form, businessName: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Registered business address */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Registered business address *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.businessAddress}
                            onChange={e => setForm({ ...form, businessAddress: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            City
                        </label>
                        <input
                            type="text"
                            value={form.city}
                            onChange={e => setForm({ ...form, city: e.target.value })}
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

                    {/* PAN No / Tax ID */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            PAN No. (Indian Applicants) or Income Tax Identification number (Foreign Applicants)
                        </label>
                        <input
                            type="text"
                            value={form.panNumber}
                            onChange={e => setForm({ ...form, panNumber: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* No Host */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            No Host
                        </label>
                        <input
                            type="text"
                            value={form.noHost}
                            onChange={e => setForm({ ...form, noHost: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* MeethiLiveId */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            MeethiLiveId *
                        </label>
                        <input
                            type="text"
                            required
                            value={form.meethiLiveId}
                            onChange={e => setForm({ ...form, meethiLiveId: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Mobile No */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Mobile No *
                        </label>
                        <input
                            type="tel"
                            required
                            value={form.mobileNo}
                            onChange={e => setForm({ ...form, mobileNo: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Email Id */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Email Id *
                        </label>
                        <input
                            type="email"
                            required
                            value={form.emailId}
                            onChange={e => setForm({ ...form, emailId: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Copy of PAN */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Copy of PAN (For Indian Applicant)
                        </label>
                        <div className="bg-white/20 border border-white/30 rounded-full px-3 py-1.5 flex items-center justify-between">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all border border-white/30">
                                Choose File
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setForm({ ...form, panCopy: file.name });
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder={form.panCopy || "No file chosen"}
                                value={form.panCopy}
                                onChange={e => setForm({ ...form, panCopy: e.target.value })}
                                className="bg-transparent text-white placeholder-white/60 text-xs w-full ml-3 focus:outline-none truncate"
                            />
                        </div>
                    </div>

                    {/* Address Proof */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Address Proof
                        </label>
                        <div className="bg-white/20 border border-white/30 rounded-full px-3 py-1.5 flex items-center justify-between">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all border border-white/30">
                                Choose File
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setForm({ ...form, addressProof: file.name });
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder={form.addressProof || "No file chosen"}
                                value={form.addressProof}
                                onChange={e => setForm({ ...form, addressProof: e.target.value })}
                                className="bg-transparent text-white placeholder-white/60 text-xs w-full ml-3 focus:outline-none truncate"
                            />
                        </div>
                    </div>

                    {/* Id Proof */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Id Proof
                        </label>
                        <div className="bg-white/20 border border-white/30 rounded-full px-3 py-1.5 flex items-center justify-between">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all border border-white/30">
                                Choose File
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setForm({ ...form, idProof: file.name });
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder={form.idProof || "No file chosen"}
                                value={form.idProof}
                                onChange={e => setForm({ ...form, idProof: e.target.value })}
                                className="bg-transparent text-white placeholder-white/60 text-xs w-full ml-3 focus:outline-none truncate"
                            />
                        </div>
                    </div>

                    {/* Manager Name */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Manager Name
                        </label>
                        <input
                            type="text"
                            value={form.managerName}
                            onChange={e => setForm({ ...form, managerName: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Manager Photo */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Manager Photo
                        </label>
                        <div className="bg-white/20 border border-white/30 rounded-full px-3 py-1.5 flex items-center justify-between">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all border border-white/30">
                                Choose File
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setForm({ ...form, managerPhoto: file.name });
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder={form.managerPhoto || "No file chosen"}
                                value={form.managerPhoto}
                                onChange={e => setForm({ ...form, managerPhoto: e.target.value })}
                                className="bg-transparent text-white placeholder-white/60 text-xs w-full ml-3 focus:outline-none truncate"
                            />
                        </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-white/90">
                            <input
                                type="checkbox"
                                checked={form.agreedToTerms}
                                onChange={e => setForm({ ...form, agreedToTerms: e.target.checked })}
                                className="w-4 h-4 rounded text-orange-500 focus:ring-0 cursor-pointer"
                            />
                            <span>I have read and understood this policy document and agree with the terms of our app</span>
                        </label>
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
            </div>
        </div>
    );
}

export default function AgencyFormPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Agency Form...</div>}>
            <AgencyFormContent />
        </Suspense>
    );
}
