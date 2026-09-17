'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const CUSTOMER_SERVICE_STEPS: FormStep[] = [
    { id: 'basics', title: 'Applicant Basics', description: 'Personal details & languages' },
    { id: 'skills', title: 'Support Skills & Scenarios', description: 'Typing WPM & situation handling' },
    { id: 'tools', title: 'Helpdesk & Shifts', description: 'Ticketing tools & availability' },
    { id: 'documents', title: 'Qualifications & Pledge', description: 'Certificates & commitment' },
];

function CustomerServiceFormContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });

    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        email: '',
        phone: '',
        gender: 'female',
        city: '',
        state: '',
        district: '',
        country: 'India',

        typingSpeedWpm: '40-60 WPM',
        languagesSpoken: 'English, Hindi',
        userConflictScenarioAnswer: '',

        helpdeskToolsExp: 'Zendesk, Freshdesk, In-app Live Chat',
        shiftFlexibility: 'Rotational 24/7 Shifts',
        preferredChannels: 'Live Chat & Email Support',

        educationCertUrl: '',
        adharFrontUrl: '',
        adharBackUrl: '',
        panCardUrl: '',
        idProofUrl: '',
        photoUrl: '',
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
            if (!formData.userConflictScenarioAnswer.trim() || formData.userConflictScenarioAnswer.length < 15) {
                toast.error('Please answer how you handle upset users (minimum 15 characters).');
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
            toast.error('Please accept the customer service pledge to submit.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.fullName,
                age: formData.age ? Number(formData.age) : undefined,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                city: formData.city,
                state: formData.state,
                district: formData.district,
                country: formData.country,
                role: 'customer-service',
                referralCode: referral.code,
                documents: [
                    formData.adharFrontUrl ? { name: 'Aadhaar Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                    formData.adharBackUrl ? { name: 'Aadhaar Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                    formData.panCardUrl ? { name: 'PAN Card', documentType: 'PAN', url: formData.panCardUrl } : null,
                    formData.educationCertUrl ? { name: 'Education Certificate', documentType: 'Certificate', url: formData.educationCertUrl } : null,
                    formData.idProofUrl ? { name: 'ID Proof', documentType: 'GovtID', url: formData.idProofUrl } : null,
                    formData.photoUrl ? { name: 'Profile Photo', documentType: 'Photo', url: formData.photoUrl } : null,
                ].filter(Boolean),

                typingSpeedWpm: formData.typingSpeedWpm,
                languagesSpoken: formData.languagesSpoken,
                userConflictScenarioAnswer: formData.userConflictScenarioAnswer,
                helpdeskToolsExp: formData.helpdeskToolsExp,
                shiftFlexibility: formData.shiftFlexibility,
                preferredChannels: formData.preferredChannels,
            };

            const res = await apiClient.post('/api/recruitment/customer-service', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('Customer Support Application Submitted!');
                localStorage.removeItem('recruitment_draft_customer-service');
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
            roleKey="customer-service"
            roleTitle="Customer Support Application Portal"
            roleSubtitle="Join our Customer Care & User Support Team to assist users and hosts 24/7."
            badgeText="Customer Support Specialist Onboarding"
            themeGradient="from-slate-950 via-cyan-950 to-sky-950"
            accentColor="cyan"
            steps={CUSTOMER_SERVICE_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Basics */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Applicant Basics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                placeholder="Full Name"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Age</label>
                            <input
                                type="number"
                                min="18"
                                max="100"
                                value={formData.age}
                                onChange={e => updateField('age', e.target.value)}
                                placeholder="e.g. 24"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="support@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Mobile / WhatsApp Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
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
                                placeholder="e.g. Karnataka / Delhi"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">District *</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => updateField('district', e.target.value)}
                                placeholder="e.g. Bangalore Urban"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={e => updateField('gender', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-400"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. Bangalore"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => updateField('country', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Skills & Scenarios */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Support Skills & Scenarios</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Typing Speed (WPM)</label>
                            <select
                                value={formData.typingSpeedWpm}
                                onChange={e => updateField('typingSpeedWpm', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-400"
                            >
                                <option value="<30 WPM">&lt; 30 WPM</option>
                                <option value="30-40 WPM">30 - 40 WPM</option>
                                <option value="40-60 WPM">40 - 60 WPM</option>
                                <option value="60+ WPM">60+ WPM (Fast Typist)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Languages Proficient</label>
                            <input
                                type="text"
                                value={formData.languagesSpoken}
                                onChange={e => updateField('languagesSpoken', e.target.value)}
                                placeholder="e.g. English, Hindi, Bengali"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Support Scenario: How do you handle a user complaining about coin deduction or failed withdrawal? *</label>
                        <textarea
                            rows={3}
                            value={formData.userConflictScenarioAnswer}
                            onChange={e => updateField('userConflictScenarioAnswer', e.target.value)}
                            placeholder="De-escalation procedure & empathetic response..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Helpdesk Tools */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Helpdesk Tools & Shift Preference</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Helpdesk Tools / Software Experienced With</label>
                        <input
                            type="text"
                            value={formData.helpdeskToolsExp}
                            onChange={e => updateField('helpdeskToolsExp', e.target.value)}
                            placeholder="e.g. Zendesk, Freshdesk, Crisp, Zoho Desk"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Shift Availability</label>
                            <select
                                value={formData.shiftFlexibility}
                                onChange={e => updateField('shiftFlexibility', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-400"
                            >
                                <option value="Day Shift">Day Shift</option>
                                <option value="Night Shift">Night Shift</option>
                                <option value="Rotational 24/7 Shifts">Rotational 24/7 Shifts</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Preferred Channel</label>
                            <select
                                value={formData.preferredChannels}
                                onChange={e => updateField('preferredChannels', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-cyan-400"
                            >
                                <option value="In-App Live Chat">In-App Live Chat</option>
                                <option value="Email Ticketing">Email Ticketing</option>
                                <option value="Live Chat & Email Support">Live Chat & Email Support</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Verification */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity & Verification Documents</h3>
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
                            label="Customer Support Resume / CV Document"
                            name="educationCertUrl"
                            required
                            value={formData.educationCertUrl}
                            onChange={(fileOrUrl) => {
                                if (typeof fileOrUrl === 'string') {
                                    updateField('educationCertUrl', fileOrUrl);
                                } else if (fileOrUrl instanceof File) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => updateField('educationCertUrl', reader.result as string);
                                    reader.readAsDataURL(fileOrUrl);
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Passport Size Photo URL</label>
                        <input
                            type="url"
                            value={formData.photoUrl}
                            onChange={e => updateField('photoUrl', e.target.value)}
                            placeholder="Photo link"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400"
                        />
                    </div>

                    <div className="pt-3">
                        <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                checked={formData.agreedToTerms}
                                onChange={e => updateField('agreedToTerms', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-cyan-500 rounded"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I commit to providing professional, respectful, and prompt support to Voice Call Club users. I agree to adhere to standard SLAs and customer service guidelines.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function CustomerServiceApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Customer Support Portal...</div>}>
            <CustomerServiceFormContent />
        </Suspense>
    );
}
