'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const BD_LEADER_STEPS: FormStep[] = [
    { id: 'personal', title: 'Personal Profile', description: 'Leader contact & personal details' },
    { id: 'leadership', title: 'Leadership & Track Record', description: 'Team management & industry record' },
    { id: 'strategy', title: 'Regional Scale & Targets', description: 'BD team scaling & agency goals' },
    { id: 'verification', title: 'Credentials & Verification', description: 'Identity, resume & agreement' },
];

function BdLeaderFormContent() {
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

        experienceYears: '3-5 years',
        previousPlatforms: '',
        managedTeamSize: '10-25 BD Officers',
        languagesSpoken: 'Hindi, English',

        monthlyTargetAgencies: '25-50 Agencies',
        dailyActiveHours: '8+ Hours',
        focusRegion: 'Pan-India',
        strategyNotes: '',

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
                toast.error('Please specify previous platforms or companies managed.');
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
            toast.error('A valid, verified Referral Code from an Executive / Owner is required to apply.');
            return;
        }

        if (!formData.agreedToTerms) {
            toast.error('Please accept the BD Leader leadership code of conduct to submit.');
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
                role: 'bd-leader',
                referralCode: referral.code,
                documents: [
                    formData.adharFrontUrl ? { name: 'Aadhaar Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                    formData.adharBackUrl ? { name: 'Aadhaar Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                    formData.panCardUrl ? { name: 'PAN Card', documentType: 'PAN', url: formData.panCardUrl } : null,
                    formData.govtIdUrl ? { name: 'Government ID', documentType: 'GovtID', url: formData.govtIdUrl } : null,
                    formData.resumePdfUrl ? { name: 'Resume PDF', documentType: 'Resume', url: formData.resumePdfUrl } : null,
                    formData.experienceProofUrl ? { name: 'Leadership Proof', documentType: 'Certificate', url: formData.experienceProofUrl } : null,
                ].filter(Boolean),

                managedTeamSize: formData.managedTeamSize,
                previousPlatforms: formData.previousPlatforms,
                languagesSpoken: formData.languagesSpoken,
                monthlyTargetAgencies: formData.monthlyTargetAgencies,
                dailyActiveHours: formData.dailyActiveHours,
                focusRegion: formData.focusRegion,
                strategyNotes: formData.strategyNotes,
            };

            const res = await apiClient.post('/api/recruitment/bd-leader', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('BD Leader Application Submitted Successfully!');
                localStorage.removeItem('recruitment_draft_bd-leader');
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
            roleKey="bd-leader"
            roleTitle="BD Leader (Team Head) Application"
            roleSubtitle="Apply as a Regional Business Development Leader to head BD officers, recruit agency networks, and lead market expansion."
            badgeText="Executive BD Leadership Recruitment"
            themeGradient="from-slate-950 via-indigo-950 to-purple-950"
            accentColor="purple"
            steps={BD_LEADER_STEPS}
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
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Age</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => updateField('age', e.target.value)}
                                placeholder="28"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
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
                                placeholder="leader@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">WhatsApp / Phone Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Gender</label>
                            <select
                                value={formData.gender}
                                onChange={e => updateField('gender', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
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
                                placeholder="e.g. Delhi, Bangalore"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">State / Province</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={e => updateField('state', e.target.value)}
                                placeholder="e.g. Karnataka"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Step 2: Leadership Experience */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Leadership & Track Record</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Years in BD Leadership / Management</label>
                            <select
                                value={formData.experienceYears}
                                onChange={e => updateField('experienceYears', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="2-3 years" className="text-black">2 - 3 years</option>
                                <option value="3-5 years" className="text-black">3 - 5 years</option>
                                <option value="5-8 years" className="text-black">5 - 8 years</option>
                                <option value="8+ years" className="text-black">8+ years (Senior Executive)</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">BD Officers / Sub-Agents Managed</label>
                            <select
                                value={formData.managedTeamSize}
                                onChange={e => updateField('managedTeamSize', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="5-10 Members" className="text-black">5 - 10 Members</option>
                                <option value="10-25 BD Officers" className="text-black">10 - 25 BD Officers</option>
                                <option value="25-50 BD Officers" className="text-black">25 - 50 BD Officers</option>
                                <option value="50+ BD Officers" className="text-black">50+ BD Officers (Large Agency Network)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Streaming / Live Apps & Leadership History *</label>
                        <textarea
                            value={formData.previousPlatforms}
                            onChange={e => updateField('previousPlatforms', e.target.value)}
                            rows={3}
                            placeholder="e.g. Regional BD Lead at Bigo Live / Poppo Live / Chamet; managed 40+ agency partnerships..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Languages Spoken</label>
                        <input
                            type="text"
                            value={formData.languagesSpoken}
                            onChange={e => updateField('languagesSpoken', e.target.value)}
                            placeholder="e.g. Hindi, English, Tamil, Telugu"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Scaling & Strategy */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Scaling Capacity & Regional Strategy</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Monthly Agency Target Volume</label>
                            <select
                                value={formData.monthlyTargetAgencies}
                                onChange={e => updateField('monthlyTargetAgencies', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="15-25 Agencies" className="text-black">15 - 25 Agencies / Month</option>
                                <option value="25-50 Agencies" className="text-black">25 - 50 Agencies / Month</option>
                                <option value="50-100 Agencies" className="text-black">50 - 100 Agencies / Month</option>
                                <option value="100+ Agencies" className="text-black">100+ Agencies / Month</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Daily Active Working Hours</label>
                            <select
                                value={formData.dailyActiveHours}
                                onChange={e => updateField('dailyActiveHours', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="8+ Hours" className="text-black">8+ Hours (Full Leadership Focus)</option>
                                <option value="Full-Time Executive" className="text-black">Full-Time Executive & On-Call</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Target Geographic Region</label>
                            <select
                                value={formData.focusRegion}
                                onChange={e => updateField('focusRegion', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                            >
                                <option value="Pan-India" className="text-black">Pan-India (National Lead)</option>
                                <option value="North & West India" className="text-black">North & West India</option>
                                <option value="South India" className="text-black">South India</option>
                                <option value="East & North-East India" className="text-black">East & North-East India</option>
                                <option value="International / South Asia" className="text-black">International / South Asia</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Growth & Onboarding Strategy Outline</label>
                        <textarea
                            value={formData.strategyNotes}
                            onChange={e => updateField('strategyNotes', e.target.value)}
                            rows={3}
                            placeholder="Briefly describe how your BD team will recruit, onboard, and retain high-performing agencies..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Verification & Agreement */}
            {currentStep === 3 && (
                <div className="space-y-5">
                    <h3 className="text-lg font-bold text-white mb-2">4. Identity Verification & Credentials</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Aadhaar Front Copy</label>
                            <FileUpload
                                label="Upload Aadhaar Front"
                                name="adharFrontUrl"
                                value={formData.adharFrontUrl}
                                onChange={url => updateField('adharFrontUrl', url)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Aadhaar Back Copy</label>
                            <FileUpload
                                label="Upload Aadhaar Back"
                                name="adharBackUrl"
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
                                name="panCardUrl"
                                value={formData.panCardUrl}
                                onChange={url => updateField('panCardUrl', url)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Resume / Executive CV</label>
                            <FileUpload
                                label="Upload Resume"
                                name="resumePdfUrl"
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
                                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-400"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I confirm all provided executive and identity credentials are true and correct. I accept full responsibility for guiding and governing assigned BD officers and agency cohorts in accordance with Yaro App's institutional integrity policies.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function BdLeaderApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading BD Leader Form...</div>}>
            <BdLeaderFormContent />
        </Suspense>
    );
}
