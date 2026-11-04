'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const STATE_MANAGER_STEPS: FormStep[] = [
    { id: 'profile', title: 'Personal & Profile', description: 'State executive identity & contact details' },
    { id: 'territory', title: 'State Territory & Scale', description: 'Assigned state & regional expansion targets' },
    { id: 'leadership', title: 'Leadership & References', description: 'Regional management background & references' },
    { id: 'verification', title: 'Credentials & Verification', description: 'Govt ID, resume, selfie & territory oath' },
];

function StateManagerFormContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });

    const [formData, setFormData] = useState({
        fullName: '',
        yaroId: '',
        age: '',
        gender: 'female',
        email: '',
        phone: '',
        emergencyPhone: '',
        city: '',
        district: '',
        state: '',
        country: 'India',
        fullAddress: '',

        assignedCountry: 'India',
        assignedState: '',
        experienceYears: '3+ years',
        previousOrganizations: '',
        regionalTargets: '20+ Agencies, 300+ Active Hosts',
        languagesSpoken: 'Hindi, English, State Language',
        strategyNotes: '',

        reference1: '',
        reference2: '',
        previousLeadershipRole: '',

        govtIdUrl: '',
        adharFrontUrl: '',
        adharBackUrl: '',
        panCardUrl: '',
        resumePdfUrl: '',
        selfieUrl: '',
        experienceProofUrl: '',
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
            if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.country.trim()) {
                toast.error('Full Name, Email, Phone Number, and Country are required.');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                toast.error('Please enter a valid email address.');
                return false;
            }
        } else if (currentStep === 1) {
            if (!formData.assignedCountry.trim() || !formData.assignedState.trim()) {
                toast.error('Please specify both your Assigned Country and Assigned State.');
                return false;
            }
            if (!formData.previousOrganizations.trim()) {
                toast.error('Please describe your previous regional or state-level experience.');
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
            toast.error('A verified Referral Code from an Owner, Operator, or Country Manager is required.');
            return;
        }

        if (!formData.agreedToTerms) {
            toast.error('You must sign and accept the State Territory & Governance Agreement.');
            return;
        }

        try {
            setSubmitting(true);
            const documents = [
                formData.adharFrontUrl ? { name: 'Aadhaar / Govt ID Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                formData.adharBackUrl ? { name: 'Aadhaar / Govt ID Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                formData.panCardUrl ? { name: 'PAN Card / Tax ID', documentType: 'PAN', url: formData.panCardUrl } : null,
                formData.govtIdUrl ? { name: 'Government ID', documentType: 'GovtID', url: formData.govtIdUrl } : null,
                formData.resumePdfUrl ? { name: 'Resume / CV', documentType: 'Resume', url: formData.resumePdfUrl } : null,
                formData.selfieUrl ? { name: 'Selfie with ID Card', documentType: 'SelfieWithIdCard', url: formData.selfieUrl } : null,
                formData.experienceProofUrl ? { name: 'Experience Proof / Credentials', documentType: 'Certificate', url: formData.experienceProofUrl } : null,
            ].filter(Boolean);

            const payload = {
                name: formData.fullName,
                yaroId: formData.yaroId.trim() || undefined,
                userId: formData.yaroId.trim() || undefined,
                age: formData.age ? Number(formData.age) : undefined,
                gender: formData.gender,
                email: formData.email,
                phone: formData.phone,
                emergencyPhone: formData.emergencyPhone,
                city: formData.city,
                state: formData.assignedState || formData.state,
                district: formData.district,
                country: formData.assignedCountry || formData.country,
                fullAddress: formData.fullAddress,
                experienceYears: formData.experienceYears,
                role: 'state-manager',
                referralCode: referral.code,
                documents,

                assignedCountry: formData.assignedCountry,
                assignedState: formData.assignedState,
                previousOrganizations: formData.previousOrganizations,
                regionalTargets: formData.regionalTargets,
                languagesSpoken: formData.languagesSpoken,
                strategyNotes: formData.strategyNotes,
                reference1: formData.reference1,
                reference2: formData.reference2,
                previousLeadershipRole: formData.previousLeadershipRole,
            };

            const res = await apiClient.post('/api/recruitment/state-manager', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId || 'Submitted');
                setSuccess(true);
                toast.success('State Manager Application Submitted Successfully!');
                localStorage.removeItem('recruitment_draft_state-manager');
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
            roleKey="state-manager"
            roleTitle="State Manager Application Portal"
            roleSubtitle="Apply for Provincial / State-level platform operations, agency growth and district recruitment."
            badgeText="State Operations Clearance"
            themeGradient="from-slate-950 via-teal-950 to-slate-950"
            accentColor="teal"
            steps={STATE_MANAGER_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Personal & Contact Profile */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Personal & Identity Profile</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Full Legal Name *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                placeholder="Full Name as on Govt ID"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Yaro / Meethi User ID (Optional)</label>
                            <input
                                type="text"
                                value={formData.yaroId}
                                onChange={e => updateField('yaroId', e.target.value)}
                                placeholder="e.g. 10003412"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Age *</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => updateField('age', e.target.value)}
                                placeholder="e.g. 26"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Gender *</label>
                            <select
                                value={formData.gender}
                                onChange={e => updateField('gender', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-teal-400"
                            >
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Official Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Mobile / WhatsApp Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Country *</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => updateField('country', e.target.value)}
                                placeholder="India"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">State / Province *</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={e => updateField('state', e.target.value)}
                                placeholder="e.g. Uttar Pradesh"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">District *</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => updateField('district', e.target.value)}
                                placeholder="e.g. Lucknow"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. Lucknow"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Full Residential Address</label>
                        <input
                            type="text"
                            value={formData.fullAddress}
                            onChange={e => updateField('fullAddress', e.target.value)}
                            placeholder="Complete street address, building & landmark"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 2: State Territory & Scale Targets */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. State Territory & District Operations</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Assigned Country Territory *</label>
                            <input
                                type="text"
                                value={formData.assignedCountry}
                                onChange={e => updateField('assignedCountry', e.target.value)}
                                placeholder="India"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Assigned State Territory *</label>
                            <input
                                type="text"
                                value={formData.assignedState}
                                onChange={e => updateField('assignedState', e.target.value)}
                                placeholder="e.g. Maharashtra, Bihar, Uttar Pradesh"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                            <p className="text-xs text-white/50 mt-1">State Managers recruit Super Admins, Admins, BD Leaders, Agencies & Hosts strictly within this state.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Regional Experience Years *</label>
                            <select
                                value={formData.experienceYears}
                                onChange={e => updateField('experienceYears', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-teal-400"
                            >
                                <option value="1-2 years">1-2 years</option>
                                <option value="3+ years">3+ years</option>
                                <option value="5+ years">5+ years</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Projected Monthly Target</label>
                            <input
                                type="text"
                                value={formData.regionalTargets}
                                onChange={e => updateField('regionalTargets', e.target.value)}
                                placeholder="e.g. 15 BD Leaders, 50 Agencies, 500 Hosts"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Platforms & District Networks Managed *</label>
                        <textarea
                            value={formData.previousOrganizations}
                            onChange={e => updateField('previousOrganizations', e.target.value)}
                            rows={3}
                            placeholder="Detail your background in audio live streaming, agency onboarding, or district community management..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">District Growth Plan</label>
                        <textarea
                            value={formData.strategyNotes}
                            onChange={e => updateField('strategyNotes', e.target.value)}
                            rows={2}
                            placeholder="Outline which districts you plan to target first to onboard top agencies and talent..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Background & Professional References */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Background Check & Professional References</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Professional Reference 1 (Name, Title, Contact) *</label>
                            <input
                                type="text"
                                value={formData.reference1}
                                onChange={e => updateField('reference1', e.target.value)}
                                placeholder="Name, Role, Company, Phone/Email"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Professional Reference 2 (Name, Title, Contact)</label>
                            <input
                                type="text"
                                value={formData.reference2}
                                onChange={e => updateField('reference2', e.target.value)}
                                placeholder="Name, Role, Company, Phone/Email"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Leadership / State Head Role</label>
                        <input
                            type="text"
                            value={formData.previousLeadershipRole}
                            onChange={e => updateField('previousLeadershipRole', e.target.value)}
                            placeholder="e.g. State Community Lead at StreamApp"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-teal-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Verification Documents & Security Oath */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">4. Official Documentation & Security Oath</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FileUpload
                            label="Government Issued ID / Passport / Aadhaar Front *"
                            value={formData.adharFrontUrl || formData.govtIdUrl}
                            onChange={url => {
                                updateField('adharFrontUrl', url);
                                updateField('govtIdUrl', url);
                            }}
                            required
                        />
                        <FileUpload
                            label="Aadhaar / ID Card Back"
                            value={formData.adharBackUrl}
                            onChange={url => updateField('adharBackUrl', url)}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FileUpload
                            label="PAN Card / Tax ID"
                            value={formData.panCardUrl}
                            onChange={url => updateField('panCardUrl', url)}
                        />
                        <FileUpload
                            label="Resume / CV (PDF/DOC) *"
                            value={formData.resumePdfUrl}
                            onChange={url => updateField('resumePdfUrl', url)}
                            acceptedFormats={['pdf', 'doc', 'docx']}
                            required
                        />
                        <FileUpload
                            label="Selfie holding your Official ID Card *"
                            value={formData.selfieUrl}
                            onChange={url => updateField('selfieUrl', url)}
                            required
                        />
                    </div>

                    <div className="bg-teal-950/40 border border-teal-500/30 rounded-2xl p-4 text-xs text-white/80 space-y-2">
                        <h4 className="font-bold text-teal-300 uppercase tracking-wide">State Territory Oath & Governance:</h4>
                        <p>1. As a State Manager, I understand that my administrative, onboarding, and recruitment jurisdiction is strictly limited to my assigned state territory.</p>
                        <p>2. I will oversee and support BD Leaders, BD Officers, Agencies, and Hosts within this state with complete dedication and integrity.</p>
                        <p>3. Any violation of platform guidelines, illegal recruitment, or territory breach will result in immediate termination of administrative privileges.</p>
                    </div>

                    <label className="flex items-start gap-3 text-xs text-white/90 cursor-pointer pt-2">
                        <input
                            type="checkbox"
                            checked={formData.agreedToTerms}
                            onChange={e => updateField('agreedToTerms', e.target.checked)}
                            className="mt-0.5 rounded border-white/20 bg-white/10 text-teal-500 focus:ring-teal-400"
                        />
                        <span>I hereby declare that all submitted information is authentic. I agree to the Yaro State Manager Governance Code and Regional Territory Terms. *</span>
                    </label>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function StateManagerApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading State Manager Application...</div>}>
            <StateManagerFormContent />
        </Suspense>
    );
}
