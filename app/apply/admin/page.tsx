'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RecruitmentFormLayout, FormStep } from '@/components/recruitment/RecruitmentFormLayout';
import { ReferralState } from '@/components/recruitment/ReferralBanner';
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

        adminExperienceYears: '3+ years',
        moderationSkills: 'User Bans, Fraud Detection, Live Room Monitoring',
        securityScenarioAnswer: '',

        reference1: '',
        reference2: '',
        previousAdminCode: '',

        govtIdUrl: '',
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
                experienceYears: formData.adminExperienceYears,
                role: 'admin',
                referralCode: referral.code,
                documents: [
                    formData.govtIdUrl ? { name: 'Govt Issued ID', documentType: 'GovtID', url: formData.govtIdUrl } : null,
                    formData.securityConsentUrl ? { name: 'Security Consent Form', documentType: 'Consent', url: formData.securityConsentUrl } : null,
                ].filter(Boolean),

                // Role specific data
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
        <RecruitmentFormLayout
            roleKey="admin"
            roleTitle="Admin Recruitment Portal"
            roleSubtitle="Apply for Platform Administrator & Governance clearance on MeethiChat."
            badgeText="Platform Administrator Recruitment"
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
                            <label className="text-xs font-semibold text-white/80 block mb-1">Emergency Contact Number</label>
                            <input
                                type="tel"
                                value={formData.emergencyPhone}
                                onChange={e => updateField('emergencyPhone', e.target.value)}
                                placeholder="Emergency Contact No."
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Current Designation / City</label>
                            <input
                                type="text"
                                value={formData.currentDesignation}
                                onChange={e => updateField('currentDesignation', e.target.value)}
                                placeholder="e.g. System Admin, Mumbai"
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
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity & Security Oath</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Government ID Copy URL</label>
                        <input
                            type="url"
                            value={formData.govtIdUrl}
                            onChange={e => updateField('govtIdUrl', e.target.value)}
                            placeholder="Passport / ID link"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Background Check Consent Form URL</label>
                        <input
                            type="url"
                            value={formData.securityConsentUrl}
                            onChange={e => updateField('securityConsentUrl', e.target.value)}
                            placeholder="Signed consent document link"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

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
        </RecruitmentFormLayout>
    );
}

export default function AdminApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Admin Portal...</div>}>
            <AdminFormContent />
        </Suspense>
    );
}
