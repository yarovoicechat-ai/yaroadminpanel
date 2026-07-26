'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const ADMIN_STEPS: FormStep[] = [
    { id: 'profile', title: 'Professional Profile', description: 'Personal & admin credentials' },
    { id: 'governance', title: 'Governance & Security', description: 'Platform moderation & experience' },
    { id: 'references', title: 'References & History', description: 'Professional background check' },
    { id: 'oath', title: 'Security Oath & Docs', description: 'Security clearance & agreement' },
];

function AdminFormContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        emergencyPhone: '',
        currentDesignation: '',
        city: '',
        state: '',
        district: '',
        country: 'India',

        adminExperienceYears: '3+ years',
        moderationSkills: 'User Bans, Fraud Detection, Live Room Monitoring',
        securityScenarioAnswer: '',

        reference1: '',
        reference2: '',
        previousAdminCode: '',

        govtIdUrl: '',
        adharFrontUrl: '',
        adharBackUrl: '',
        panCardUrl: '',
        securityConsentUrl: '',
        agreedToTerms: false,
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [applicationId, setApplicationId] = useState('');

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateCurrentStep = (): boolean => {
        if (currentStep === 0) {
            if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
                toast.error('Full Name, Email, and Phone Number are required.');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                toast.error('Please enter a valid email address.');
                return false;
            }
        } else if (currentStep === 1) {
            if (!formData.securityScenarioAnswer.trim() || formData.securityScenarioAnswer.length < 20) {
                toast.error('Please answer the security scenario question (minimum 20 characters).');
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

        if (!formData.agreedToTerms) {
            toast.error('You must sign the Administrative Code of Conduct to submit.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                state: formData.state,
                district: formData.district,
                country: formData.country,
                experienceYears: formData.adminExperienceYears,
                role: 'admin',
                referralCode: referral.code,
                documents: [
                    formData.adharFrontUrl ? { name: 'Aadhaar Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                    formData.adharBackUrl ? { name: 'Aadhaar Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                    formData.panCardUrl ? { name: 'PAN Card', documentType: 'PAN', url: formData.panCardUrl } : null,
                    formData.govtIdUrl ? { name: 'Govt Issued ID', documentType: 'GovtID', url: formData.govtIdUrl } : null,
                    formData.securityConsentUrl ? { name: 'Security Consent Form', documentType: 'Consent', url: formData.securityConsentUrl } : null,
                ].filter(Boolean),

                // Role specific data
                adharFront: formData.adharFrontUrl,
                adharBack: formData.adharBackUrl,
                pan: formData.panCardUrl,
                emergencyPhone: formData.emergencyPhone,
                currentDesignation: formData.currentDesignation,
                adminExperienceYears: formData.adminExperienceYears,
                moderationSkills: formData.moderationSkills,
                securityScenarioAnswer: formData.securityScenarioAnswer,
                reference1: formData.reference1,
                reference2: formData.reference2,
                previousAdminCode: formData.previousAdminCode,
            };

            const res = await apiClient.post('/api/recruitment/admin', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('Admin Recruitment Application Submitted!');
                localStorage.removeItem('recruitment_draft_admin');
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
            roleKey="admin"
            roleTitle="Admin Application Portal"
            roleSubtitle="Apply for Platform Administrator & Governance clearance on MithiChat."
            badgeText="Platform Administrator Application"
            themeGradient="from-slate-950 via-blue-950 to-indigo-950"
            accentColor="blue"
            steps={ADMIN_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Professional Profile */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Professional Profile</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Full Legal Name *</label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={e => updateField('fullName', e.target.value)}
                            placeholder="Full Name as on Govt ID"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Official Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Primary Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
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
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">District *</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => updateField('district', e.target.value)}
                                placeholder="e.g. South Delhi / Mumbai"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City *</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. Delhi"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => updateField('country', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Emergency Contact</label>
                            <input
                                type="tel"
                                value={formData.emergencyPhone}
                                onChange={e => updateField('emergencyPhone', e.target.value)}
                                placeholder="Emergency Contact No."
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Governance & Security */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Governance & Platform Moderation</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Years of Administration Experience</label>
                        <select
                            value={formData.adminExperienceYears}
                            onChange={e => updateField('adminExperienceYears', e.target.value)}
                            className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="1-3 years">1 - 3 Years</option>
                            <option value="3+ years">3+ Years</option>
                            <option value="5+ years">5+ Senior Administrator Years</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Key Moderation & Security Skills</label>
                        <input
                            type="text"
                            value={formData.moderationSkills}
                            onChange={e => updateField('moderationSkills', e.target.value)}
                            placeholder="e.g. IP Ban, Content Filtering, KYC Auditing"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Security Scenario: How do you handle a suspected data breach or abusive live stream incident? *</label>
                        <textarea
                            rows={4}
                            value={formData.securityScenarioAnswer}
                            onChange={e => updateField('securityScenarioAnswer', e.target.value)}
                            placeholder="Describe step-by-step incident response and protocol enforcement..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: References */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. References & Previous Clearance</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Professional Reference 1 (Name & Contact)</label>
                        <input
                            type="text"
                            value={formData.reference1}
                            onChange={e => updateField('reference1', e.target.value)}
                            placeholder="e.g. John Doe - Tech Lead (+91 9000000000)"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Professional Reference 2 (Name & Contact)</label>
                        <input
                            type="text"
                            value={formData.reference2}
                            onChange={e => updateField('reference2', e.target.value)}
                            placeholder="e.g. Sarah Smith - Ops Director"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Admin Code / Employee ID (Optional)</label>
                        <input
                            type="text"
                            value={formData.previousAdminCode}
                            onChange={e => updateField('previousAdminCode', e.target.value)}
                            placeholder="e.g. ADM009"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Oath */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity Verification & Security Documents</h3>
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
                            label="Admin Resume / CV Document"
                            name="securityConsentUrl"
                            required
                            value={formData.securityConsentUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('securityConsentUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('securityConsentUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                    </div>
                    <FileUpload
                        label="Government ID / Passport Copy (Optional)"
                        name="govtIdUrl"
                        value={formData.govtIdUrl}
                        onChange={(fileOrUrl) => {
                            if (typeof fileOrUrl === 'string') {
                                updateField('govtIdUrl', fileOrUrl);
                            } else if (fileOrUrl instanceof File) {
                                const reader = new FileReader();
                                reader.onloadend = () => updateField('govtIdUrl', reader.result as string);
                                reader.readAsDataURL(fileOrUrl);
                            }
                        }}
                    />

                    <div className="pt-3">
                        <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                checked={formData.agreedToTerms}
                                onChange={e => updateField('agreedToTerms', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-blue-500 rounded"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I swear an oath of confidentiality and administrative responsibility. I understand that unauthorized disclosure of platform user data or abuse of admin privileges will result in immediate legal action and termination.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function AdminApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Admin Portal...</div>}>
            <AdminFormContent />
        </Suspense>
    );
}
