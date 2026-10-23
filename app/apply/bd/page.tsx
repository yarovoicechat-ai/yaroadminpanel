'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const BD_STEPS: FormStep[] = [
    { id: 'personal', title: 'Personal Profile', description: 'Applicant personal & contact details' },
    { id: 'experience', title: 'BD & Creator Growth', description: 'Experience & agency network scale' },
    { id: 'capacity', title: 'Targets & Availability', description: 'Monthly targets & working hours' },
    { id: 'verification', title: 'Documents & KYC', description: 'Identity verification & undertaking' },
];

function BdFormContent() {
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

        experienceYears: '1-3 years',
        previousPlatforms: '',
        languagesSpoken: 'Hindi, English',
        bdCategory: 'Agency Onboarding & Creator BD',

        monthlyTargetAgencies: '5-10 Agencies',
        dailyActiveHours: '8+ Hours',
        focusRegion: 'North India',

        govtIdUrl: '',
        adharFrontUrl: '',
        adharBackUrl: '',
        panCardUrl: '',
        resumePdfUrl: '',
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
            if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.city.trim()) {
                toast.error('Please fill in Full Name, Email, Phone, and City.');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                toast.error('Please enter a valid email address.');
                return false;
            }
        } else if (currentStep === 1) {
            if (!formData.previousPlatforms.trim()) {
                toast.error('Please specify previous platforms or industry experience.');
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
            toast.error('A valid, verified Referral Code from a BD Leader / Senior is required to apply.');
            return;
        }

        if (!formData.agreedToTerms) {
            toast.error('Please accept the Business Development code of conduct to submit.');
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
                experienceYears: formData.experienceYears,
                role: 'bd',
                referralCode: referral.code,
                documents: [
                    formData.adharFrontUrl ? { name: 'Aadhaar Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                    formData.adharBackUrl ? { name: 'Aadhaar Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                    formData.panCardUrl ? { name: 'PAN Card', documentType: 'PAN', url: formData.panCardUrl } : null,
                    formData.govtIdUrl ? { name: 'Government ID', documentType: 'GovtID', url: formData.govtIdUrl } : null,
                    formData.resumePdfUrl ? { name: 'Resume PDF', documentType: 'Resume', url: formData.resumePdfUrl } : null,
                    formData.experienceProofUrl ? { name: 'Experience Proof', documentType: 'Certificate', url: formData.experienceProofUrl } : null,
                ].filter(Boolean),

                bdCategory: formData.bdCategory,
                previousPlatforms: formData.previousPlatforms,
                languagesSpoken: formData.languagesSpoken,
                monthlyTargetAgencies: formData.monthlyTargetAgencies,
                dailyActiveHours: formData.dailyActiveHours,
                focusRegion: formData.focusRegion,
            };

            const res = await apiClient.post('/api/recruitment/bd', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('BD Application Submitted Successfully!');
                localStorage.removeItem('recruitment_draft_bd');
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
            roleKey="bd"
            roleTitle="Business Development (BD) Application"
            roleSubtitle="Apply as an official Business Development Officer to recruit agencies, creators, and accelerate community growth."
            badgeText="BD Officer Recruitment"
            themeGradient="from-slate-950 via-blue-950 to-indigo-950"
            accentColor="blue"
            steps={BD_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Personal Profile */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Personal & Contact Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Full Name *</label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={e => updateField('fullName', e.target.value)}
                                placeholder="Your Full Name"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => updateField('age', e.target.value)}
                                placeholder="24"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
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
                                placeholder="applicant@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">WhatsApp / Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={e => updateField('gender', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="female" className="text-black">Female</option>
                                <option value="male" className="text-black">Male</option>
                                <option value="other" className="text-black">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City *</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. Mumbai, Delhi"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">State / Province</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={e => updateField('state', e.target.value)}
                                placeholder="e.g. Maharashtra"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Experience & BD Category */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Business Development & Platform Experience</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Years of BD / Community Experience</label>
                            <select
                                value={formData.experienceYears}
                                onChange={e => updateField('experienceYears', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="Fresher" className="text-black">Fresher (&lt; 1 year)</option>
                                <option value="1-3 years" className="text-black">1 - 3 years</option>
                                <option value="3-5 years" className="text-black">3 - 5 years</option>
                                <option value="5+ years" className="text-black">5+ years</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Primary BD Role Specialization</label>
                            <select
                                value={formData.bdCategory}
                                onChange={e => updateField('bdCategory', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="Agency Onboarding & Creator BD" className="text-black">Agency Onboarding & Creator BD</option>
                                <option value="Voice Room & Host Recruitment" className="text-black">Voice Room & Host Recruitment</option>
                                <option value="Regional Partnerships & Events" className="text-black">Regional Partnerships & Events</option>
                                <option value="Institutional & College BD" className="text-black">Institutional & College BD</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Platforms / Apps / Agencies Managed *</label>
                        <textarea
                            value={formData.previousPlatforms}
                            onChange={e => updateField('previousPlatforms', e.target.value)}
                            rows={3}
                            placeholder="e.g. Poppo Live, Chamet, Uplive, Bigo Live, TikTok creator management..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Languages Spoken Fluently</label>
                        <input
                            type="text"
                            value={formData.languagesSpoken}
                            onChange={e => updateField('languagesSpoken', e.target.value)}
                            placeholder="e.g. Hindi, English, Punjabi, Bengali"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Targets & Availability */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Monthly Targets & Working Capacity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Target Monthly Agencies</label>
                            <select
                                value={formData.monthlyTargetAgencies}
                                onChange={e => updateField('monthlyTargetAgencies', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="3-5 Agencies" className="text-black">3 - 5 Agencies / Month</option>
                                <option value="5-10 Agencies" className="text-black">5 - 10 Agencies / Month</option>
                                <option value="10-20 Agencies" className="text-black">10 - 20 Agencies / Month</option>
                                <option value="20+ Agencies" className="text-black">20+ Agencies / Month</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Daily Active Working Hours</label>
                            <select
                                value={formData.dailyActiveHours}
                                onChange={e => updateField('dailyActiveHours', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="4-6 Hours" className="text-black">4 - 6 Hours (Part-time)</option>
                                <option value="8+ Hours" className="text-black">8+ Hours (Full-time)</option>
                                <option value="Flexible / Target-based" className="text-black">Flexible / Target-based</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Focus Region</label>
                            <select
                                value={formData.focusRegion}
                                onChange={e => updateField('focusRegion', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="North India" className="text-black">North India</option>
                                <option value="South India" className="text-black">South India</option>
                                <option value="East India" className="text-black">East India</option>
                                <option value="West India" className="text-black">West India</option>
                                <option value="Pan-India / All Regions" className="text-black">Pan-India / All Regions</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Verification & Agreement */}
            {currentStep === 3 && (
                <div className="space-y-5">
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity Verification & Documents</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Aadhaar Front Copy</label>
                            <FileUpload
                                label="Upload Aadhaar Front"
                                value={formData.adharFrontUrl}
                                onChange={url => updateField('adharFrontUrl', url)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Aadhaar Back Copy</label>
                            <FileUpload
                                label="Upload Aadhaar Back"
                                value={formData.adharBackUrl}
                                onChange={url => updateField('adharBackUrl', url)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">PAN Card / Govt ID</label>
                            <FileUpload
                                label="Upload PAN Card"
                                value={formData.panCardUrl}
                                onChange={url => updateField('panCardUrl', url)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Resume / CV (PDF or Image)</label>
                            <FileUpload
                                label="Upload Resume"
                                value={formData.resumePdfUrl}
                                onChange={url => updateField('resumePdfUrl', url)}
                            />
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.agreedToTerms}
                                onChange={e => updateField('agreedToTerms', e.target.checked)}
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-400"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I confirm that all provided details and identity documents are authentic. I agree to uphold Yaro App's Business Development policies, respect anti-poaching and ethics rules, and commit to professional agency onboarding standards.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function BdApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading BD Form...</div>}>
            <BdFormContent />
        </Suspense>
    );
}
