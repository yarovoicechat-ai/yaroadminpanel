'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.mithichat.live';

function HostFormContent() {
    const searchParams = useSearchParams();
    const refCode = searchParams.get('referrer') || searchParams.get('ref') || '';

    const initialFormState = {
        name: '',
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

    const handleReset = () => {
        setForm(initialFormState);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.phone || !form.city || !form.linkedin) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setSubmitting(true);
            const res = await fetch(`${API_BASE}/api/public/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phoneNumber: form.phone,
                    role: 'host',
                    referralCode: form.referralCode,
                    documents: [form.resume, form.adharFront, form.adharBack, form.pan, form.portfolio, form.experienceLetter, form.addressProof, form.idProof].filter(Boolean),
                    city: form.city,
                    state: form.state,
                    district: form.district,
                    country: form.country,
                    linkedin: form.linkedin,
                    personalNote: form.personalNote,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(true);
                toast.success('Host application submitted successfully!');
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
            <div className="min-h-screen bg-gradient-to-br from-[#701a75] via-[#86198f] to-[#a21caf] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl text-white shadow-2xl">
                    <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                        <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black">Application Submitted! 🎉</h2>
                    <p className="text-white/80 text-sm">Your Host application has been submitted successfully.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#701a75] via-[#86198f] to-[#a21caf] flex flex-col items-center py-10 px-4">
            <div className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 md:p-10 text-white shadow-2xl">
                
                {/* Form Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold tracking-wide text-white uppercase">
                        HOST FORM - MITHICHAT
                    </h1>
                    <p className="text-xs font-semibold text-white/70 mt-1">
                        MithiChat, Host Requirements
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Applicant name */}
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

                    {/* Resume / CV */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Resume / CV
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
                                        if (file) setForm({ ...form, resume: file.name });
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder={form.resume || "No file chosen"}
                                value={form.resume}
                                onChange={e => setForm({ ...form, resume: e.target.value })}
                                className="bg-transparent text-white placeholder-white/60 text-xs w-full ml-3 focus:outline-none truncate"
                            />
                        </div>
                    </div>
                    {/* Aadhaar Front */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Aadhaar Card Front Side Document URL / File
                        </label>
                        <input
                            type="url"
                            placeholder="Aadhaar Front URL"
                            value={form.adharFront}
                            onChange={e => setForm({ ...form, adharFront: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Aadhaar Back */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Aadhaar Card Back Side Document URL / File
                        </label>
                        <input
                            type="url"
                            placeholder="Aadhaar Back URL"
                            value={form.adharBack}
                            onChange={e => setForm({ ...form, adharBack: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* PAN Card */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            PAN Card Document URL / File
                        </label>
                        <input
                            type="url"
                            placeholder="PAN Card URL"
                            value={form.pan}
                            onChange={e => setForm({ ...form, pan: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* LinkedIn / Social URL */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            LinkedIn Profile URL / Social Handle *
                        </label>
                        <input
                            type="url"
                            required
                            placeholder="https://linkedin.com/in/username"
                            value={form.linkedin}
                            onChange={e => setForm({ ...form, linkedin: e.target.value })}
                            className="w-full bg-white/20 border border-white/30 text-white placeholder-white/50 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                    </div>

                    {/* Portfolio / Audition Video */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Portfolio / Audition Video URL
                        </label>
                        <div className="bg-white/20 border border-white/30 rounded-full px-3 py-1.5 flex items-center justify-between">
                            <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white font-semibold text-xs px-3 py-1.5 rounded-full shrink-0 flex items-center gap-1.5 transition-all border border-white/30">
                                Choose File
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) setForm({ ...form, portfolio: file.name });
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder={form.portfolio || "No file chosen"}
                                value={form.portfolio}
                                onChange={e => setForm({ ...form, portfolio: e.target.value })}
                                className="bg-transparent text-white placeholder-white/60 text-xs w-full ml-3 focus:outline-none truncate"
                            />
                        </div>
                    </div>

                    {/* Experience Letter */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Experience Letter
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
                                        if (file) setForm({ ...form, experienceLetter: file.name });
                                    }}
                                />
                            </label>
                            <input
                                type="text"
                                placeholder={form.experienceLetter || "No file chosen"}
                                value={form.experienceLetter}
                                onChange={e => setForm({ ...form, experienceLetter: e.target.value })}
                                className="bg-transparent text-white placeholder-white/60 text-xs w-full ml-3 focus:outline-none truncate"
                            />
                        </div>
                    </div>

                    {/* Address Proof */}
                    <div>
                        <label className="text-xs font-semibold text-white/90 mb-1.5 block">
                            Address Proof *
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
                            Id Proof *
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
