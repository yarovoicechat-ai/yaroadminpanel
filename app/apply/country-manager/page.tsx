'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RoleCreateLayout, FormStep } from '@/components/role-create/RoleCreateLayout';
import { ReferralState } from '@/components/role-create/ReferralBanner';
import { FileUpload } from '@/components/role-create/FileUpload';
import { apiClient } from '@/lib/apiClient';

const COUNTRY_MANAGER_STEPS: FormStep[] = [
    { id: 'profile', title: 'Personal & Profile', description: 'National executive identity & contact details' },
    { id: 'territory', title: 'Country Territory & Scale', description: 'Assigned country & national expansion target' },
    { id: 'leadership', title: 'Leadership & References', description: 'Industry leadership background & references' },
    { id: 'verification', title: 'Credentials & Verification', description: 'Govt ID, resume, selfie & territory oath' },
];

function CountryManagerFormContent() {
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
        experienceYears: '5+ years',
        previousOrganizations: '',
        nationalTargets: '100+ Agencies, 1,000+ Active Hosts',
        languagesSpoken: 'English, Hindi, Regional',
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
            if (!formData.assignedCountry.trim()) {
                toast.error('Please specify your Assigned Country territory.');
                return false;
            }
            if (!formData.previousOrganizations.trim()) {
                toast.error('Please describe your previous organizational management background.');
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
            toast.error('A verified Referral Code from an Owner or Operator is required to apply.');
            return;
        }

        if (!formData.agreedToTerms) {
            toast.error('You must sign and accept the Regional Territory & Governance Agreement.');
            return;
        }

        try {
            setSubmitting(true);
            const documents = [
                formData.adharFrontUrl ? { name: 'Aadhaar / Govt ID Front', documentType: 'AdharFront', url: formData.adharFrontUrl } : null,
                formData.adharBackUrl ? { name: 'Aadhaar / Govt ID Back', documentType: 'AdharBack', url: formData.adharBackUrl } : null,
                formData.panCardUrl ? { name: 'PAN Card / Tax ID', documentType: 'PAN', url: formData.panCardUrl } : null,
                formData.govtIdUrl ? { name: 'Government ID', documentType: 'GovtID', url: formData.govtIdUrl } : null,
                formData.resumePdfUrl ? { name: 'Executive Resume / CV', documentType: 'Resume', url: formData.resumePdfUrl } : null,
                formData.selfieUrl ? { name: 'Selfie with ID Card', documentType: 'SelfieWithIdCard', url: formData.selfieUrl } : null,
                formData.experienceProofUrl ? { name: 'Leadership Proof / Credentials', documentType: 'Certificate', url: formData.experienceProofUrl } : null,
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
                state: formData.state,
                district: formData.district,
                country: formData.assignedCountry || formData.country,
                fullAddress: formData.fullAddress,
                experienceYears: formData.experienceYears,
                role: 'country-manager',
                referralCode: referral.code,
                documents,

                assignedCountry: formData.assignedCountry,
                previousOrganizations: formData.previousOrganizations,
                nationalTargets: formData.nationalTargets,
                languagesSpoken: formData.languagesSpoken,
                strategyNotes: formData.strategyNotes,
                reference1: formData.reference1,
                reference2: formData.reference2,
                previousLeadershipRole: formData.previousLeadershipRole,
            };

            const res = await apiClient.post('/api/recruitment/country-manager', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId || 'Submitted');
                setSuccess(true);
                toast.success('Country Manager Application Submitted Successfully!');
                localStorage.removeItem('recruitment_draft_country-manager');
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
            roleKey="country-manager"
            roleTitle="Country Manager Application Portal"
            roleSubtitle="Apply for National / Country-level platform governance and regional territory expansion."
            badgeText="National Leadership Clearance"
            themeGradient="from-slate-950 via-indigo-950 to-slate-950"
            accentColor="indigo"
            steps={COUNTRY_MANAGER_STEPS}
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
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Yaro / Meethi User ID (Optional)</label>
                            <input
                                type="text"
                                value={formData.yaroId}
                                onChange={e => updateField('yaroId', e.target.value)}
                                placeholder="e.g. 10002891"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Age *</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={e => updateField('age', e.target.value)}
                                placeholder="e.g. 28"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Gender *</label>
                            <select
                                value={formData.gender}
                                onChange={e => updateField('gender', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-400"
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
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Mobile / WhatsApp Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 98765 43210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Country of Residence *</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => updateField('country', e.target.value)}
                                placeholder="India"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">State / Province *</label>
                            <input
                                type="text"
                                value={formData.state}
                                onChange={e => updateField('state', e.target.value)}
                                placeholder="e.g. Maharashtra"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">District / Region</label>
                            <input
                                type="text"
                                value={formData.district}
                                onChange={e => updateField('district', e.target.value)}
                                placeholder="e.g. Mumbai"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. Mumbai"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
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
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Country Territory & Scale Targets */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Country Territory & Operational Scope</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Assigned Country Territory *</label>
                            <input
                                type="text"
                                value={formData.assignedCountry}
                                onChange={e => updateField('assignedCountry', e.target.value)}
                                placeholder="e.g. India / Nepal / Bangladesh"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                            <p className="text-xs text-white/50 mt-1">Country Managers are authorized to recruit State Managers, BD Leaders, Agencies & Hosts strictly within this country.</p>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Executive Management Experience *</label>
                            <select
                                value={formData.experienceYears}
                                onChange={e => updateField('experienceYears', e.target.value)}
                                className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-400"
                            >
                                <option value="2-3 years">2-3 years</option>
                                <option value="3-5 years">3-5 years</option>
                                <option value="5+ years">5+ years</option>
                                <option value="8+ years">8+ years Executive Experience</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Platforms & Companies Managed *</label>
                        <textarea
                            value={formData.previousOrganizations}
                            onChange={e => updateField('previousOrganizations', e.target.value)}
                            rows={3}
                            placeholder="Detail your background in audio live streaming, agency operations, or regional marketing leadership..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Projected Monthly Target / Expansion Scope</label>
                            <input
                                type="text"
                                value={formData.nationalTargets}
                                onChange={e => updateField('nationalTargets', e.target.value)}
                                placeholder="e.g. 50 State Managers, 200 Agencies, 2,000 Hosts"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Languages Spoken & Managed</label>
                            <input
                                type="text"
                                value={formData.languagesSpoken}
                                onChange={e => updateField('languagesSpoken', e.target.value)}
                                placeholder="Hindi, English, etc."
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Territory Growth Strategy & Vision</label>
                        <textarea
                            value={formData.strategyNotes}
                            onChange={e => updateField('strategyNotes', e.target.value)}
                            rows={2}
                            placeholder="Briefly describe how you plan to scale the creator ecosystem and live audio rooms across your country..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
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
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Professional Reference 2 (Name, Title, Contact)</label>
                            <input
                                type="text"
                                value={formData.reference2}
                                onChange={e => updateField('reference2', e.target.value)}
                                placeholder="Name, Role, Company, Phone/Email"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Previous Leadership / Managerial Role</label>
                        <input
                            type="text"
                            value={formData.previousLeadershipRole}
                            onChange={e => updateField('previousLeadershipRole', e.target.value)}
                            placeholder="e.g. Country Operations Lead at AudioLive"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-indigo-400"
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
                            label="PAN Card / Tax Clearance Document"
                            value={formData.panCardUrl}
                            onChange={url => updateField('panCardUrl', url)}
                        />
                        <FileUpload
                            label="Executive Resume / CV (PDF/DOC) *"
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

                    <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 text-xs text-white/80 space-y-2">
                        <h4 className="font-bold text-indigo-300 uppercase tracking-wide">National Territory Oath & Terms:</h4>
                        <p>1. As a Country Manager, I understand that my administrative and recruitment jurisdiction is strictly limited to my assigned country territory.</p>
                        <p>2. I will oversee and support State Managers, BD Leaders, Agencies, and Hosts within this territory with high integrity and governance standards.</p>
                        <p>3. Any violation of platform guidelines, illegal recruitment, or territory breach will result in immediate suspension and revocation of administrative powers.</p>
                    </div>

                    <label className="flex items-start gap-3 text-xs text-white/90 cursor-pointer pt-2">
                        <input
                            type="checkbox"
                            checked={formData.agreedToTerms}
                            onChange={e => updateField('agreedToTerms', e.target.checked)}
                            className="mt-0.5 rounded border-white/20 bg-white/10 text-indigo-500 focus:ring-indigo-400"
                        />
                        <span>I hereby solemnly declare that all information provided is authentic. I agree to the Yaro Country Manager Governance Code and National Territory Terms. *</span>
                    </label>
                </div>
            )}
        </RoleCreateLayout>
    );
}

export default function CountryManagerApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Country Manager Application...</div>}>
            <CountryManagerFormContent />
        </Suspense>
    );
}
