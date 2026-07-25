'use client';

import { useState, Suspense } from 'react';
import { toast } from 'sonner';
import { RecruitmentFormLayout, FormStep } from '@/components/recruitment/RecruitmentFormLayout';
import { ReferralState } from '@/components/recruitment/ReferralBanner';
import { apiClient } from '@/lib/apiClient';

const AGENCY_STEPS: FormStep[] = [
    { id: 'business', title: 'Business Profile', description: 'Company & registration details' },
    { id: 'leadership', title: 'Agency Manager', description: 'Manager contact details' },
    { id: 'operations', title: 'Capacity & Payout', description: 'Hosts count and bank info' },
    { id: 'documents', title: 'Verification & Terms', description: 'Documents and agreement' },
];

function AgencyFormContent() {
    const [currentStep, setCurrentStep] = useState(0);
    const [referral, setReferral] = useState<ReferralState>({ code: '', isVerified: false, isLocked: false });

    const [formData, setFormData] = useState({
        businessName: '',
        registrationNo: '',
        businessAddress: '',
        city: '',
        country: 'India',

        managerName: '',
        email: '',
        phone: '',
        meethiLiveId: '',

        expectedHostCount: '10-25',
        targetMonthlyHours: '1000+',
        payoutUpiOrBank: '',

        panCopyUrl: '',
        addressProofUrl: '',
        managerPhotoUrl: '',
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
            if (!formData.businessName.trim() || !formData.businessAddress.trim() || !formData.city.trim()) {
                toast.error('Please enter Business Name, City, and Address.');
                return false;
            }
        } else if (currentStep === 1) {
            if (!formData.managerName.trim() || !formData.email.trim() || !formData.phone.trim()) {
                toast.error('Manager Name, Email, and Phone Number are required.');
                return false;
            }
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                toast.error('Please enter a valid email address.');
                return false;
            }
        } else if (currentStep === 2) {
            if (!formData.payoutUpiOrBank.trim()) {
                toast.error('Please specify your Payout UPI ID or Bank Details.');
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
            toast.error('You must accept the terms and agency policies to submit.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formData.businessName,
                email: formData.email,
                phone: formData.phone,
                role: 'agency',
                city: formData.city,
                country: formData.country,
                address: formData.businessAddress,
                referralCode: referral.code,
                documents: [
                    formData.panCopyUrl ? { name: 'PAN Copy', documentType: 'PAN', url: formData.panCopyUrl } : null,
                    formData.addressProofUrl ? { name: 'Address Proof', documentType: 'AddressProof', url: formData.addressProofUrl } : null,
                    formData.managerPhotoUrl ? { name: 'Manager Photo', documentType: 'Photo', url: formData.managerPhotoUrl } : null,
                ].filter(Boolean),

                // Role specific data
                businessName: formData.businessName,
                registrationNo: formData.registrationNo,
                managerName: formData.managerName,
                meethiLiveId: formData.meethiLiveId,
                expectedHostCount: formData.expectedHostCount,
                targetMonthlyHours: formData.targetMonthlyHours,
                payoutUpiOrBank: formData.payoutUpiOrBank,
            };

            const res = await apiClient.post('/api/recruitment/agency', payload);

            if (res.success && res.data) {
                setApplicationId(res.data.applicationId);
                setSuccess(true);
                toast.success('Agency Onboarding Application Submitted!');
                localStorage.removeItem('recruitment_draft_agency');
            } else {
                toast.error(res.message || 'Submission failed. Please check your data.');
            }
        } catch (error: any) {
            toast.error(error.message || 'Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <RecruitmentFormLayout
            roleKey="agency"
            roleTitle="Agency Recruitment Portal"
            roleSubtitle="Register your agency to onboard and manage live streaming talent on MithiChat."
            badgeText="Official Agency Partner Onboarding"
            themeGradient="from-slate-950 via-purple-950 to-indigo-950"
            accentColor="purple"
            steps={AGENCY_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            onReferralVerified={setReferral}
            onSubmit={handleSubmit}
            submitting={submitting}
            success={success}
            applicationId={applicationId}
            formData={formData}
        >
            {/* Step 1: Business Profile */}
            {currentStep === 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">1. Company & Business Details</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Agency / Business Name *</label>
                        <input
                            type="text"
                            value={formData.businessName}
                            onChange={e => updateField('businessName', e.target.value)}
                            placeholder="e.g. Royal Talent Management Agency"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">GST / Tax Registration No (Optional)</label>
                        <input
                            type="text"
                            value={formData.registrationNo}
                            onChange={e => updateField('registrationNo', e.target.value)}
                            placeholder="e.g. 27AAAAA0000A1Z5"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">City *</label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={e => updateField('city', e.target.value)}
                                placeholder="e.g. Mumbai"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => updateField('country', e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Full Office Address *</label>
                        <textarea
                            rows={3}
                            value={formData.businessAddress}
                            onChange={e => updateField('businessAddress', e.target.value)}
                            placeholder="Enter complete office or business address"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Manager & Contact */}
            {currentStep === 1 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">2. Agency Manager & Contact Info</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Agency Owner / Lead Manager Name *</label>
                        <input
                            type="text"
                            value={formData.managerName}
                            onChange={e => updateField('managerName', e.target.value)}
                            placeholder="Full Name of Manager"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Official Email Address *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => updateField('email', e.target.value)}
                                placeholder="agency@example.com"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-white/80 block mb-1">Mobile / WhatsApp Number *</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={e => updateField('phone', e.target.value)}
                                placeholder="+91 9876543210"
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Existing MithiChat ID (If available)</label>
                        <input
                            type="text"
                            value={formData.meethiLiveId}
                            onChange={e => updateField('meethiLiveId', e.target.value)}
                            placeholder="e.g. MITHI_AGY_99"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 3: Operational Capacity */}
            {currentStep === 2 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">3. Operational Capacity & Financials</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Expected Active Live Hosts Managed</label>
                        <select
                            value={formData.expectedHostCount}
                            onChange={e => updateField('expectedHostCount', e.target.value)}
                            className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                        >
                            <option value="5-10">5 - 10 Hosts</option>
                            <option value="10-25">10 - 25 Hosts</option>
                            <option value="25-50">25 - 50 Hosts</option>
                            <option value="50+">50+ Enterprise Hosts</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Target Monthly Streaming Hours</label>
                        <select
                            value={formData.targetMonthlyHours}
                            onChange={e => updateField('targetMonthlyHours', e.target.value)}
                            className="w-full bg-slate-900 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-purple-400"
                        >
                            <option value="500+">500+ Hours / Month</option>
                            <option value="1000+">1000+ Hours / Month</option>
                            <option value="2500+">2500+ Hours / Month</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Payout UPI ID / Bank Details *</label>
                        <input
                            type="text"
                            value={formData.payoutUpiOrBank}
                            onChange={e => updateField('payoutUpiOrBank', e.target.value)}
                            placeholder="e.g. agencyname@okaxis or HDFC Bank A/C: 501000..."
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                </div>
            )}

            {/* Step 4: Documents & Agreement */}
            {currentStep === 3 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-2">4. Documents & Terms Agreement</h3>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">PAN Card / Business Tax Document URL</label>
                        <input
                            type="url"
                            value={formData.panCopyUrl}
                            onChange={e => updateField('panCopyUrl', e.target.value)}
                            placeholder="https://drive.google.com/... or image link"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Address Proof / Electricity Bill URL</label>
                        <input
                            type="url"
                            value={formData.addressProofUrl}
                            onChange={e => updateField('addressProofUrl', e.target.value)}
                            placeholder="Document link"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/80 block mb-1">Manager Passport Photo URL</label>
                        <input
                            type="url"
                            value={formData.managerPhotoUrl}
                            onChange={e => updateField('managerPhotoUrl', e.target.value)}
                            placeholder="Photo link"
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/40 focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    <div className="pt-3">
                        <label className="flex items-start gap-3 cursor-pointer bg-white/5 p-4 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                            <input
                                type="checkbox"
                                checked={formData.agreedToTerms}
                                onChange={e => updateField('agreedToTerms', e.target.checked)}
                                className="w-5 h-5 mt-0.5 accent-purple-500 rounded"
                            />
                            <span className="text-xs text-white/80 leading-relaxed">
                                I confirm that all information provided above is accurate. I agree to comply with MithiChat Agency Partner guidelines, host management policies, and revenue settlement rules.
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </RecruitmentFormLayout>
    );
}

export default function AgencyApplyPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Agency Portal...</div>}>
            <AgencyFormContent />
        </Suspense>
    );
}
