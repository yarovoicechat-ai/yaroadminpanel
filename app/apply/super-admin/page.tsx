'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const SUPER_ADMIN_STEPS: FormStep[] = [
    { id: 'executive', title: 'Executive Profile', description: 'Confidential executive credentials' },
    { id: 'governance', title: 'Strategic Governance', description: 'Security architecture & leadership' },
    { id: 'references', title: 'Executive References', description: 'Board level verification' },
    { id: 'nda', title: 'Enterprise NDA & Oath', description: 'Legal NDA & final oath' },
];

function SuperAdminFormContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });

    const [formData, setFormData] = useState({
        fullName: '',
        confidentialEmail: '',
        directPhone: '',
        country: 'India',
        state: '',
        district: '',
        city: '',

        executiveExperienceYears: '5+ years',
        strategicPortfolio: '',
        executiveSecurityCode: '',

        boardReference1: '',
        boardReference2: '',
        priorExecutiveRole: '',

        passportDocUrl: '',
        adharFrontUrl: '',
        adharBackUrl: '',
        panCardUrl: '',
        signedNdaUrl: '',
        agreedToNda: false,
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateCurrentStep = (): boolean => {
        if (currentStep === 0) {
            if (!formData.fullName.trim() || !formData.confidentialEmail.trim() || !formData.directPhone.trim()) {
                toast.error('Full Name, Confidential Email, and Direct Phone are required.');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(formData.confidentialEmail)) {
                toast.error('Please enter a valid email address.');
                return false;
            }
        } else if (currentStep === 1) {
            if (!formData.strategicPortfolio.trim() || formData.strategicPortfolio.length < 20) {
                toast.error('Please summarize your executive leadership portfolio (minimum 20 characters).');
                return false;
            }
        }
        return true;
    };

    const handleStepChange = (newStep: number) => {
        if (newStep > currentStep) {
            if (!validateCurrentStep()) return;
        }
        setCurrentStep(newStep);
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;

        if (!referral.code || !referral.isVerified) {
            toast.error('A valid, verified Referral Code (e.g. D07A24) is required to apply.');
            return;
        }

        if (!formData.agreedToNda) {
            toast.error('You must sign the Enterprise Non-Disclosure Agreement (NDA) to submit.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.fullName,
                email: formData.confidentialEmail,
                phone: formData.directPhone,
                country: formData.country,
                state: formData.state,
                district: formData.district,
                city: formData.city,
                experienceYears: formData.executiveExperienceYears,
                role: 'super-admin',
                referralCode: referral.code,
                documents: [
                    formData.adharFrontUrl ? { name: 'Aadhaar Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                    formData.adharBackUrl ? { name: 'Aadhaar Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                    formData.panCardUrl ? { name: 'PAN Card', documentType: 'PAN', url: formData.panCardUrl } : null,
                    formData.passportDocUrl ? { name: 'Passport / National ID', documentType: 'Passport', url: formData.passportDocUrl } : null,
                    formData.signedNdaUrl ? { name: 'Signed Enterprise NDA', documentType: 'NDA', url: formData.signedNdaUrl } : null,
                ].filter(Boolean),

                // Role specific data
                adharFront: formData.adharFrontUrl,
                adharBack: formData.adharBackUrl,
                pan: formData.panCardUrl,
                executiveExperienceYears: formData.executiveExperienceYears,
                strategicPortfolio: formData.strategicPortfolio,
                executiveSecurityCode: formData.executiveSecurityCode,
                boardReference1: formData.boardReference1,
                boardReference2: formData.boardReference2,
                priorExecutiveRole: formData.priorExecutiveRole,
            };

            const res = await apiClient.post('/api/recruitment/super-admin', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('Super Admin Executive Application Submitted!');
                localStorage.removeItem('recruitment_draft_super-admin');
            } else {
                toast.error(res.message || 'Submission failed.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <RoleCreateLayout
            roleKey="super-admin"
            roleTitle="Super Admin Application Portal"
            roleSubtitle="Executive Recruitment for Senior Operations, Platform Governance & Super Admin Clearances."
            badgeText="Confidential Super Admin Clearance"
            themeGradient="from-slate-950 via-rose-950 to-violet-950"
            accentColor="rose"
            steps={SUPER_ADMIN_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Executive Profile */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Confidential Executive Identity</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Executive Legal Full Name *</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={e => updateField('fullName', e.target.value)}
                            placeholder="Full Passport Name"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Confidential Email *</label>
                            <input
                                type="email"
                                value={formData.confidentialEmail}
                                onChange={e => updateField('confidentialEmail', e.target.value)}
                                placeholder="executive@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Direct Mobile Number *</label>
                            <input
                                type="tel"
                                value={formData.directPhone}
                                onChange={e => updateField('directPhone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">State *</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={e => updateField('state', e.target.value)}
                                placeholder="e.g. Delhi / Maharashtra"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">District *</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => updateField('district', e.target.value)}
                                placeholder="e.g. South Delhi / Mumbai"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. New Delhi"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => updateField('country', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-400"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Strategic Governance */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Strategic Governance & Security Authorization</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Years of Executive Leadership Exp</label>
                        <select
                            value={formData.executiveExperienceYears}
                            onChange={e => updateField('executiveExperienceYears', e.target.value)}
                            className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-rose-400"
                        >
                            <option value="3-5 years">3 - 5 Years</option>
                            <option value="5+ years">5+ Years (Senior Executive)</option>
                            <option value="10+ years">10+ Years (C-Level / Director)</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Executive Leadership Portfolio Summary *</label>
                        <textarea
                            rows={3}
                            value={formData.strategicPortfolio}
                            onChange={e => updateField('strategicPortfolio', e.target.value)}
                            placeholder="Summarize your experience managing enterprise platforms, security, or global teams..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Executive Authorization Code (If issued by Board)</label>
                        <input
                            type="text"
                            value={formData.executiveSecurityCode}
                            onChange={e => updateField('executiveSecurityCode', e.target.value)}
                            placeholder="e.g. EXEC-SA-9012"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Executive References */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Board Level Verification</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Board / Executive Reference 1</label>
                        <input
                            type="text"
                            value={formData.boardReference1}
                            onChange={e => updateField('boardReference1', e.target.value)}
                            placeholder="Name, Position & Contact"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Board / Executive Reference 2</label>
                        <input
                            type="text"
                            value={formData.boardReference2}
                            onChange={e => updateField('boardReference2', e.target.value)}
                            placeholder="Name, Position & Contact"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Prior Executive / Director Designation</label>
                        <input
                            type="text"
                            value={formData.priorExecutiveRole}
                            onChange={e => updateField('priorExecutiveRole', e.target.value)}
                            placeholder="e.g. Chief Operating Officer / Head of Product"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-rose-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Identity Verification & Enterprise NDA */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity Verification Documents & Executive Oath</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUpload
                            label="Aadhaar Card Front Side Document"
                            name="adharFrontUrl"
                            required
                            value={formData.adharFrontUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('adharFrontUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('adharFrontUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                        <FileUpload
                            label="Aadhaar Card Back Side Document"
                            name="adharBackUrl"
                            required
                            value={formData.adharBackUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('adharBackUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('adharBackUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUpload
                            label="PAN Card Document"
                            name="panCardUrl"
                            required
                            value={formData.panCardUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('panCardUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('panCardUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                        <FileUpload
                            label="Executive Resume / CV Document"
                            name="signedNdaUrl"
                            required
                            value={formData.signedNdaUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('signedNdaUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('signedNdaUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                    </div>

                    <FileUpload
                        label="Passport / National Identity Document (Optional)"
                        name="passportDocUrl"
                        value={formData.passportDocUrl}
                        onChange={(fileOrUrl) => {
                            if (typeof fileOrUrl === 'string') {
                                updateField('passportDocUrl', fileOrUrl);
                            } else if (fileOrUrl instanceof File) {
                                const reader = new FileReader();
                                reader.onloadend = () => updateField('passportDocUrl', reader.result as string);
                                reader.readAsDataURL(fileOrUrl);
                            }
                        }}
                    />

                    <div className="pt-3">
                        <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                checked={formData.agreedToNda}
                                onChange={e => updateField('agreedToNda', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-rose-500 rounded"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I solemnly declare that I will strictly abide by the Enterprise Non-Disclosure Agreement (NDA), uphold corporate security protocols, and execute Super Admin governance responsibilities with absolute integrity.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function SuperAdminApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Super Admin Portal...</div>}>
            <SuperAdminFormContent />
        </Suspense>
    );
}
